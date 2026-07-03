'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import ThemeToggle from '@/components/ThemeToggle';

const navLinks = [
  { label: '首页', href: '/' },
  { label: '文章', href: '/articles' },
  { label: '软件', href: '/software' },
  { label: '分类', href: '/categories' },
  { label: '关于', href: '/about' },
  { label: '联系', href: '/contact' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{ name: string; avatar_url: string | null } | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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

  // Close menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const close = () => setUserMenuOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [userMenuOpen]);

  return (
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
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 hover:opacity-80"
                  style={{ background: 'var(--accent)', color: '#fff' }}>
                  {user.avatar_url ? (
    <img src={user.avatar_url} className="w-8 h-8 rounded-full object-cover" />
  ) : (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
      style={{ background: 'var(--accent)', color: '#fff' }}>
      {user.name.charAt(0).toUpperCase()}
    </div>
  )}
                </button>
              <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="text-xl px-1.5 opacity-50 hover:opacity-100 transition-opacity leading-none">
                ⋮
              </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-40 rounded-xl p-2 shadow-lg backdrop-blur-xl"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                    onClick={() => setUserMenuOpen(false)}>
                    <Link href="/profile" className="block px-3 py-2 text-sm rounded-lg transition-all text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]">个人中心</Link>
                    <form action="/auth/logout" method="POST">
                      <button type="submit" className="w-full text-left px-3 py-2 text-sm rounded-lg transition-all text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--danger)]">退出登录</button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="uiverse-btn uiverse-btn-primary !py-1.5 !px-4 text-sm">登录</Link>
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
  );
}
