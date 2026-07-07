'use client';

import { useState } from 'react';
import Link from 'next/link';
import { categoryColors } from '@/lib/mock';
import { sortTagsByLength } from '@/lib/tag-utils';
import type { Article } from '@/lib/mock-articles';
import type { Software } from '@/lib/types';

interface HomeSectionProps {
  articles: Article[];
  featured: Software[];
}

const PAGE_SIZE = 6;

export default function HomeSections({ articles, featured }: HomeSectionProps) {
  const [fp, setFp] = useState(0);
  const totalPages = Math.max(1, Math.ceil(featured.length / PAGE_SIZE));

  return (
    <>
      <section className="pb-14">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">最新文章<span className="w-3 h-3 rounded-full" style={{background:'#28c840'}}></span></h2>
          <Link href="/articles" className="text-sm" style={{ color: 'var(--accent)' }}>查看全部</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {articles.map((a, i) => (
            <Link key={a.id} href={'/articles/' + a.id} className="uiverse-card p-5 animate-fade-in" style={{ animationDelay: i * 80 + 'ms' }}>
              <span className="text-xs font-medium rounded-full px-2 py-0.5 mb-3 inline-block" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>{a.category}</span>
              <h3 className="font-semibold mb-2 line-clamp-2">{a.title}</h3>
              <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{a.description}</p>
              <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-tertiary)' }}><span>{a.createdAt}</span></div>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="pb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">精选推荐<span className="w-3 h-3 rounded-full" style={{background:'#a855f7'}}></span></h2>
            <Link href="/software" className="text-sm" style={{ color: 'var(--accent)' }}>查看全部</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.slice(fp * PAGE_SIZE, (fp + 1) * PAGE_SIZE).map((s, i) => (
              <Link key={s.id} href={'/software/' + s.id} className="uiverse-card p-5 animate-fade-in" style={{ animationDelay: i * 80 + 'ms' }}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-base truncate">{s.title}</h3>
                  <span className="shrink-0 ml-2 px-2 py-0.5 text-[10px] font-semibold rounded-full inline-flex items-center gap-1" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}><span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: categoryColors[s.category] }}></span>{s.category}</span>
                </div>
                <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{s.description}</p>
                <div className="flex flex-wrap gap-1">{sortTagsByLength(s.tags).slice(0, 3).map((t: string) => (<span key={t} className="px-1.5 py-[2px] text-[11px] rounded-full inline-flex items-center" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>{t}</span>))}</div>
              </Link>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 mt-6">
            <button onClick={() => setFp(p => Math.max(0, p - 1))}
              className="w-8 h-8 rounded-full transition-all"
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="text-base leading-none" style={{ color: 'var(--text-secondary)' }}>«</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setFp(i)}
                className="w-8 h-8 flex items-center justify-center rounded-full transition-all text-xs font-medium"
                style={fp === i ? { background: 'var(--accent-bg)', color: 'var(--accent)' } : { color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setFp(p => Math.min(totalPages - 1, p + 1))}
              className="w-8 h-8 rounded-full transition-all"
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="text-base leading-none" style={{ color: 'var(--text-secondary)' }}>»</span>
            </button>
          </div>
        </section>
      )}
    </>
  );
}
