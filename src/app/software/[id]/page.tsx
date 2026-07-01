import { mockSoftware, categoryColors } from '@/lib/mock';
import Link from 'next/link';
import DownloadButton from '@/components/DownloadButton';

export default async function SoftwareDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const allSoftware = mockSoftware;
  const item = allSoftware.find(s => s.id === id);

  if (!item) return (
    <div className="px-6 py-16 text-center">
      <h2 className="text-xl font-semibold mb-3">软件未找到</h2>
      <Link href="/software" className="text-sm inline-flex items-center gap-1" style={{color:'var(--accent)'}}>
        返回软件库
        <span className="shrink-0 text-xs" style={{color:'var(--text-secondary)'}}>&gt;&gt;&gt;</span>
      </Link>
    </div>
  );

  return (
    <div className="animate-fade-in px-6 py-8 max-w-3xl mx-auto">
      <Link href="/software" className="text-sm inline-flex items-center gap-1 mb-6" style={{color:'var(--accent)'}}>
        返回软件库
        <span className="shrink-0 text-xs" style={{color:'var(--text-secondary)'}}>&gt;&gt;&gt;</span>
      </Link>
      
      <div className="rounded-xl p-6 mb-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">{item.title}</h1>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{background:'var(--accent-bg)', color:'var(--accent)'}}>{item.category}</span>
          </div>
        </div>
        <p className="text-sm mb-4 leading-relaxed" style={{color:'var(--text-secondary)'}}>{item.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
           {item.tags.map(t => <span key={t} className="px-2 py-0.5 text-xs rounded-full" style={{background:'var(--bg-tertiary)', color:'var(--text-secondary)'}}>{t}</span>)}
        </div>

        <div className="flex flex-wrap gap-4 text-sm mb-6" style={{color:'var(--text-tertiary)'}}>
          {item.version && <span>版本：{item.version}</span>}
          {item.size && <span>大小：{item.size}</span>}
          {item.platform && <span>平台：{item.platform}</span>}
          {item.updatedAt && <span>更新：{item.updatedAt}</span>}
        </div>

        <DownloadButton downloadUrl={item.downloadUrl} />

      </div>

       {/* 赞赏支持 */}
      <div className="rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 mt-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
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


      {/* Related */}
      <div className="rounded-xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <h3 className="font-semibold mb-3">同类软件推荐</h3>
        <div className="grid grid-cols-2 gap-3">
          {allSoftware.filter(s => s.category === item.category && s.id !== item.id).slice(0, 4).map(s => (
            <Link key={s.id} href={'/software/' + s.id}
              className="block p-3 rounded-lg transition-all duration-200 text-sm hover:brightness-110"
              style={{background:'var(--bg-secondary)'}}>
              <span className="font-medium">{s.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
