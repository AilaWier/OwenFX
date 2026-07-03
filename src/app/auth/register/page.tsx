'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const r = await fetch('/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,password,name}) });
      if (r.ok) { setStatus('success'); return; }
      const d = await r.json();
      setErrorMsg(d.error || '注册失败');
      setStatus('error');
    } catch { setErrorMsg('网络错误'); setStatus('error'); }
  };

  useEffect(() => {
    const prev = { bodyOverflow: document.body.style.overflow, htmlOverflow: document.documentElement.style.overflow, bodyPos: document.body.style.position, bodyW: document.body.style.width };
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    return () => {
      document.body.style.overflow = prev.bodyOverflow;
      document.documentElement.style.overflow = prev.htmlOverflow;
      document.body.style.position = prev.bodyPos;
      document.body.style.width = prev.bodyW;
    };
  }, []);

  return (
    <div className="flex items-center justify-center px-6 overflow-hidden" style={{ height: 'calc(var(--app-height) - 3.5rem)' }}>
      <div className="w-full max-w-sm animate-fade-in">
        <div className="rounded-2xl p-8" style={{ background:'var(--bg-card)', border:'1px solid var(--border-color)' }}>
          <h1 className="text-2xl font-bold mb-1">创建账号</h1>
          <p className="text-sm mb-6" style={{color:'var(--text-secondary)'}}>加入 OwenFX 社区</p>
          
          {status === 'success' ? (
            <div className="text-center space-y-4">
              <div className="text-4xl">📧</div>
              <p className="text-sm font-medium" style={{color:'var(--text-primary)'}}>注册成功！</p>
              <p className="text-xs" style={{color:'var(--text-secondary)'}}>
                确认邮件已发送到 <strong>{email}</strong>，请查收并点击链接确认。
              </p>
              <p className="text-xs" style={{color:'var(--text-tertiary)'}}>确认成功后即可登录</p>
              <Link href="/auth/login" className="inline-block btn-apple btn-apple-primary !py-2.5 !px-6 rounded-full text-sm">
                前往登录
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="用户名" value={name} onChange={e => setName(e.target.value)} required className="glass-input w-full rounded-full px-4" />
              <input type="email" placeholder="邮箱" value={email} onChange={e => setEmail(e.target.value)} required className="glass-input w-full rounded-full px-4" />
              <input type="password" placeholder="密码 (至少6位)" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="glass-input w-full rounded-full px-4" />
              {status === 'error' && <p className="text-xs text-center" style={{color:'var(--danger)'}}>{errorMsg}</p>}
              <button type="submit" disabled={status === 'loading'} className="btn-apple btn-apple-primary w-full justify-center !py-3 rounded-full">
                {status === 'loading' ? '注册中...' : '注册'}
              </button>
            </form>
          )}
          <p className="text-xs text-center mt-4" style={{color:'var(--text-tertiary)'}}>已有账号？<Link href="/auth/login" style={{color:'var(--accent)'}}>登录</Link></p>
        </div>
      </div>
    </div>
  );
}