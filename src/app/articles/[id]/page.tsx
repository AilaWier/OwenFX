'use client';
import { useParams } from 'next/navigation';
import { getArticle } from '@/lib/mock-articles';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type CommentItem = { id?: string; name: string; text: string; date: string; avatar_url?: string | null };
type CurrentUser = { id: string; name: string; email?: string | null; avatar_url: string | null };

function formatCommentDate(date: string) {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString('zh-CN');
}

export default function ArticleDetailPage() {
  const { id } = useParams();
  const article = getArticle(id as string);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [cmtText, setCmtText] = useState('');
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportTap, setSupportTap] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/user', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setCurrentUser(data.user || null);
      } finally {
        if (!cancelled) setUserLoading(false);
      }
    }
    void loadUser();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const articleId = article?.id || '';
    if (!articleId) return;
    let cancelled = false;
    async function loadComments() {
      const res = await fetch(`/api/comments?articleId=${encodeURIComponent(articleId)}`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (!cancelled && Array.isArray(data)) setComments(data);
    }
    void loadComments();
    return () => { cancelled = true; };
  }, [article?.id]);

  function renderContent(content: string) {
    const lines = content.split('\n');
    let num = 0;
    return lines.map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <p key={i} className="mb-1">&nbsp;</p>;
      if (trimmed.startsWith('## ')) {
        num++;
        const text = trimmed.replace(/^##\s*\d*\.?\s*/, '');
        return (
          <p key={i} className="flex items-start gap-2 mb-3 font-semibold leading-relaxed">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold shrink-0" style={{ background: '#3b82f620', color: '#3b82f6' }}>{num}</span>
            <span>{text}</span>
          </p>
        );
      }
      return <p key={i} className="mb-2 leading-relaxed" style={{color:'var(--text-secondary)'}}>{line}</p>;
    });
  }

  const addComment = async () => {
    const text = cmtText.trim();
    if (!article?.id || !currentUser || !text) return;
    const fallbackComment: CommentItem = { name: currentUser.name, text, date: new Date().toISOString(), avatar_url: currentUser.avatar_url };
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: article.id, name: currentUser.name, text, avatar_url: currentUser.avatar_url, userId: currentUser.id }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setComments(prev => [...prev, data.comment || fallbackComment]);
    } catch {
      setComments(prev => [...prev, fallbackComment]);
    }
    setCmtText('');
  };

  const currentUserName = currentUser?.name || '访客';
  const currentUserInitial = currentUserName.trim().charAt(0).toUpperCase() || 'U';

  const toggleSupport = () => {
    setSupportOpen(open => !open);
    setSupportTap(false);
    window.requestAnimationFrame(() => setSupportTap(true));
  };

  if (!article) return (
    <div className="px-6 py-16 text-center">
      <h2 className="text-xl font-semibold mb-3">文章未找到</h2>
      <Link href="/articles" className="text-sm inline-flex items-center gap-2" style={{color:'var(--accent)'}}>
        返回
        <span className="inline-flex items-center gap-0.5"><span style={{color:'#ff5f57'}}>&gt;</span><span style={{color:'#ffbd2e'}}>&gt;</span><span style={{color:'#28c840'}}>&gt;</span></span>
      </Link>
    </div>
  );

  return (
    <div className="animate-fade-in px-6 py-8 max-w-3xl mx-auto">
          <Link href="/articles" className="text-sm inline-flex items-center gap-2 mb-6" style={{color:'var(--accent)'}}>
            返回文章列表
        <span className="inline-flex items-center gap-0.5"><span style={{color:'#ff5f57'}}>&gt;</span><span style={{color:'#ffbd2e'}}>&gt;</span><span style={{color:'#28c840'}}>&gt;</span></span>
          </Link>
      <div className="flex items-center gap-2 text-sm mb-4" style={{color:'var(--text-secondary)'}}>
        <span className="font-semibold monet-waterlily-flow">OWEN</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{background:'var(--accent-bg)'}}><span className="monet-waterlily-flow">站长</span></span>
      </div>
      <article className="rounded-xl p-5 sm:p-6 mb-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <h1 className="text-2xl md:text-3xl font-bold mb-3">{article.title}</h1>
        <div className="flex flex-nowrap items-center gap-2 mb-6">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{background:'var(--accent-bg)', color:'var(--accent)'}}>{article.category}</span>
          <span className="text-xs" style={{color:'var(--text-tertiary)'}}>· {article.createdAt}</span>
        </div>
        <div className="pt-5 leading-relaxed text-sm" style={{ borderTop: '1px solid var(--border-color)' }}>
          {renderContent(article.content)}
        </div>
        <div className="flex flex-wrap gap-2 mt-6">
          {article.tags.map(t => (
                <span key={t} className="px-3 py-1 text-xs rounded-full inline-flex items-center gap-1" style={{background:'var(--bg-tertiary)', color:'var(--text-secondary)'}}><span className="inline-block w-1.5 h-1.5 rounded-full" style={{backgroundColor: article.category === '工具评测' ? '#6366f1' : article.category === '教程' ? '#f59e0b' : article.category === '系统技巧' ? '#10b981' : '#6366f1'}}></span>{t}</span>
          ))}
        </div>

        {/* 赞赏支持 */}
        <div className="mt-8 flex justify-center">
          <div className="relative flex flex-col items-center justify-center gap-2">
            <button type="button" aria-label="展开赞赏方式" aria-expanded={supportOpen} onClick={toggleSupport} onAnimationEnd={() => setSupportTap(false)} className={`article-support-thumb${supportTap ? ' article-support-thumb-tapping' : ''}`}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
            </button>
            <p className="text-sm font-medium" style={{color:'var(--text-tertiary)'}}>赞赏支持</p>
            {supportOpen && (
              <div className="article-support-popover flex flex-nowrap items-center justify-center gap-2 animate-fade-in">
                <button className="shrink-0 px-3 py-1.5 text-xs rounded-full transition-all duration-200 cursor-pointer"
                  style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: 'none' }}>
                  <span className="flex items-center gap-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                    微信
                  </span>
                </button>
                <button className="shrink-0 px-3 py-1.5 text-xs rounded-full transition-all duration-200 cursor-pointer"
                  style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: 'none' }}>
                  <span className="flex items-center gap-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    支付宝
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Comments */}
      <div className="rounded-xl p-4 sm:p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <h3 className="text-base font-semibold mb-4">评论 ({comments.length})</h3>
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 shrink-0 flex flex-col items-center gap-2 text-center">
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-xs font-medium" style={{background:'var(--accent-bg)', color:'var(--accent)'}}>
              {currentUser?.avatar_url ? <img src={currentUser.avatar_url} alt="avatar" className="h-full w-full object-cover" /> : currentUserInitial}
            </div>
            <span className="max-w-14 truncate text-xs" style={{color:'var(--text-tertiary)'}}>{userLoading ? '...' : currentUserName}</span>
          </div>
          <div className="flex-1">
            <textarea placeholder={currentUser ? '写下评论...' : '登录后评论'} rows={3} value={cmtText} onChange={e => setCmtText(e.target.value)} disabled={!currentUser || userLoading}
              className="w-full text-sm p-2.5 rounded-lg mb-2 outline-none resize-none transition-all"
              style={{ background: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-color)'} />
            <button onClick={addComment} disabled={!currentUser || userLoading || !cmtText.trim()} className="uiverse-btn uiverse-btn-primary w-full text-sm !p-2.5 rounded-lg outline-none cursor-pointer">发表评论</button>
          </div>
        </div>
        {comments.length === 0 ? (
          <p className="text-sm text-center py-6" style={{color:'var(--text-tertiary)'}}>暂无评论</p>
        ) : (
          comments.map((c, i) => (
            <div key={i} className="flex gap-3 mb-4 animate-slide-in-left" style={{animationDelay: i * 50 + 'ms'}}>
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs font-medium shrink-0" style={{background:'var(--bg-tertiary)', color:'var(--text-secondary)'}}>{c.avatar_url ? <img src={c.avatar_url} alt="avatar" className="h-full w-full object-cover" /> : c.name[0]}</div>
              <div>
                <div className="flex flex-nowrap items-center gap-2 mb-1"><span className="text-sm font-medium">{c.name}</span><span className="text-xs" style={{color:'var(--text-tertiary)'}}>{formatCommentDate(c.date)}</span></div>
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
