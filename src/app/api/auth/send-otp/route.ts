import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import { REGISTRATION_EMAIL_UNSUPPORTED_MESSAGE, isSupportedRegistrationEmail } from '@/lib/registration-email'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''

    if (!normalizedEmail) return NextResponse.json({ error: '请输入邮箱' }, { status: 400 })
    if (!isSupportedRegistrationEmail(normalizedEmail)) {
      return NextResponse.json({ error: REGISTRATION_EMAIL_UNSUPPORTED_MESSAGE }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const code = String(Math.floor(100000 + Math.random() * 900000))
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    const { error } = await supabase.from('verification_codes').insert({
      email: normalizedEmail, code, used: false, expires_at: expiresAt, created_at: new Date().toISOString()
    })

    if (error) return NextResponse.json({ error: '发送失败' }, { status: 500 })

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: normalizedEmail,
      subject: 'OwenFX 注册验证码',
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>OwenFX 注册验证</h2>
        <p>你的验证码是：</p>
        <div style="font-size:32px;letter-spacing:8px;font-weight:bold;background:#f5f5f5;padding:16px;text-align:center;border-radius:8px;margin:16px 0">${code}</div>
        <p style="color:#666">验证码有效期为10分钟，请尽快使用。</p>
        <p style="color:#999;font-size:12px">如果这不是你本人操作，请忽略此邮件。</p>
      </div>`,
    })

    return NextResponse.json({ success: true, message: '验证码已发送到邮箱' })
  } catch (err: any) {
    console.error('Send OTP error:', err)
    return NextResponse.json({ error: '验证码发送失败' }, { status: 500 })
  }
}
