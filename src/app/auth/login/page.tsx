'use client';
import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (!error) { window.location.href = '/'; return; }
      setErrorMsg('邮箱或密码错误');
      setStatus('error');
    } catch { setErrorMsg('网络错误'); setStatus('error'); }
  };

  return (
    <div className="flex items-center justify-center px-6 overflow-hidden" style={{ height: 'calc(var(--app-height) - 3.5rem)' }}>
      <div className="w-full max-w-sm animate-fade-in">
        <div className="rounded-2xl p-8" style={{ background:'var(--bg-card)', border:'1px solid var(--border-color)' }}>
          <h1 className="text-2xl font-bold mb-1">登录</h1>
          <p className="text-sm mb-6" style={{color:'var(--text-secondary)'}}>欢迎回到 OwenFX</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="email" placeholder="邮箱" value={email} onChange={e => setEmail(e.target.value)} required className="glass-input w-full rounded-full px-4" />
            <input type="password" placeholder="密码" value={password} onChange={e => setPassword(e.target.value)} required className="glass-input w-full rounded-full px-4" />
            {status === 'error' && <p className="text-xs text-center" style={{color:'var(--danger)'}}>{errorMsg}</p>}
            <button type="submit" disabled={status === 'loading'} className="btn-apple btn-apple-primary w-full justify-center !py-3 rounded-full">
              {status === 'loading' ? '登录中...' : '登录'}
            </button>
          </form>
          <p className="text-xs text-center mt-4" style={{color:'var(--text-tertiary)'}}>没有账号？<Link href="/auth/register" style={{color:'var(--accent)'}}>注册</Link></p>
        </div>
      </div>
    </div>
  );
}
