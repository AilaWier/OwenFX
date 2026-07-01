'use client'

import { useEffect, useState } from 'react'
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
        setProfile(prev => ({ ...prev, avatar_url: data.url }))
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

  if (loading) return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
      <p style={{color:'var(--text-secondary)'}}>加载中...</p>
    </div>
  )

  return (
    <div className="min-h-[calc(100vh-3.5rem)] py-8">
      <div className="max-w-lg mx-auto animate-fade-in">
        <div className="rounded-2xl p-8" style={{ background:'var(--bg-card)', border:'1px solid var(--border-color)' }}>
          <h1 className="text-2xl font-bold mb-6">个人资料</h1>

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
            <label className="uiverse-btn uiverse-btn-ghost text-xs !py-1.5 !px-3 cursor-pointer">
              {uploading ? '上传中...' : '更换头像'}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
            </label>
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
            <input type="text" value={profile.display_name || ''}
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

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button onClick={handleSave} disabled={saving}
              className="uiverse-btn uiverse-btn-primary !py-2 !px-6 text-sm">
              {saving ? '保存中...' : saved ? '已保存 ✓' : '保存'}
            </button>
            <button onClick={handleLogout}
              className="uiverse-btn uiverse-btn-ghost !py-2 !px-4 text-sm">
              退出登录
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
