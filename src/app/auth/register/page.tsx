'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { REGISTRATION_EMAIL_UNSUPPORTED_MESSAGE, isSupportedRegistrationEmail } from '@/lib/registration-email';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleEmailChange = (nextEmail: string) => {
    setEmail(nextEmail);
    if (status === 'error' && errorMsg === REGISTRATION_EMAIL_UNSUPPORTED_MESSAGE) {
      setStatus('idle');
      setErrorMsg('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!isSupportedRegistrationEmail(normalizedEmail)) {
      setErrorMsg(REGISTRATION_EMAIL_UNSUPPORTED_MESSAGE);
      setStatus('error');
      return;
    }

    setStatus('loading');
    try {
      const r = await fetch('/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email: normalizedEmail,password,name}) });
      const d = await r.json();
      if (r.ok) {
        setRegisteredEmail(d.email || normalizedEmail);
        setStatus('verify');
        return;
      }
      setErrorMsg(d.error || '注册失败');
      setStatus('error');
    } catch { setErrorMsg('网络错误'); setStatus('error'); }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    try {
      const r = await fetch('/api/auth/verify-otp', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email: registeredEmail, code: verifyCode}) });
      const d = await r.json();
      if (r.ok) { window.location.href = '/auth/login'; return; }
      setErrorMsg(d.error || '验证失败');
      setVerifying(false);
    } catch { setErrorMsg('验证失败'); setVerifying(false); }
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
          {status === 'verify' ? (
            <div className="text-center space-y-4">
              <div className="text-4xl">✉️</div>
              <h1 className="text-xl font-bold">验证邮箱</h1>
              <p className="text-xs" style={{color:'var(--text-secondary)'}}>
                验证码已发送到 <strong>{registeredEmail}</strong>
              </p>
              <form onSubmit={handleVerify} className="space-y-4">
                <input
                  type="text" placeholder="输入6位验证码" maxLength={6}
                  value={verifyCode} onChange={e => setVerifyCode(e.target.value.replace(/\D/g,'').slice(0,6))}
                  required className="glass-input w-full rounded-full px-4 text-center text-lg tracking-[8px]"
                  style={{fontSize:'24px', letterSpacing:'12px'}}
                />
                {errorMsg && <p className="text-xs text-center" style={{color:'var(--danger)'}}>{errorMsg}</p>}
                <button type="submit" disabled={verifying || verifyCode.length !== 6}
                  className="btn-apple btn-apple-primary w-full justify-center !py-3 rounded-full">
                  {verifying ? '验证中...' : '确认验证'}
                </button>
              </form>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-1">创建账号</h1>
              <p className="text-sm mb-6" style={{color:'var(--text-secondary)'}}>加入 OwenFX 社区</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="用户名" value={name} onChange={e => setName(e.target.value)} required className="glass-input w-full rounded-full px-4" />
                <input type="email" placeholder="邮箱" value={email} onChange={e => handleEmailChange(e.target.value)} required className="glass-input w-full rounded-full px-4" />
                <input type="password" placeholder="密码 (至少6位)" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="glass-input w-full rounded-full px-4" />
                {status === 'error' && <p className="text-xs text-center" style={{color:'var(--danger)'}}>{errorMsg}</p>}
                <button type="submit" disabled={status === 'loading'} className="btn-apple btn-apple-primary w-full justify-center !py-3 rounded-full">
                  {status === 'loading' ? '注册中...' : '注册'}
                </button>
              </form>
            </>
          )}
          <p className="text-xs text-center mt-4" style={{color:'var(--text-tertiary)'}}>
            {status === 'verify' ? (
              <>没收到？<button onClick={() => { setStatus('idle'); setErrorMsg(''); }} className="underline" style={{color:'var(--accent)'}}>重新发送</button></>
            ) : (
              <>已有账号？<Link href="/auth/login" style={{color:'var(--accent)'}}>登录</Link></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
