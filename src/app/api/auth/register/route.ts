import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: '请填写所有字段' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: '密码至少6位' }, { status: 400 })
    }

    // Create user
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        return NextResponse.json({ error: '该邮箱已注册' }, { status: 409 })
      }
      return NextResponse.json({ error: '注册失败: ' + error.message }, { status: 500 })
    }

    // Generate and send verification code
    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const code = String(Math.floor(100000 + Math.random() * 900000))
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    await adminClient.from('verification_codes').insert({
      email, code, used: false, expires_at: expiresAt, created_at: new Date().toISOString()
    })

    // Send email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'OwenFX 注册验证码',
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>OwenFX 注册验证</h2>
        <p>你的验证码是：</p>
        <div style="font-size:32px;letter-spacing:8px;font-weight:bold;background:#f5f5f5;padding:16px;text-align:center;border-radius:8px;margin:16px 0">${code}</div>
        <p style="color:#666">验证码有效期为10分钟，请尽快使用。</p>
        <p style="color:#999;font-size:12px">如果这不是你本人操作，请忽略此邮件。</p>
      </div>`,
    })

    return NextResponse.json({ success: true, email })
  } catch (err: any) {
    console.error('Register error:', err)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}