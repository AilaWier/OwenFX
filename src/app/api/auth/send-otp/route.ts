import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: '请输入邮箱' }, { status: 400 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const code = String(Math.floor(100000 + Math.random() * 900000))
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    const { error } = await supabase.from('verification_codes').insert({
      email, code, used: false, expires_at: expiresAt, created_at: new Date().toISOString()
    })

    if (error) return NextResponse.json({ error: '发送失败' }, { status: 500 })

    console.log('Verification code for', email, ':', code)
    return NextResponse.json({ success: true, message: '验证码已发送' })
  } catch {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
