import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: '请填写所有字段' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: '密码至少6位' }, { status: 400 })
    }

    const supabase = await createClient()

    // signUp creates the user; the DB trigger on_auth_user_created
    // automatically inserts the profile row
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name },
        emailRedirectTo: 'https://www.owenfx.dpdns.org/auth/callback',
      },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        return NextResponse.json({ error: '该邮箱已注册' }, { status: 409 })
      }
      return NextResponse.json({ error: '注册失败: ' + error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Register error:', err)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}