'use client';
import Link from 'next/link';
import { useState } from 'react';

const navItems = [
  { label: '推荐', icon: '✦', href: '/' },
  { label: '软件库', icon: '⬇', href: '/software' },
  { label: '文章', icon: '📄', href: '/articles' },
  { label: '标签', icon: '#', href: '/tags' },
  { label: '关于', icon: 'ℹ', href: '/about' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`glass-sidebar fixed left-0 top-14 bottom-0 z-40 flex flex-col transition-all duration-300 ${collapsed ? 'w-14' : 'w-56'}`}>
      <div className="flex-1 overflow-y-auto py-4 px-2">
        {navItems.map((item, i) => (
          <Link key={item.label} href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 animate-slide-in-left mb-0.5`}
            style={{ color: 'var(--text-secondary)', animationDelay: i * 60 + 'ms' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <span className="text-base w-5 text-center">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </div>
    </aside>
  );
}