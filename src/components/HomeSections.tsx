'use client';

import { useState } from 'react';
import Link from 'next/link';

interface HomeSectionProps {
  articles: any[];
  featured: any[];
}

const PAGE_SIZE = 6;

export default function HomeSections({ articles, featured }: HomeSectionProps) {
  const [fp, setFp] = useState(0);
  const totalPages = Math.max(1, Math.ceil(featured.length / PAGE_SIZE));

  return (
    <>
      <section className="pb-14">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg md:text-xl font-semibold">最新文章</h2>
          <Link href="/articles" className="text-sm" style={{ color: 'var(--accent)' }}>查看全部 →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {articles.map((a: any, i: number) => (
            <Link key={a.id} href={'/articles/' + a.id} className="uiverse-card p-5 animate-fade-in" style={{ animationDelay: i * 80 + 'ms' }}>
              <span className="text-xs font-medium rounded-full px-2 py-0.5 mb-3 inline-block" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>{a.category}</span>
              <h3 className="font-semibold mb-2 line-clamp-2">{a.title}</h3>
              <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{a.description}</p>
              <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-tertiary)' }}><span>{a.readTime}</span><span>{a.createdAt}</span></div>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="pb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg md:text-xl font-semibold">精选推荐</h2>
            <Link href="/software" className="text-sm" style={{ color: 'var(--accent)' }}>查看全部 →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.slice(fp * PAGE_SIZE, (fp + 1) * PAGE_SIZE).map((s: any, i: number) => (
              <Link key={s.id} href={'/software/' + s.id} className="uiverse-card p-5 animate-fade-in" style={{ animationDelay: i * 80 + 'ms' }}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-base truncate">{s.title}</h3>
                  <span className="shrink-0 ml-2 px-2 py-0.5 text-[10px] font-semibold rounded-full" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>{s.category}</span>
                </div>
                <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{s.description}</p>
                <div className="flex flex-wrap gap-1.5">{s.tags.slice(0, 3).map((t: string) => (<span key={t} className="px-2 py-0.5 text-xs rounded-full" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>{t}</span>))}</div>
              </Link>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 mt-6">
            <button onClick={() => setFp(p => Math.max(0, p - 1))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M 3 12 L 18 21 Q 14 12 18 3 Z" />
              </svg>
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setFp(i)}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-all text-xs font-medium"
                style={fp === i ? { background: 'var(--accent-bg)', color: 'var(--accent)' } : { color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setFp(p => Math.min(totalPages - 1, p + 1))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M 21 12 L 6 3 Q 10 12 6 21 Z" />
              </svg>
            </button>
          </div>
        </section>
      )}
    </>
  );
}