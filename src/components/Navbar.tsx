'use client';
import Link from 'next/link';
import { ChangeEvent, FormEvent, useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import { createClient } from '@/lib/supabase/client';
import { REGISTRATION_EMAIL_UNSUPPORTED_MESSAGE, isSupportedRegistrationEmail } from '@/lib/registration-email';

type NavUser = {
  id?: string;
  name: string;
  email?: string | null;
  avatar_url: string | null;
};

type ProfileDraft = {
  display_name: string;
  bio: string;
  avatar_url: string | null;
};

type ProfileNotice = {
  type: 'success' | 'error' | 'info';
  text: string;
} | null;

const navLinks = [
  { label: '首页', href: '/' },
  { label: '文章', href: '/articles' },
  { label: '软件', href: '/software' },
  { label: '分类', href: '/categories' },
  { label: '关于', href: '/about' },
  { label: '联系', href: '/contact' },
];

const achievements = [
  { title: '软件达人', desc: '分享了 50+ 款优质软件', textColor: 'text-violet-300', bgColor: 'bg-violet-500/20' },
  { title: 'AI 探索者', desc: '持续关注 AI 领域 100 天', textColor: 'text-blue-300', bgColor: 'bg-blue-500/20' },
  { title: '连续签到30天', desc: '坚持就是胜利!', textColor: 'text-amber-300', bgColor: 'bg-amber-500/20' },
];

const levelThresholds = [0, 300, 800, 1500, 2500, 3800, 5400, 7200, 9000] as const;
const profileLevel = 8;
const levelStartXp = levelThresholds[profileLevel - 1];
const levelNextXp = levelThresholds[profileLevel];
const levelCurrentXp = levelStartXp + Math.round((levelNextXp - levelStartXp) * 0.8);
const levelProgressPercent = Math.round(((levelCurrentXp - levelStartXp) / (levelNextXp - levelStartXp)) * 100);

const removeCacheBust = (url: string | null) => url ? url.replace(/([?&])t=\d+$/, '') : null;
const avatarExtensions = ['png', 'jpg', 'jpeg', 'webp'] as const;

const getStoredAvatarCandidates = (userId: string | null | undefined) => {
  const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.trim().replace(/\/$/, '');
  if (!baseUrl || !userId) return [];
  return avatarExtensions.map(ext => `${baseUrl}/avatars/${userId}.${ext}`);
};

const getErrorText = (error: unknown, fallback: string) => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error && 'message' in error) {
    return String((error as { message?: unknown }).message || fallback);
  }
  return fallback;
};

const getNoticeClass = (type: NonNullable<ProfileNotice>['type']) => (
  type === 'error'
    ? 'border-rose-300/25 bg-rose-500/10 text-rose-200'
    : type === 'info'
      ? 'border-cyan-300/25 bg-cyan-500/10 text-cyan-200'
      : 'border-emerald-300/25 bg-emerald-500/10 text-emerald-200'
);

const loadAvatar = (src: string | null | undefined, timeoutMs = 1200) => new Promise<boolean>((resolve) => {
  if (!src || typeof window === 'undefined') {
    resolve(false);
    return;
  }
  let settled = false;
  const finish = (loaded: boolean) => {
    if (settled) return;
    settled = true;
    window.clearTimeout(timer);
    resolve(loaded);
  };
  const timer = window.setTimeout(() => finish(false), timeoutMs);
  const image = new window.Image();
  image.onload = () => finish(true);
  image.onerror = () => finish(false);
  image.src = src;
});

const preloadAvatar = async (src: string | null | undefined, timeoutMs = 1200) => {
  await loadAvatar(src, timeoutMs);
};

const resolveAvatarUrl = async (nextUser: NavUser | null | undefined, timeoutMs = 900) => {
  if (!nextUser) return null;
  if (nextUser.avatar_url && await loadAvatar(nextUser.avatar_url, timeoutMs)) return nextUser.avatar_url;
  for (const candidate of getStoredAvatarCandidates(nextUser.id)) {
    if (candidate === nextUser.avatar_url) continue;
    if (await loadAvatar(candidate, timeoutMs)) return candidate;
  }
  return nextUser.avatar_url || null;
};

const getOptimisticAvatarUrl = (nextUser: NavUser | null | undefined) => (
  nextUser?.avatar_url || getStoredAvatarCandidates(nextUser?.id)[0] || null
);

const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number, fallback: T) => new Promise<T>((resolve) => {
  if (typeof window === 'undefined') {
    promise.then(resolve).catch(() => resolve(fallback));
    return;
  }
  let settled = false;
  const finish = (value: T) => {
    if (settled) return;
    settled = true;
    window.clearTimeout(timer);
    resolve(value);
  };
  const timer = window.setTimeout(() => finish(fallback), timeoutMs);
  promise.then(finish).catch(() => finish(fallback));
});

export default function Navbar({ initialUser = null }: { initialUser?: NavUser | null }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerCardScale, setDrawerCardScale] = useState(1);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<NavUser | null>(initialUser);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingSecurity, setEditingSecurity] = useState(false);
  const [profileDraft, setProfileDraft] = useState<ProfileDraft>({ display_name: '', bio: '', avatar_url: null });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [failedAvatarUrls, setFailedAvatarUrls] = useState<string[]>([]);
  const [profileNotice, setProfileNotice] = useState<ProfileNotice>(null);
  const [emailDraft, setEmailDraft] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [emailCodeSentTo, setEmailCodeSentTo] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordCode, setPasswordCode] = useState('');
  const [passwordCodeSent, setPasswordCodeSent] = useState(false);
  const [sendingEmailCode, setSendingEmailCode] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [sendingPasswordCode, setSendingPasswordCode] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const drawerCardRef = useRef<HTMLDivElement>(null);
  const profileFileInputRef = useRef<HTMLInputElement>(null);

  const applyResolvedAvatar = async (nextUser: NavUser | null | undefined, timeoutMs = 900) => {
    const nextAvatarUrl = await resolveAvatarUrl(nextUser, timeoutMs);
    if (nextAvatarUrl && nextAvatarUrl !== nextUser?.avatar_url) {
      setUser(prev => prev && (!nextUser?.id || !prev.id || prev.id === nextUser.id) ? { ...prev, id: prev.id || nextUser?.id, avatar_url: nextAvatarUrl } : prev);
    }
    return nextAvatarUrl;
  };

  const syncDrawerProfile = async () => {
    if (!user) return null;
    try {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return null;
      const { data } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', authUser.id)
        .maybeSingle();
      if (!data) return null;
      const nextUser: NavUser = {
        ...user,
        id: authUser.id,
        name: data.display_name || user.name,
        avatar_url: data.avatar_url || user.avatar_url,
      };
      setUser(prev => prev ? {
        ...prev,
        id: prev.id || authUser.id,
        name: data.display_name || prev.name,
        avatar_url: data.avatar_url || prev.avatar_url,
      } : nextUser);
      return nextUser;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    fetch('/api/auth/user', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        if (!d.user) return;
        setUser(d.user);
        void applyResolvedAvatar(d.user);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.avatar_url) void preloadAvatar(user.avatar_url);
  }, [user?.avatar_url]);

  useEffect(() => {
    if (!user || editingProfile || editingSecurity) return;
    setProfileDraft({ display_name: user.name, bio: '', avatar_url: user.avatar_url });
  }, [user, editingProfile, editingSecurity]);

  useEffect(() => {
    if (!user?.email || editingSecurity) return;
    setEmailDraft(user.email);
  }, [user?.email, editingSecurity]);

  useEffect(() => {
    if (drawerOpen) return;
    setEditingProfile(false);
    setEditingSecurity(false);
    setProfileNotice(null);
    setEmailCode('');
    setEmailCodeSentTo('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordCode('');
    setPasswordCodeSent(false);
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen || !user) return;
    let ignore = false;
    syncDrawerProfile().then(() => {
      if (ignore) return;
    });
    return () => { ignore = true; };
  }, [drawerOpen]);

  useLayoutEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    const previousHtmlOverflowY = document.documentElement.style.overflowY;
    const previousBodyOverflowY = document.body.style.overflowY;
    const previousDrawerScrollbarWidth = document.body.style.getPropertyValue('--drawer-scrollbar-width');
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.classList.add('drawer-scroll-lock');
    document.body.classList.add('drawer-scroll-lock');
    document.body.style.setProperty('--drawer-scrollbar-width', `${scrollbarWidth}px`);
    document.documentElement.style.overflowY = 'hidden';
    document.body.style.overflowY = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.documentElement.classList.remove('drawer-scroll-lock');
      document.body.classList.remove('drawer-scroll-lock');
      if (previousDrawerScrollbarWidth) {
        document.body.style.setProperty('--drawer-scrollbar-width', previousDrawerScrollbarWidth);
      } else {
        document.body.style.removeProperty('--drawer-scrollbar-width');
      }
      document.documentElement.style.overflowY = previousHtmlOverflowY;
      document.body.style.overflowY = previousBodyOverflowY;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [drawerOpen]);

  useLayoutEffect(() => {
    if (!drawerOpen) {
      setDrawerCardScale(1);
      return;
    }

    const fitCard = () => {
      const card = drawerCardRef.current;
      if (!card) return;
      const currentTransform = card.style.transform;
      card.style.transform = 'none';
      const naturalHeight = Math.max(card.scrollHeight, card.getBoundingClientRect().height);
      card.style.transform = currentTransform;
      const availableHeight = Math.max(360, window.innerHeight - 32);
      const nextScale = Math.min(1, availableHeight / naturalHeight);
      setDrawerCardScale(Number(nextScale.toFixed(3)));
    };

    const frame = window.requestAnimationFrame(fitCard);
    const resizeObserver = new ResizeObserver(fitCard);
    if (drawerCardRef.current) resizeObserver.observe(drawerCardRef.current);
    window.addEventListener('resize', fitCard);
    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener('resize', fitCard);
    };
  }, [drawerOpen, editingProfile, editingSecurity, profileLoading, profileNotice, profileDraft.display_name, profileDraft.bio, emailDraft, emailCode, newPassword, confirmPassword, passwordCode]);

  useEffect(() => {
    if (!searchOpen) return;
    searchInputRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSearchOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) return;
      if (!searchWrapRef.current?.contains(event.target)) setSearchOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [searchOpen]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setDrawerOpen(false);
    router.push('/');
    router.refresh();
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearchOpen(false);
    setMenuOpen(false);
    router.push('/software?search=' + encodeURIComponent(q));
  };

  const openProfileEditor = async () => {
    if (!user) return;
    const currentAvatarUrl = await applyResolvedAvatar(user, 900) || user.avatar_url;
    setEditingProfile(true);
    setProfileNotice(null);
    setProfileLoading(true);
    setProfileDraft({ display_name: user.name, bio: '', avatar_url: currentAvatarUrl });

    try {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('登录状态已失效，请重新登录');

      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, bio, avatar_url')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error) throw error;

      const nextAvatarUrl = await resolveAvatarUrl({ ...user, avatar_url: data?.avatar_url || currentAvatarUrl }, 900);
      await preloadAvatar(nextAvatarUrl, 900);
      setProfileDraft({
        display_name: data?.display_name || user.name,
        bio: data?.bio || '',
        avatar_url: nextAvatarUrl,
      });
    } catch (error) {
      setProfileNotice({ type: 'error', text: getErrorText(error, '资料读取失败') });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    setProfileNotice(null);

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await fetch('/api/auth/upload-avatar', { method: 'POST', body: formData });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || '头像上传失败');

      const previewUrl = `${data.url}?t=${Date.now()}`;
      setProfileDraft(prev => ({ ...prev, avatar_url: previewUrl }));
      setUser(prev => prev ? { ...prev, avatar_url: previewUrl } : prev);
      setProfileNotice({ type: 'success', text: '头像已更新' });
      router.refresh();
    } catch (error) {
      setProfileNotice({ type: 'error', text: getErrorText(error, '头像上传失败') });
    } finally {
      setAvatarUploading(false);
      if (profileFileInputRef.current) profileFileInputRef.current.value = '';
    }
  };

  const handleProfileSave = async () => {
    setProfileSaving(true);
    setProfileNotice(null);

    try {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('登录状态已失效，请重新登录');

      const displayName = profileDraft.display_name.trim();
      const cleanAvatarUrl = removeCacheBust(profileDraft.avatar_url || user?.avatar_url || null);
      const profilePayload: {
        id: string;
        display_name: string | null;
        bio: string | null;
        avatar_url?: string;
        updated_at: string;
      } = {
        id: authUser.id,
        display_name: displayName || null,
        bio: profileDraft.bio.trim() || null,
        updated_at: new Date().toISOString(),
      };
      if (cleanAvatarUrl) profilePayload.avatar_url = cleanAvatarUrl;

      const { error } = await supabase.from('profiles').upsert(profilePayload, { onConflict: 'id' });

      if (error) throw error;

      const nextName = displayName || authUser.email?.split('@')[0] || 'User';
      setUser(prev => prev ? { ...prev, name: nextName, avatar_url: cleanAvatarUrl || prev.avatar_url } : {
        id: authUser.id,
        name: nextName,
        email: authUser.email,
        avatar_url: cleanAvatarUrl,
      });
      setEditingProfile(false);
      router.refresh();
    } catch (error) {
      setProfileNotice({ type: 'error', text: getErrorText(error, '资料保存失败') });
    } finally {
      setProfileSaving(false);
    }
  };

  const parseApiError = async (res: Response, fallback: string) => {
    try {
      const data = await res.json() as { error?: string };
      return data.error || fallback;
    } catch {
      return fallback;
    }
  };

  const openSecurityEditor = () => {
    setEditingSecurity(true);
    setProfileNotice(null);
    setEmailDraft('');
    setEmailCode('');
    setEmailCodeSentTo('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordCode('');
    setPasswordCodeSent(false);
  };

  const handleSendEmailCode = async () => {
    if (!user) return;
    const nextEmail = emailDraft.trim().toLowerCase();

    if (!nextEmail) {
      setProfileNotice({ type: 'error', text: '请输入新邮箱' });
      return;
    }
    if (!isSupportedRegistrationEmail(nextEmail)) {
      setProfileNotice({ type: 'error', text: REGISTRATION_EMAIL_UNSUPPORTED_MESSAGE });
      return;
    }
    if (nextEmail === user.email?.toLowerCase()) {
      setProfileNotice({ type: 'info', text: '新邮箱不能和当前邮箱相同' });
      return;
    }

    setSendingEmailCode(true);
    setProfileNotice(null);

    const res = await fetch('/api/auth/security-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'email', email: nextEmail }),
    });

    setSendingEmailCode(false);

    if (!res.ok) {
      setProfileNotice({ type: 'error', text: await parseApiError(res, '验证码发送失败') });
      return;
    }

    setEmailCode('');
    setEmailCodeSentTo(nextEmail);
    setProfileNotice({ type: 'success', text: '验证码已发送到新邮箱' });
  };

  const handleEmailUpdate = async () => {
    const nextEmail = emailDraft.trim().toLowerCase();
    if (!emailCodeSentTo || emailCodeSentTo !== nextEmail) {
      setProfileNotice({ type: 'error', text: '请先发送新邮箱验证码' });
      return;
    }
    if (emailCode.length !== 6) {
      setProfileNotice({ type: 'error', text: '请输入 6 位邮箱验证码' });
      return;
    }

    setSavingEmail(true);
    setProfileNotice(null);

    const res = await fetch('/api/auth/security-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'email', email: nextEmail, code: emailCode }),
    });

    setSavingEmail(false);

    if (!res.ok) {
      setProfileNotice({ type: 'error', text: await parseApiError(res, '邮箱更新失败') });
      return;
    }

    setUser(prev => prev ? { ...prev, email: nextEmail } : prev);
    setEmailCode('');
    setEmailCodeSentTo('');
    setProfileNotice({ type: 'success', text: '邮箱已更换' });
    router.refresh();
  };

  const handleOpenDrawer = () => {
    setMenuOpen(false);
    setDrawerOpen(true);
    void (async () => {
      const syncedUser = await withTimeout(syncDrawerProfile(), 1000, null);
      const nextUser = syncedUser || user;
      void applyResolvedAvatar(nextUser, 900);
    })();
  };

  const handleSendPasswordCode = async () => {
    if (!user?.email) return;
    if (!newPassword || !confirmPassword) {
      setProfileNotice({ type: 'error', text: '请输入并确认新密码' });
      return;
    }
    if (newPassword.length < 6) {
      setProfileNotice({ type: 'error', text: '新密码至少需要 6 个字符' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setProfileNotice({ type: 'error', text: '两次输入的密码不一致' });
      return;
    }

    setSendingPasswordCode(true);
    setProfileNotice(null);

    const res = await fetch('/api/auth/security-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'password' }),
    });

    setSendingPasswordCode(false);

    if (!res.ok) {
      setProfileNotice({ type: 'error', text: await parseApiError(res, '验证码发送失败') });
      return;
    }

    setPasswordCode('');
    setPasswordCodeSent(true);
    setProfileNotice({ type: 'success', text: '验证码已发送到当前邮箱' });
  };

  const handlePasswordUpdate = async () => {
    if (!passwordCodeSent) {
      setProfileNotice({ type: 'error', text: '请先发送密码验证码' });
      return;
    }
    if (passwordCode.length !== 6) {
      setProfileNotice({ type: 'error', text: '请输入 6 位邮箱验证码' });
      return;
    }

    setSavingPassword(true);
    setProfileNotice(null);

    const res = await fetch('/api/auth/security-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'password', password: newPassword, code: passwordCode }),
    });

    setSavingPassword(false);

    if (!res.ok) {
      setProfileNotice({ type: 'error', text: await parseApiError(res, '密码修改失败') });
      return;
    }

    setNewPassword('');
    setConfirmPassword('');
    setPasswordCode('');
    setPasswordCodeSent(false);
    setProfileNotice({ type: 'success', text: '密码已修改' });
  };

  const activeDisplayName = editingProfile || editingSecurity ? (profileDraft.display_name.trim() || user?.name || 'User') : (user?.name || 'User');
  const displayAvatarUrl = editingProfile || editingSecurity ? (profileDraft.avatar_url || getOptimisticAvatarUrl(user)) : getOptimisticAvatarUrl(user);
  const activeAvatarUrl = displayAvatarUrl && !failedAvatarUrls.includes(displayAvatarUrl) ? displayAvatarUrl : null;
  const handleAvatarError = () => {
    if (!displayAvatarUrl) return;
    setFailedAvatarUrls(prev => prev.includes(displayAvatarUrl) ? prev : [...prev, displayAvatarUrl]);
  };
  const initial = activeDisplayName.charAt(0).toUpperCase() || 'U';

  return (
    <>
    <div className={"glass-nav fixed top-0 left-0 right-0 z-50 flex flex-col " + (scrolled ? "shadow-sm" : "")}>
      <header className="h-14 flex items-center">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-lg font-bold tracking-tight text-[var(--accent)]">OwenFX</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href}
                className="px-3 py-1.5 text-sm rounded-full transition-all duration-200 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className={"nav-actions flex items-center gap-2 " + (searchOpen ? "nav-actions-search-open" : "")}>
            <div ref={searchWrapRef} className="nav-search-slot flex items-center">
              {!searchOpen ? (
                <button type="button" aria-label="搜索" aria-expanded={searchOpen}
                  onClick={() => setSearchOpen(true)}
                  className="nav-icon-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" />
                    <line x1="16.5" y1="16.5" x2="21" y2="21" />
                  </svg>
                </button>
              ) : (
                <form onSubmit={handleSearch} className="nav-search-capsule nav-search-capsule-inline animate-fade-in">
                  <input ref={searchInputRef} value={searchQuery} onChange={event => setSearchQuery(event.target.value)}
                    type="search" placeholder="搜索文章 » 软件" aria-label="搜索文章或软件"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-tertiary)]" />
                  <button type="submit" aria-label="提交搜索" className="nav-search-submit">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <circle cx="11" cy="11" r="7" />
                      <line x1="16.5" y1="16.5" x2="21" y2="21" />
                    </svg>
                  </button>
                </form>
              )}
            </div>
            <ThemeToggle />
            {user ? (
              <button type="button" aria-label="打开用户卡片" aria-expanded={drawerOpen}
                onClick={handleOpenDrawer}
                className="nav-star-btn">
                <svg className="six-star-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3 20 17H4L12 3Z" />
                  <path d="M12 21 4 7h16l-8 14Z" />
                </svg>
              </button>
            ) : (
              <Link href="/auth/login" aria-label="登录"
                className="nav-star-btn">
                <svg className="six-star-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3 20 17H4L12 3Z" />
                  <path d="M12 21 4 7h16l-8 14Z" />
                </svg>
              </Link>
            )}
            <button className={"md:hidden w-9 h-9 flex items-center justify-center rounded-lg transition-all " + (menuOpen ? "bg-[var(--bg-tertiary)]" : "")}
              style={{ color: "var(--text-secondary)" }}
              onClick={() => setMenuOpen(!menuOpen)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {menuOpen ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
              </svg>
            </button>
          </div>
        </div>
      </header>
      {menuOpen && (
        <div className="md:hidden animate-fade-in border-t border-[var(--border-color)] shadow-lg">
          <nav className="flex flex-col p-4 gap-1">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                className="px-4 py-2.5 text-sm rounded-lg transition-all text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
      {user && drawerOpen && (
        <div className="user-drawer-layer fixed inset-0 z-[60] overflow-hidden overscroll-none">
          <button type="button" aria-label="关闭用户卡片" className="fixed inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <aside className="user-drawer-panel relative z-10 ml-auto flex h-[100dvh] w-[min(92vw,390px)] items-center justify-center overflow-hidden border-l border-white/15 bg-[#050a16]/95 p-3 shadow-[-24px_0_70px_rgba(2,6,23,0.65)] animate-slide-in-right sm:p-4">
            <div ref={drawerCardRef} style={{ transform: `scale(${drawerCardScale})`, transformOrigin: 'center center' }} className="user-drawer-card relative w-full overflow-hidden rounded-[24px] border border-indigo-200/35 bg-[radial-gradient(circle_at_30%_8%,rgba(168,85,247,0.22),transparent_32%),radial-gradient(circle_at_92%_18%,rgba(56,189,248,0.18),transparent_26%),linear-gradient(145deg,rgba(30,41,75,0.86),rgba(6,13,29,0.96))] px-4 pb-4 pt-7 shadow-[0_0_60px_rgba(99,102,241,0.22)] transition-transform duration-150 sm:px-5">
              <button type="button" aria-label="关闭" onClick={() => setDrawerOpen(false)}
                className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-indigo-200/20 bg-indigo-400/15 text-indigo-200 shadow-[0_0_30px_rgba(129,140,248,0.25)] transition hover:bg-indigo-400/25 hover:text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {editingSecurity ? (
                <>
                  <button type="button" aria-label="返回编辑资料" onClick={() => { setEditingSecurity(false); setProfileNotice(null); }}
                    className="drawer-side-action" title="返回编辑资料">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </button>

                  <div className="mb-4 text-center">
                    <p className="text-sm font-semibold text-cyan-200">账号安全</p>
                    <h2 className="mt-1 truncate text-3xl font-bold text-white">邮箱与密码</h2>
                    {user.email && <p className="mt-1 truncate text-xs text-slate-500">{user.email}</p>}
                  </div>

                  <div className="space-y-4">
                    <section className="rounded-[20px] border border-white/10 bg-slate-950/25 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                      <div className="mb-3 flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-200/20 bg-cyan-400/10 text-cyan-200">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect width="20" height="16" x="2" y="4" rx="2" />
                            <path d="m22 7-10 6L2 7" />
                          </svg>
                        </span>
                        <div className="min-w-0 text-left">
                          <h3 className="truncate text-base font-semibold text-white">更换邮箱</h3>
                          <p className="truncate text-xs text-slate-400">验证码发送到新邮箱。</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="grid grid-cols-[1fr_auto] gap-2">
                          <input type="email" value={emailDraft}
                            onChange={event => { setEmailDraft(event.target.value); setEmailCodeSentTo(''); setEmailCode(''); }}
                            className="drawer-profile-input"
                            placeholder="输入新邮箱" />
                          <button type="button" onClick={handleSendEmailCode} disabled={sendingEmailCode || savingEmail}
                            className="uiverse-btn uiverse-btn-ghost !px-3 !py-2.5 text-xs">
                            {sendingEmailCode ? '发送中' : '发验证码'}
                          </button>
                        </div>
                        <div className="grid grid-cols-[1fr_auto] gap-2">
                          <input inputMode="numeric" value={emailCode}
                            onChange={event => setEmailCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                            className={`drawer-profile-input ${emailCode ? 'text-center tracking-[6px]' : ''}`}
                            placeholder="输入验证码" />
                          <button type="button" onClick={handleEmailUpdate} disabled={savingEmail || sendingEmailCode}
                            className="uiverse-btn uiverse-btn-primary !px-3 !py-2.5 text-xs">
                            {savingEmail ? '确认中' : '确认更换'}
                          </button>
                        </div>
                      </div>
                    </section>

                    <section className="rounded-[20px] border border-white/10 bg-slate-950/25 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                      <div className="mb-3 flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-200/20 bg-amber-400/10 text-amber-200">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect width="16" height="11" x="4" y="11" rx="2" />
                            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                          </svg>
                        </span>
                        <div className="min-w-0 text-left">
                          <h3 className="truncate text-base font-semibold text-white">修改密码</h3>
                          <p className="truncate text-xs text-slate-400">验证码发送到当前邮箱。</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <input type="password" value={newPassword}
                            onChange={event => { setNewPassword(event.target.value); setPasswordCodeSent(false); setPasswordCode(''); }}
                            className="drawer-profile-input"
                            placeholder="新密码" />
                          <input type="password" value={confirmPassword}
                            onChange={event => { setConfirmPassword(event.target.value); setPasswordCodeSent(false); setPasswordCode(''); }}
                            className="drawer-profile-input"
                            placeholder="确认密码" />
                        </div>
                        <div className="grid grid-cols-[1fr_auto_auto] gap-2">
                          <input inputMode="numeric" value={passwordCode}
                            onChange={event => setPasswordCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                            className={`drawer-profile-input ${passwordCode ? 'text-center tracking-[6px]' : ''}`}
                            placeholder="输入验证码" />
                          <button type="button" onClick={handleSendPasswordCode} disabled={sendingPasswordCode || savingPassword}
                            className="uiverse-btn uiverse-btn-ghost !px-3 !py-2.5 text-xs">
                            {sendingPasswordCode ? '发送中' : '发验证码'}
                          </button>
                          <button type="button" onClick={handlePasswordUpdate} disabled={savingPassword || sendingPasswordCode}
                            className="uiverse-btn uiverse-btn-primary !px-3 !py-2.5 text-xs">
                            {savingPassword ? '修改中' : '确认'}
                          </button>
                        </div>
                      </div>
                    </section>
                  </div>

                  {profileNotice && (
                    <div className={`mt-4 rounded-2xl border px-3 py-2 text-sm ${getNoticeClass(profileNotice.type)}`}>
                      {profileNotice.text}
                    </div>
                  )}
                </>
              ) : editingProfile ? (
                <>
                  <button type="button" aria-label="打开账号安全" onClick={openSecurityEditor}
                    className="drawer-side-action" title="账号安全">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect width="16" height="11" x="4" y="11" rx="2" />
                      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                    </svg>
                  </button>

                  <div className="mb-3 text-center">
                    <p className="text-sm font-semibold text-cyan-200">编辑资料</p>
                    <h2 className="mt-1 truncate text-3xl font-bold text-white">{activeDisplayName}</h2>
                    {user.email && <p className="mt-1 truncate text-xs text-slate-500">{user.email}</p>}
                  </div>

                  <button type="button" onClick={() => profileFileInputRef.current?.click()} disabled={avatarUploading}
                    className="group relative mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full bg-[linear-gradient(135deg,#c084fc,#6366f1,#38bdf8)] p-1.5 shadow-[0_0_36px_rgba(129,140,248,0.65)] transition hover:scale-[1.02] disabled:cursor-wait sm:h-32 sm:w-32">
                    <span className="h-full w-full overflow-hidden rounded-full bg-slate-800">
                      {activeAvatarUrl ? (
                        <img src={activeAvatarUrl} alt="avatar" loading="eager" decoding="sync" onError={handleAvatarError} className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-4xl font-bold text-white">
                          {initial}
                        </span>
                      )}
                    </span>
                    <span className="absolute bottom-2 rounded-full border border-white/15 bg-black/45 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                      {avatarUploading ? '上传中...' : '更换头像'}
                    </span>
                  </button>
                  <input ref={profileFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleProfileAvatarUpload} disabled={avatarUploading} />

                  <div className="space-y-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-400">昵称</label>
                      <input value={profileDraft.display_name}
                        onChange={event => setProfileDraft(prev => ({ ...prev, display_name: event.target.value }))}
                        disabled={profileLoading || profileSaving}
                        className="drawer-profile-input"
                        placeholder="设置你的用户名" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-400">简介</label>
                      <textarea value={profileDraft.bio}
                        onChange={event => setProfileDraft(prev => ({ ...prev, bio: event.target.value }))}
                        disabled={profileLoading || profileSaving}
                        className="drawer-profile-input h-20 resize-none leading-5"
                        placeholder="介绍一下自己" />
                    </div>
                  </div>

                  {profileNotice && (
                    <div className={`mt-4 rounded-2xl border px-3 py-2 text-sm ${getNoticeClass(profileNotice.type)}`}>
                      {profileNotice.text}
                    </div>
                  )}

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => { setEditingProfile(false); setProfileNotice(null); }} disabled={profileSaving || avatarUploading}
                      className="uiverse-btn uiverse-btn-ghost !px-3 !py-3 text-sm">
                      取消
                    </button>
                    <button type="button" onClick={handleProfileSave} disabled={profileSaving || profileLoading || avatarUploading}
                      className="uiverse-btn uiverse-btn-primary !px-3 !py-3 text-sm">
                      {profileSaving ? '保存中...' : '保存资料'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full bg-[linear-gradient(135deg,#c084fc,#6366f1,#38bdf8)] p-1.5 shadow-[0_0_36px_rgba(129,140,248,0.65)] sm:h-32 sm:w-32">
                    <div className="h-full w-full overflow-hidden rounded-full bg-slate-800">
                      {activeAvatarUrl ? (
                        <img src={activeAvatarUrl} alt="avatar" loading="eager" decoding="sync" onError={handleAvatarError} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-white">
                          {initial}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <h2 className="max-w-[230px] truncate text-3xl font-bold text-white">{activeDisplayName}</h2>
                    </div>
                    <p className="mt-1 truncate text-base font-semibold"><span className="site-owner-flow">站长</span></p>
                    {user.email && <p className="mt-1 truncate text-xs text-slate-500">{user.email}</p>}
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <span className="text-lg font-bold text-indigo-200">Lv.{profileLevel}</span>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-950/55">
                      <div className="h-full rounded-full bg-[linear-gradient(90deg,#8b5cf6,#38bdf8)]" style={{ width: `${levelProgressPercent}%` }} />
                    </div>
                    <span className="text-lg font-semibold text-slate-300">{levelProgressPercent}%</span>
                  </div>
                  <p className="mt-1 text-center text-sm text-slate-400">{levelCurrentXp} » {levelNextXp} 经验值</p>

                  <div className="my-4 h-px bg-white/10" />

                  <div className="grid grid-cols-3 divide-x divide-white/10 text-center">
                    <div className="px-2">
                      <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center text-blue-400">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                          <path d="M14 2v6h6" />
                          <path d="M8 13h8" />
                          <path d="M8 17h6" />
                        </svg>
                      </div>
                      <p className="text-xl font-bold text-white">32</p>
                      <p className="text-sm text-slate-400">文章</p>
                    </div>
                    <div className="px-2">
                      <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center text-amber-300">
                        <svg width="25" height="25" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="m12 2.8 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.6l-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9L12 2.8Z" />
                        </svg>
                      </div>
                      <p className="text-xl font-bold text-white">89</p>
                      <p className="text-sm text-slate-400">收藏</p>
                    </div>
                    <div className="px-2">
                      <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center text-cyan-300">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
                          <path d="M8 9h8" />
                          <path d="M8 13h5" />
                        </svg>
                      </div>
                      <p className="text-xl font-bold text-white">156</p>
                      <p className="text-sm text-slate-400">评论</p>
                    </div>
                  </div>

                  <div className="my-4 h-px bg-white/10" />

                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-bg)] bg-[var(--accent-bg)] px-3 py-1.5 text-sm font-semibold text-red-300">
                      <span className="h-2 w-2 rounded-full bg-[#FF4444]" />AI
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-bg)] bg-[var(--accent-bg)] px-3 py-1.5 text-sm font-semibold text-emerald-300">
                      <span className="h-2 w-2 rounded-full bg-[#3FB950]" />开源
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-bg)] bg-[var(--accent-bg)] px-3 py-1.5 text-sm font-semibold text-violet-300">
                      <span className="h-2 w-2 rounded-full bg-[#A855F7]" />Windows
                    </span>
                  </div>

                  <div className="my-4 h-px bg-white/10" />

                  <div className="space-y-3">
                    {achievements.map(({ title, desc, textColor, bgColor }) => (
                      <div key={title} className="flex items-center gap-3">
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 ${bgColor} ${textColor}`}>
                          <svg width="23" height="23" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M12 2.6 14.6 8l5.9.9-4.3 4.2 1 5.9L12 16.2 6.8 19l1-5.9-4.3-4.2 5.9-.9L12 2.6Z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold text-white">{title}</p>
                          <p className="truncate text-sm text-slate-400">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button type="button" onClick={openProfileEditor}
                      className="uiverse-btn uiverse-btn-primary !px-3 !py-3 text-sm">
                      编辑资料
                    </button>
                    <button type="button" onClick={handleLogout}
                      className="uiverse-btn uiverse-btn-ghost !px-3 !py-3 text-sm">
                      退出登录
                    </button>
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
