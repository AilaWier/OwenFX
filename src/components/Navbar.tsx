'use client';
import Link from 'next/link';
import { FormEvent, useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import { createClient } from '@/lib/supabase/client';

type NavUser = {
  name: string;
  email?: string | null;
  avatar_url: string | null;
};

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

export default function Navbar({ initialUser = null }: { initialUser?: NavUser | null }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<NavUser | null>(initialUser);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    fetch('/api/auth/user')
      .then(r => r.json())
      .then(d => { if (d.user) setUser(d.user); })
      .catch(() => {});
  }, []);

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

  const initial = user?.name?.charAt(0).toUpperCase() || 'U';

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
                onClick={() => { setDrawerOpen(true); setMenuOpen(false); }}
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
        <div className="user-drawer-layer fixed inset-0 z-[60] overflow-y-auto overscroll-contain">
          <button type="button" aria-label="关闭用户卡片" className="fixed inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <aside className="user-drawer-panel relative z-10 ml-auto min-h-[100dvh] w-[min(92vw,390px)] border-l border-white/15 bg-[#050a16]/95 p-4 shadow-[-24px_0_70px_rgba(2,6,23,0.65)] animate-slide-in-right sm:p-5">
            <div className="user-drawer-card relative mt-10 overflow-hidden rounded-[28px] border border-indigo-200/35 bg-[radial-gradient(circle_at_30%_8%,rgba(168,85,247,0.22),transparent_32%),radial-gradient(circle_at_92%_18%,rgba(56,189,248,0.18),transparent_26%),linear-gradient(145deg,rgba(30,41,75,0.86),rgba(6,13,29,0.96))] px-5 pb-5 pt-9 shadow-[0_0_60px_rgba(99,102,241,0.22)] sm:px-6">
              <button type="button" aria-label="关闭" onClick={() => setDrawerOpen(false)}
                className="absolute right-6 top-6 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-indigo-200/20 bg-indigo-400/15 text-indigo-200 shadow-[0_0_30px_rgba(129,140,248,0.25)] transition hover:bg-indigo-400/25 hover:text-white">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              <div className="mx-auto mb-5 flex h-36 w-36 items-center justify-center rounded-full bg-[linear-gradient(135deg,#c084fc,#6366f1,#38bdf8)] p-1.5 shadow-[0_0_36px_rgba(129,140,248,0.65)]">
                <div className="h-full w-full overflow-hidden rounded-full bg-slate-800">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-5xl font-bold text-white">
                      {initial}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <h2 className="max-w-[230px] truncate text-4xl font-bold text-white">{user.name}</h2>
                </div>
                <p className="mt-2 truncate text-lg font-medium text-slate-300">AI 软件探索者</p>
                {user.email && <p className="mt-1 truncate text-xs text-slate-500">{user.email}</p>}
              </div>

              <div className="mt-7 flex items-center gap-3">
                <span className="text-lg font-bold text-indigo-200">Lv.8</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-950/55">
                  <div className="h-full w-4/5 rounded-full bg-[linear-gradient(90deg,#8b5cf6,#38bdf8)]" />
                </div>
                <span className="text-lg font-semibold text-slate-300">80%</span>
              </div>
              <p className="mt-2 text-center text-sm text-slate-400">1250 / 1500 XP</p>

              <div className="my-6 h-px bg-white/10" />

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
                  <p className="text-2xl font-bold text-white">32</p>
                  <p className="text-sm text-slate-400">文章</p>
                </div>
                <div className="px-2">
                  <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center text-amber-300">
                    <svg width="25" height="25" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="m12 2.8 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.6l-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9L12 2.8Z" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-white">89</p>
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
                  <p className="text-2xl font-bold text-white">156</p>
                  <p className="text-sm text-slate-400">评论</p>
                </div>
              </div>

              <div className="my-6 h-px bg-white/10" />

              <div className="flex flex-wrap justify-center gap-3">
                <span className="rounded-xl bg-violet-500/20 px-4 py-2 font-semibold text-violet-300">#AI</span>
                <span className="rounded-xl bg-blue-500/20 px-4 py-2 font-semibold text-blue-300">#开源</span>
                <span className="rounded-xl bg-cyan-500/20 px-4 py-2 font-semibold text-cyan-200">#Windows</span>
              </div>

              <div className="my-6 h-px bg-white/10" />

              <div className="space-y-4">
                {achievements.map(({ title, desc, textColor, bgColor }) => (
                  <div key={title} className="flex items-center gap-4">
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 ${bgColor} ${textColor}`}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 2.6 14.6 8l5.9.9-4.3 4.2 1 5.9L12 16.2 6.8 19l1-5.9-4.3-4.2 5.9-.9L12 2.6Z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold text-white">{title}</p>
                      <p className="truncate text-sm text-slate-400">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-7 grid grid-cols-2 gap-3">
                <Link href="/profile" onClick={() => setDrawerOpen(false)}
                  className="uiverse-btn uiverse-btn-primary !px-3 !py-3 text-sm">
                  编辑资料
                </Link>
                <button type="button" onClick={handleLogout}
                  className="uiverse-btn uiverse-btn-ghost !px-3 !py-3 text-sm">
                  退出登录
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
