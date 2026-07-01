export const metadata = { title: '联系 — OwenFX' };
export default function ContactPage() {
  return (
    <div className="animate-fade-in py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">联系我们</h1>
      <div className="uiverse-card p-6">
        <p className="text-sm mb-4" style={{color:'var(--text-secondary)'}}>有任何建议或软件推荐？欢迎联系我们。</p>
        <p className="text-sm" style={{color:'var(--text-tertiary)'}}>邮箱：contact@owenfx.com</p>
      </div>
    </div>
  );
}