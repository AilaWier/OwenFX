'use client';

import Link from 'next/link';
import { useState } from 'react';

interface SidebarItem {
  label: string;
  icon: string;
  href: string;
  count?: number;
}

const mainItems: SidebarItem[] = [
  { label: '首页', icon: '🏠', href: '/' },
  { label: '探索', icon: '🔍', href: '/explore' },
  { label: '热门', icon: '🔥', href: '/trending' },
];

const categoryItems: SidebarItem[] = [
  { label: '工具', icon: '🔧', href: '/category/tools' },
  { label: '系统增强', icon: '⚡', href: '/category/system' },
  { label: '多媒体', icon: '🎬', href: '/category/multimedia' },
  { label: '开发工具', icon: '💻', href: '/category/devtools' },
  { label: '网络工具', icon: '🌐', href: '/category/network' },
  { label: '安全工具', icon: '🔒', href: '/category/security' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`glass-sidebar fixed left-0 top-14 bottom-0 z-40 flex flex-col transition-all duration-200 ${collapsed ? 'w-14' : 'w-60'}`}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-4 w-6 h-6 rounded-full bg-bg-card border border-border-color flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors z-10"
      >
        <svg
          className={`w-3 h-3 transition-transform ${collapsed ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="flex-1 overflow-y-auto py-3 px-3">
        {collapsed ? (
          <>
            {[...mainItems, ...categoryItems].slice(0, 6).map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-center w-10 h-10 mx-auto mb-1 rounded-md hover:bg-white/5 text-text-secondary hover:text-text-primary transition-colors"
                title={item.label}
              >
                <span className="text-lg">{item.icon}</span>
              </Link>
            ))}
          </>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 px-3">导航</p>
              {mainItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 px-3">分类</p>
              {categoryItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
