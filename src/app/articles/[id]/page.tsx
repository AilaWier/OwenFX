'use client';
import { useParams } from 'next/navigation';
import { getArticle } from '@/lib/mock-articles';
import { useState } from 'react';
import Link from 'next/link';

export default function ArticleDetailPage() {
  const { id } = useParams();
  const article = getArticle(id as string);
  const [comments, setComments] = useState<{ name: string; text: string; date: string }[]>([]);
  const [cmtName, setCmtName] = useState('');
  const [cmtText, setCmtText] = useState('');

  const addComment = () => {
    if (!cmtName.trim() || !cmtText.trim()) return;
    setComments([...comments, { name: cmtName, text: cmtText, date: new Date().toLocaleDateString('zh-CN') }]);
    setCmtText('');
  };

  if (!article) return (
    <div className="px-6 py-16 text-center">
      <h2 className="text-xl font-semibold mb-3">文章未找到</h2>
      <Link href="/articles" className="text-sm" style={{color:'var(--accent)'}}>← 返回</Link>
    </div>
  );

  return (
    <div className="animate-fade-in px-6 py-8 max-w-3xl mx-auto">
          <Link href="/articles" className="text-sm inline-flex items-center gap-1 mb-6" style={{color:'var(--accent)'}}>← 返回文章列表</Link>
      <article>
        <div className="flex flex-nowrap items-center gap-2 mb-3">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{background:'var(--accent-bg)', color:'var(--accent)'}}>{article.category}</span>
          <span className="text-xs" style={{color:'var(--text-tertiary)'}}>{article.readTime}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-3">{article.title}</h1>
        <p className="text-sm mb-6" style={{color:'var(--text-secondary)'}}>{article.author} · {article.createdAt}</p>
        <div className="rounded-xl p-6 mb-8 leading-relaxed text-sm whitespace-pre-line" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          {article.content}
        </div>
        <div className="flex flex-wrap gap-2 mb-8">
          {article.tags.map(t => (
            <span key={t} className="px-3 py-1 text-xs rounded-full" style={{background:'var(--bg-tertiary)', color:'var(--text-secondary)'}}>#{t}</span>
          ))}
        </div>
      </article>

      {/* 赞赏支持 */}
      <div className="rounded-xl p-4 sm:p-6 mb-6 sm:mb-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <p className="text-sm font-medium mb-3" style={{color:'var(--text-tertiary)'}}>赞赏支持</p>
        <div className="flex flex-nowrap items-center gap-1 sm:gap-2">
          <button className="shrink-0 px-2 sm:px-3 py-1.5 text-xs rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1"
            style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: 'none' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
            </svg>
            点赞
          </button>
          <button className="shrink-0 px-2 sm:px-3 py-1.5 text-xs rounded-full transition-all duration-200 cursor-pointer"
            style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: 'none' }}>
            <span className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
              微信
            </span>
          </button>
          <button className="shrink-0 px-2 sm:px-3 py-1.5 text-xs rounded-full transition-all duration-200 cursor-pointer"
            style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: 'none' }}>
            <span className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              支付宝
            </span>
          </button>
        </div>
      </div>


      {/* Comments */}
      <div className="rounded-xl p-4 sm:p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <h3 className="text-base font-semibold mb-4">评论 ({comments.length})</h3>
        <div className="flex gap-3 mb-6">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0" style={{background:'var(--accent-bg)', color:'var(--accent)'}}>U</div>
          <div className="flex-1">
            <input type="text" placeholder="昵称" value={cmtName} onChange={e => setCmtName(e.target.value)}
              className="w-full text-sm p-2.5 rounded-lg mb-2 outline-none transition-all"
              style={{ background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-color)'} />
            <textarea placeholder="写下评论..." rows={3} value={cmtText} onChange={e => setCmtText(e.target.value)}
              className="w-full text-sm p-2.5 rounded-lg mb-2 outline-none resize-none transition-all"
              style={{ background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-color)'} />
            <button onClick={addComment} className="btn-apple btn-apple-primary text-sm !py-2 !px-5">发表评论</button>
          </div>
        </div>
        {comments.length === 0 ? (
          <p className="text-sm text-center py-6" style={{color:'var(--text-tertiary)'}}>暂无评论</p>
        ) : (
          comments.map((c, i) => (
            <div key={i} className="flex gap-3 mb-4 animate-slide-in-left" style={{animationDelay: i * 50 + 'ms'}}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0" style={{background:'var(--bg-tertiary)', color:'var(--text-secondary)'}}>{c.name[0]}</div>
              <div>
                <div className="flex flex-nowrap items-center gap-2 mb-1"><span className="text-sm font-medium">{c.name}</span><span className="text-xs" style={{color:'var(--text-tertiary)'}}>{c.date}</span></div>
                <p className="text-sm" style={{color:'var(--text-secondary)'}}>{c.text}</p>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="h-16" />
    </div>
  );
}
