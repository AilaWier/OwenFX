'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { REGISTRATION_EMAIL_UNSUPPORTED_MESSAGE, isSupportedRegistrationEmail } from '@/lib/registration-email'

interface Profile {
  display_name: string | null
  bio: string | null
  avatar_url: string | null
}

type Notice = {
  type: 'success' | 'error' | 'info'
  text: string
} | null

const inputClass = 'glass-input w-full rounded-xl px-4 py-3 text-sm outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60'
const labelClass = 'mb-2 block text-xs font-semibold uppercase text-slate-400'

export default function ProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile>({ display_name: '', bio: '', avatar_url: null })
  const [emailDraft, setEmailDraft] = useState('')
  const [emailCode, setEmailCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordCode, setPasswordCode] = useState('')
  const [emailCodeSentTo, setEmailCodeSentTo] = useState('')
  const [passwordCodeSent, setPasswordCodeSent] = useState(false)
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [sendingEmailCode, setSendingEmailCode] = useState(false)
  const [savingEmail, setSavingEmail] = useState(false)
  const [sendingPasswordCode, setSendingPasswordCode] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [notice, setNotice] = useState<Notice>(null)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      setUser(user)
      setEmailDraft(user.email || '')

      const { data } = await supabase
        .from('profiles')
        .select('display_name, bio, avatar_url')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data)
      } else {
        setProfile({
          display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || '',
          bio: '',
          avatar_url: null,
        })
      }

      setLoading(false)
    }

    init()
  }, [router])

  const showNotice = (nextNotice: Notice) => {
    setNotice(nextNotice)
    if (nextNotice?.type === 'success' || nextNotice?.type === 'info') {
      window.setTimeout(() => setNotice(null), 3200)
    }
  }

  const parseApiError = async (res: Response, fallback: string) => {
    try {
      const data = await res.json()
      return data.error || fallback
    } catch {
      return fallback
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setNotice(null)

    const formData = new FormData()
    formData.append('avatar', file)

    try {
      const res = await fetch('/api/auth/upload-avatar', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || '头像上传失败')

      if (data.url) {
        setProfile(prev => ({ ...prev, avatar_url: data.url + '?t=' + Date.now() }))
        showNotice({ type: 'success', text: '头像已更新' })
      }
    } catch (err) {
      showNotice({ type: 'error', text: err instanceof Error ? err.message : '头像上传失败' })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return

    setSavingProfile(true)
    setNotice(null)

    const supabase = createClient()
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      display_name: profile.display_name?.trim() || null,
      bio: profile.bio?.trim() || null,
      avatar_url: profile.avatar_url,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })

    setSavingProfile(false)

    if (error) {
      showNotice({ type: 'error', text: '资料保存失败：' + error.message })
      return
    }

    showNotice({ type: 'success', text: '资料已保存' })
    router.refresh()
  }

  const handleSendEmailCode = async () => {
    if (!user) return
    const nextEmail = emailDraft.trim().toLowerCase()

    if (!nextEmail) {
      showNotice({ type: 'error', text: '请输入新邮箱' })
      return
    }
    if (!isSupportedRegistrationEmail(nextEmail)) {
      showNotice({ type: 'error', text: REGISTRATION_EMAIL_UNSUPPORTED_MESSAGE })
      return
    }
    if (nextEmail === user.email?.toLowerCase()) {
      showNotice({ type: 'info', text: '新邮箱不能和当前邮箱相同' })
      return
    }

    setSendingEmailCode(true)
    setNotice(null)

    const res = await fetch('/api/auth/security-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'email', email: nextEmail }),
    })

    setSendingEmailCode(false)

    if (!res.ok) {
      showNotice({ type: 'error', text: await parseApiError(res, '验证码发送失败') })
      return
    }

    setEmailCode('')
    setEmailCodeSentTo(nextEmail)
    showNotice({ type: 'success', text: '验证码已发送到新邮箱' })
  }

  const handleEmailUpdate = async () => {
    const nextEmail = emailDraft.trim().toLowerCase()
    if (!emailCodeSentTo || emailCodeSentTo !== nextEmail) {
      showNotice({ type: 'error', text: '请先发送新邮箱验证码' })
      return
    }
    if (emailCode.length !== 6) {
      showNotice({ type: 'error', text: '请输入 6 位邮箱验证码' })
      return
    }

    setSavingEmail(true)
    setNotice(null)

    const res = await fetch('/api/auth/security-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'email', email: nextEmail, code: emailCode }),
    })

    setSavingEmail(false)

    if (!res.ok) {
      showNotice({ type: 'error', text: await parseApiError(res, '邮箱更新失败') })
      return
    }

    setUser(prev => prev ? { ...prev, email: nextEmail } : prev)
    setEmailCode('')
    setEmailCodeSentTo('')
    showNotice({ type: 'success', text: '邮箱已更换' })
    router.refresh()
  }

  const handleSendPasswordCode = async () => {
    if (!user?.email) return
    if (!newPassword || !confirmPassword) {
      showNotice({ type: 'error', text: '请输入并确认新密码' })
      return
    }
    if (newPassword.length < 6) {
      showNotice({ type: 'error', text: '新密码至少需要 6 个字符' })
      return
    }
    if (newPassword !== confirmPassword) {
      showNotice({ type: 'error', text: '两次输入的密码不一致' })
      return
    }

    setSendingPasswordCode(true)
    setNotice(null)

    const res = await fetch('/api/auth/security-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'password' }),
    })

    setSendingPasswordCode(false)

    if (!res.ok) {
      showNotice({ type: 'error', text: await parseApiError(res, '验证码发送失败') })
      return
    }

    setPasswordCode('')
    setPasswordCodeSent(true)
    showNotice({ type: 'success', text: '验证码已发送到当前邮箱' })
  }

  const handlePasswordUpdate = async () => {
    if (!passwordCodeSent) {
      showNotice({ type: 'error', text: '请先发送密码验证码' })
      return
    }
    if (passwordCode.length !== 6) {
      showNotice({ type: 'error', text: '请输入 6 位邮箱验证码' })
      return
    }

    setSavingPassword(true)
    setNotice(null)

    const res = await fetch('/api/auth/security-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'password', password: newPassword, code: passwordCode }),
    })

    setSavingPassword(false)

    if (!res.ok) {
      showNotice({ type: 'error', text: await parseApiError(res, '密码修改失败') })
      return
    }

    setNewPassword('')
    setConfirmPassword('')
    setPasswordCode('')
    setPasswordCodeSent(false)
    showNotice({ type: 'success', text: '密码已修改' })
  }

  if (loading) return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
      <div className="h-12 w-12 rounded-full border border-indigo-200/30 border-t-indigo-300 animate-spin" />
    </div>
  )

  const fallbackInitial = (profile.display_name || user?.email || 'U').charAt(0).toUpperCase()

  return (
    <div className="min-h-[calc(100vh-3.5rem)] py-6 sm:py-8">
      <div className="mx-auto max-w-5xl animate-fade-in">
        <div className="relative overflow-hidden rounded-[28px] border border-indigo-200/30 bg-[radial-gradient(circle_at_18%_8%,rgba(168,85,247,0.20),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(56,189,248,0.16),transparent_28%),linear-gradient(145deg,rgba(30,41,75,0.86),rgba(6,13,29,0.96))] p-4 shadow-[0_0_70px_rgba(99,102,241,0.20)] sm:p-6 lg:p-8">
          <div className="absolute right-6 top-6 hidden h-14 w-14 items-center justify-center rounded-2xl border border-indigo-200/20 bg-indigo-400/15 text-indigo-200 shadow-[0_0_30px_rgba(129,140,248,0.25)] sm:flex">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3 20 17H4L12 3Z" />
              <path d="M12 21 4 7h16l-8 14Z" />
            </svg>
          </div>

          <div className="mb-7 flex flex-col gap-3 sm:pr-20">
            <p className="text-sm font-semibold text-cyan-200">个人资料</p>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">编辑你的资料卡片</h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-400">头像、用户名、电子邮件、个人简介和密码都会在这里统一管理。</p>
          </div>

          {notice && (
            <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${notice.type === 'error' ? 'border-rose-300/25 bg-rose-500/10 text-rose-200' : notice.type === 'success' ? 'border-emerald-300/25 bg-emerald-500/10 text-emerald-200' : 'border-cyan-300/25 bg-cyan-500/10 text-cyan-200'}`}>
              {notice.text}
            </div>
          )}

          <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
            <section className="rounded-3xl border border-white/10 bg-slate-950/30 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="flex flex-col items-center text-center">
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                  className="group relative mb-5 flex h-40 w-40 items-center justify-center rounded-full bg-[linear-gradient(135deg,#c084fc,#6366f1,#38bdf8)] p-1.5 shadow-[0_0_42px_rgba(129,140,248,0.62)] transition hover:scale-[1.02] disabled:cursor-wait disabled:opacity-70">
                  <span className="h-full w-full overflow-hidden rounded-full bg-slate-900">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-6xl font-bold text-white">
                        {fallbackInitial}
                      </span>
                    )}
                  </span>
                  <span className="absolute bottom-3 rounded-full border border-white/15 bg-black/45 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                    {uploading ? '上传中...' : '更换头像'}
                  </span>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />

                <h2 className="max-w-full truncate text-3xl font-bold text-white">{profile.display_name || user?.email?.split('@')[0] || 'User'}</h2>
                <p className="mt-2 max-w-full truncate text-sm text-slate-400">{user?.email}</p>
              </div>
            </section>

            <section className="space-y-5">
              <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>用户名</label>
                    <input value={profile.display_name || ''}
                      onChange={event => setProfile(prev => ({ ...prev, display_name: event.target.value }))}
                      className={inputClass}
                      placeholder="设置你的用户名" />
                  </div>

                  <div>
                    <label className={labelClass}>新电子邮件</label>
                    <div className="flex gap-2">
                      <input type="email" value={emailDraft}
                        onChange={event => { setEmailDraft(event.target.value); setEmailCodeSentTo(''); setEmailCode('') }}
                        className={inputClass}
                        placeholder="name@example.com" />
                      <button type="button" onClick={handleSendEmailCode} disabled={sendingEmailCode}
                        className="uiverse-btn uiverse-btn-ghost shrink-0 !px-4 !py-3 text-sm">
                        {sendingEmailCode ? '发送中' : '发验证码'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className={labelClass}>新邮箱验证码</label>
                  <div className="flex gap-2">
                    <input inputMode="numeric" value={emailCode}
                      onChange={event => setEmailCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                      className={`${inputClass} text-center tracking-[8px]`}
                      placeholder="000000" />
                    <button type="button" onClick={handleEmailUpdate} disabled={savingEmail}
                      className="uiverse-btn uiverse-btn-primary shrink-0 !px-4 !py-3 text-sm">
                      {savingEmail ? '确认中' : '确认更换'}
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <label className={labelClass}>个人简介</label>
                  <textarea value={profile.bio || ''}
                    onChange={event => setProfile(prev => ({ ...prev, bio: event.target.value }))}
                    className={`${inputClass} min-h-32 resize-none leading-6`}
                    placeholder="介绍一下自己" />
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs text-slate-500">更换邮箱需要先在新邮箱中获取 6 位验证码。</div>
                  <button type="button" onClick={handleSaveProfile} disabled={savingProfile}
                    className="uiverse-btn uiverse-btn-primary !px-6 !py-3 text-sm sm:min-w-32">
                    {savingProfile ? '保存中...' : '保存资料'}
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-950/30 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-200/20 bg-amber-400/10 text-amber-200">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect width="16" height="11" x="4" y="11" rx="2" />
                      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">修改密码</h3>
                    <p className="text-sm text-slate-400">验证码会发送到当前账号邮箱。</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>新密码</label>
                    <input type="password" value={newPassword}
                      onChange={event => { setNewPassword(event.target.value); setPasswordCodeSent(false); setPasswordCode('') }}
                      className={inputClass}
                      placeholder="至少 6 个字符" />
                  </div>
                  <div>
                    <label className={labelClass}>确认密码</label>
                    <input type="password" value={confirmPassword}
                      onChange={event => { setConfirmPassword(event.target.value); setPasswordCodeSent(false); setPasswordCode('') }}
                      className={inputClass}
                      placeholder="再次输入新密码" />
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                  <input inputMode="numeric" value={passwordCode}
                    onChange={event => setPasswordCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    className={`${inputClass} text-center tracking-[8px]`}
                    placeholder="000000" />
                  <button type="button" onClick={handleSendPasswordCode} disabled={sendingPasswordCode}
                    className="uiverse-btn uiverse-btn-ghost !px-4 !py-3 text-sm">
                    {sendingPasswordCode ? '发送中' : '发验证码'}
                  </button>
                  <button type="button" onClick={handlePasswordUpdate} disabled={savingPassword}
                    className="uiverse-btn uiverse-btn-primary !px-4 !py-3 text-sm">
                    {savingPassword ? '修改中' : '确认修改'}
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
