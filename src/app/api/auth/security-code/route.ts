import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import nodemailer from 'nodemailer'
import { REGISTRATION_EMAIL_UNSUPPORTED_MESSAGE, isSupportedRegistrationEmail } from '@/lib/registration-email'

type SecurityAction = 'email' | 'password'

export async function POST(request: Request) {
  try {
    const { action, email } = await request.json() as { action?: SecurityAction; email?: string }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
    )
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    let targetEmail = user.email.toLowerCase()
    let subject = 'OwenFX 修改密码验证码'
    let title = '修改密码验证'

    if (action === 'email') {
      targetEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
      if (!targetEmail) return NextResponse.json({ error: '请输入新邮箱' }, { status: 400 })
      if (!isSupportedRegistrationEmail(targetEmail)) {
        return NextResponse.json({ error: REGISTRATION_EMAIL_UNSUPPORTED_MESSAGE }, { status: 400 })
      }
      if (targetEmail === user.email.toLowerCase()) {
        return NextResponse.json({ error: '新邮箱不能和当前邮箱相同' }, { status: 400 })
      }
      subject = 'OwenFX 更换邮箱验证码'
      title = '更换邮箱验证'
    } else if (action !== 'password') {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 })
    }

    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const code = String(Math.floor(100000 + Math.random() * 900000))
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    await adminClient
      .from('verification_codes')
      .update({ used: true })
      .eq('email', targetEmail)
      .eq('used', false)

    const { error } = await adminClient.from('verification_codes').insert({
      email: targetEmail,
      code,
      used: false,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
    })

    if (error) return NextResponse.json({ error: '验证码发送失败' }, { status: 500 })

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: targetEmail,
      subject,
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>${title}</h2>
        <p>你的验证码是：</p>
        <div style="font-size:32px;letter-spacing:8px;font-weight:bold;background:#f5f5f5;padding:16px;text-align:center;border-radius:8px;margin:16px 0">${code}</div>
        <p style="color:#666">验证码有效期为10分钟，请尽快使用。</p>
        <p style="color:#999;font-size:12px">如果这不是你本人操作，请忽略此邮件。</p>
      </div>`,
    })

    return NextResponse.json({ success: true, email: targetEmail })
  } catch (err) {
    console.error('Security code error:', err)
    return NextResponse.json({ error: '验证码发送失败' }, { status: 500 })
  }
}
