'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface Profile {
  display_name: string | null
  bio: string | null
  avatar_url: string | null
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile>({ display_name: '', bio: '', avatar_url: null })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const nicknameInputRef = useRef<HTMLInputElement>(null)
  const [editingEmail, setEditingEmail] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [emailSaving, setEmailSaving] = useState(false)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)

      const { data } = await supabase
        .from('profiles')
        .select('display_name, bio, avatar_url')
        .eq('id', user.id)
        .single()

      if (data) setProfile(data)
      else setProfile({
        display_name: user.user_metadata?.display_name || '',
        bio: '',
        avatar_url: null,
      })
      setLoading(false)
    }
    init()
  }, [router])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('profiles').upsert({
      id: user.id,
      display_name: profile.display_name,
      bio: profile.bio,
      updated_at: new Date().toISOString(),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)

    const formData = new FormData()
    formData.append('avatar', file)

    try {
      const res = await fetch('/api/auth/upload-avatar', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) {
        setProfile(prev => ({ ...prev, avatar_url: data.url + '?t=' + Date.now() }))
      }
    } catch (err) {
      console.error('Upload failed:', err)
    }
    setUploading(false)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  useEffect(() => {
    if (!showMenu) return;
    const close = () => setShowMenu(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [showMenu]);

  if (loading) return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
      <p style={{color:'var(--text-secondary)'}}>加载中...</p>
    </div>
  )

  return (
    <div className="min-h-[calc(100vh-3.5rem)] py-8">
      <div className="max-w-lg mx-auto animate-fade-in">
        <div className="rounded-2xl p-8" style={{ background:'var(--bg-card)', border:'1px solid var(--border-color)' }}>
          <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">个人资料</h1>
              <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)}
                  className="text-2xl px-1 leading-none opacity-40 hover:opacity-80 transition-opacity">
                  ⋮
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 w-44 rounded-xl p-2 shadow-lg backdrop-blur-xl z-10"
                    style={{ background:'var(--bg-card)', border:'1px solid var(--border-color)' }}
                    onClick={() => setShowMenu(false)}>
                    <button onClick={() => fileInputRef.current?.click()}
                      className="w-full text-left px-3 py-2 text-sm rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]">
                      更换头像
                    </button>
                    <button onClick={() => nicknameInputRef.current?.focus()}
                      className="w-full text-left px-3 py-2 text-sm rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]">
                      更换昵称
                    </button>
                    <button onClick={() => setEditingEmail(true)}
                      className="w-full text-left px-3 py-2 text-sm rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]">
                      更换邮箱
                    </button>
                    <div className="h-px mx-2 my-1" style={{background:"var(--border-color)"}} />
                    <button onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]">
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            </div>

          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full overflow-hidden mb-3"
              style={{ background:'var(--bg-tertiary)', border:'2px solid var(--border-color)' }}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl"
                  style={{ color:'var(--text-tertiary)' }}>
                  {user?.email?.[0].toUpperCase()}
                </div>
              )}
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
          </div>

          {/* Email (readonly) */}
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1" style={{color:'var(--text-secondary)'}}>邮箱</label>
            <input type="email" value={user?.email || ''} disabled
              className="glass-input w-full opacity-60" />
          </div>

          {/* Display name */}
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1" style={{color:'var(--text-secondary)'}}>昵称</label>
            <input ref={nicknameInputRef} type="text" value={profile.display_name || ''}
              onChange={e => setProfile(p => ({ ...p, display_name: e.target.value }))}
              className="glass-input w-full" placeholder="设置你的昵称" />
          </div>

          {/* Bio */}
          <div className="mb-6">
            <label className="block text-xs font-medium mb-1" style={{color:'var(--text-secondary)'}}>个人简介</label>
            <textarea value={profile.bio || ''}
              onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
              className="glass-input w-full resize-none" rows={3} placeholder="介绍一下自己" />
          </div>

          {/* Email editing */}
          {editingEmail && (
            <div className="mb-4 p-4 rounded-xl" style={{background:"var(--bg-tertiary)", border:"1px solid var(--border-color)"}}>
              <label className="block text-xs font-medium mb-2" style={{color:"var(--text-secondary)"}}>新邮箱地址</label>
              <div className="flex gap-2">
                <input type="email" value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="glass-input flex-1" placeholder="输入新邮箱" />
                <button onClick={async () => {
                  if (!newEmail || !user) return
                  setEmailSaving(true)
                  const supabase = createClient()
                  const { error } = await supabase.auth.updateUser({ email: newEmail })
                  if (error) {
                    alert('更换失败: ' + error.message)
                  } else {
                    alert('验证邮件已发送到新邮箱，请查收确认')
                    setEditingEmail(false)
                    setNewEmail('')
                  }
                  setEmailSaving(false)
                }} disabled={emailSaving}
                  className="uiverse-btn uiverse-btn-primary !py-2 !px-4 text-sm whitespace-nowrap">
                  {emailSaving ? '发送中...' : '确认'}
                </button>
                <button onClick={() => { setEditingEmail(false); setNewEmail('') }}
                  className="uiverse-btn uiverse-btn-ghost !py-2 !px-4 text-sm whitespace-nowrap">
                  取消
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button onClick={handleSave} disabled={saving}
              className="uiverse-btn uiverse-btn-primary !py-2 !px-6 text-sm">
              {saving ? '保存中...' : saved ? '已保存 ✓' : '保存'}
            </button>

          </div>
        </div>
      </div>
    </div>
  )
}
