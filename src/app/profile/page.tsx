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
  const [editing, setEditing] = useState(false)
  const [originalProfile, setOriginalProfile] = useState(null)
  const [focused, setFocused] = useState(false)
  const [emailEdit, setEmailEdit] = useState(false)

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

  const handleEmailVerify = async () => {
    if (!newEmail || !user) return
    setEmailSaving(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ email: newEmail })
    if (error) {
      alert('验证失败: ' + error.message)
    } else {
      alert('验证邮件已发送到新邮箱，请查收确认')
      setEmailEdit(false)
      setNewEmail('')
      setEditing(false)
    }
    setEmailSaving(false)
  }

  const handleEdit = () => {
    setOriginalProfile({ ...profile })
    setEditing(true)
    setEmailEdit(false)
    setFocused(false)
  }

  const handleCancel = () => {
    if (originalProfile) setProfile(originalProfile)
    setEmailEdit(false)
    setEditing(false)
    setFocused(false)
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
          <div className="flex items-center justify-between mb-6">              <div className="relative">
                <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setShowMenu(!showMenu)}>
                    <span className="w-3 h-3 rounded-full" style={{background:'#ff5f57'}}></span>
                    <span className="w-3 h-3 rounded-full" style={{background:'#ffbd2e'}}></span>
                    <span className="w-3 h-3 rounded-full" style={{background:'#28c840'}}></span>
                  </div>
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 w-44 rounded-xl p-2 shadow-lg backdrop-blur-xl z-10"
                    style={{ background:'var(--bg-card)', border:'1px solid var(--border-color)' }}
                    onClick={() => setShowMenu(false)}>
                                        <button onClick={() => { setEditing(true); setEmailEdit(false); setFocused(false); }}
                      className="w-full text-left px-3 py-2 text-sm rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]">
                      更新资料
                    </button>
                    <button onClick={() => { setEditing(false); setEmailEdit(false); setFocused(false); alert('密码重置链接已发送到邮箱'); }}
                      className="w-full text-left px-3 py-2 text-sm rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]">
                      更改密码
                    </button>
                    <button onClick={() => { setNewEmail(user?.email || ''); setEditing(false); setEmailEdit(true); setFocused(false); }}
                      className="w-full text-left px-3 py-2 text-sm rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]">
                      更换邮箱
                    </button>
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

          {/* Display name */}
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1" style={{color:'var(--text-secondary)'}}>昵称</label>
            <input ref={nicknameInputRef} type="text" value={profile.display_name || ''}
              onChange={e => setProfile(p => ({ ...p, display_name: e.target.value }))}
              onFocus={() => setFocused(true)}
              disabled={!editing}
              className={`glass-input w-full${!editing ? ' opacity-60' : ''}`} style={{ borderRadius: 10, padding: "10px 14px" }} placeholder="设置你的昵称" />
          </div>

          {/* Email (readonly) */}
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1" style={{color:'var(--text-secondary)'}}>邮箱</label>
            <input type="email" value={user?.email || ''} disabled
              disabled={!emailEdit}
              onFocus={() => emailEdit && setFocused(true)}
              className={`glass-input w-full${emailEdit ? '' : ' opacity-60'}`} style={{ borderRadius: 10, padding: "10px 14px" }} />
          </div>

          {/* Bio */}
          <div className="mb-6">
            <label className="block text-xs font-medium mb-1" style={{color:'var(--text-secondary)'}}>个人简介</label>
            <textarea value={profile.bio || ''}
              onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
              onFocus={() => setFocused(true)}
              disabled={!editing}
              className={`glass-input w-full resize-none${!editing ? ' opacity-60' : ''}`} style={{ borderRadius: 10, padding: "10px 14px" }} rows={3} placeholder="介绍一下自己" />
          </div>

          {/* Email editing */}
          {editingEmail && (
            <div className="mb-4 p-4 rounded-xl" style={{background:"var(--bg-tertiary)", border:"1px solid var(--border-color)"}}>
              <label className="block text-xs font-medium mb-2" style={{color:"var(--text-secondary)"}}>新邮箱地址</label>
              <div className="flex gap-2">
                <input type="email" value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="glass-input flex-1" style={{ borderRadius: 10, padding: "10px 14px" }} placeholder="输入新邮箱" />
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
                    {(editing || emailEdit) && focused && (
            <div className="flex gap-3 mt-4 w-full">
              <button onClick={handleCancel}
                className="uiverse-btn uiverse-btn-ghost !py-2.5 flex-1 text-sm">
                取消
              </button>
              <button onClick={emailEdit ? handleEmailVerify : handleSave} disabled={emailEdit ? emailSaving : saving}
                className="uiverse-btn uiverse-btn-primary !py-2.5 flex-1 text-sm">
                {emailEdit ? (emailSaving ? '发送中...' : '验证') : saving ? '保存中...' : saved ? '已保存 ✓' : '保存'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
