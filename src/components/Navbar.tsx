'use client';

import Link from 'next/link';
import { useState } from 'react';

const navLinks = [
  { label: '首页', href: '#' },
  { label: '探索', href: '#' },
  { label: '分类', href: '#' },
  { label: '热门', href: '#' },
];

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="glass fixed top-0 left-0 right-0 z-50 h-14 px-4 flex items-center gap-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <span className="text-xl font-bold text-accent tracking-tight">OwenFX</span>
      </Link>

      {/* Nav Links */}
      <nav className="hidden md:flex items-center gap-1 ml-4">
        {navLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-md transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Search */}
      <div className="flex-1 max-w-md mx-auto">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="搜索软件..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 text-sm bg-[#21262d] border border-border-color rounded-md text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
        </div>
      </div>

      {/* Profile */}
      <div className="flex items-center gap-3">
        <button className="w-7 h-7 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-semibold hover:bg-accent/30 transition-colors">
          O
        </button>
      </div>
    </header>
  );
}
