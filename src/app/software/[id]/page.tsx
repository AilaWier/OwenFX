import { mockSoftware } from '@/lib/mock';
import Link from 'next/link';
import DownloadButton from '@/components/DownloadButton';
import ArticleSupport from '@/components/ArticleSupport';

export default async function SoftwareDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const allSoftware = mockSoftware;
  const item = allSoftware.find(s => s.id === id);

  if (!item) return (
    <div className="px-6 py-16 text-center">
      <h2 className="text-xl font-semibold mb-3">软件未找到</h2>
      <Link href="/software" className="text-sm inline-flex items-center gap-2" style={{ color: 'var(--accent)' }}>
        返回软件库
        <span className="inline-flex items-center gap-0.5"><span style={{ color: '#ff5f57' }}>&gt;</span><span style={{ color: '#ffbd2e' }}>&gt;</span><span style={{ color: '#28c840' }}>&gt;</span></span>
      </Link>
    </div>
  );

  return (
    <div className="animate-fade-in px-6 py-8 max-w-3xl mx-auto">
      <Link href="/software" className="text-sm inline-flex items-center gap-2 mb-6" style={{ color: 'var(--accent)' }}>
        返回软件库
        <span className="inline-flex items-center gap-0.5"><span style={{ color: '#ff5f57' }}>&gt;</span><span style={{ color: '#ffbd2e' }}>&gt;</span><span style={{ color: '#28c840' }}>&gt;</span></span>
      </Link>

      <div className="rounded-xl p-6 mb-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">{item.title}</h1>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>{item.category}</span>
          </div>
        </div>
        <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {item.tags.map(t => <span key={t} className="px-2 py-0.5 text-xs rounded-full" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>{t}</span>)}
        </div>

        <div className="flex flex-wrap gap-4 text-sm mb-6" style={{ color: 'var(--text-tertiary)' }}>
          {item.version && <span>版本：{item.version}</span>}
          {item.size && <span>大小：{item.size}</span>}
          {item.platform && <span>平台：{item.platform}</span>}
          {item.updatedAt && <span>更新：{item.updatedAt}</span>}
        </div>

        <DownloadButton downloadUrl={item.downloadUrl} />
      </div>

      {/* Related */}
      <div className="rounded-xl p-6 mb-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <h3 className="font-semibold mb-3">同类软件推荐</h3>
        <div className="grid grid-cols-2 gap-3">
          {allSoftware.filter(s => s.category === item.category && s.id !== item.id).slice(0, 4).map(s => (
            <Link key={s.id} href={'/software/' + s.id}
              className="block p-3 rounded-lg transition-all duration-200 text-sm hover:brightness-110"
              style={{ background: 'var(--bg-secondary)' }}>
              <span className="font-medium">{s.title}</span>
            </Link>
          ))}
        </div>
      </div>

      <ArticleSupport />
    </div>
  );
}
