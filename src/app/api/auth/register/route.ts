import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: '请填写所有字段' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: '密码至少6位' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Create user with confirmed email
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: name },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        return NextResponse.json({ error: '该邮箱已注册' }, { status: 409 })
      }
      return NextResponse.json({ error: '注册失败: ' + error.message }, { status: 500 })
    }

    // Create profile entry
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        display_name: name,
        updated_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Register error:', err)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
