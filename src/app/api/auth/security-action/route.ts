import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { REGISTRATION_EMAIL_UNSUPPORTED_MESSAGE, isSupportedRegistrationEmail } from '@/lib/registration-email'

type SecurityAction = 'email' | 'password'

async function verifyCode(adminClient: SupabaseClient<any>, email: string, code: string) {
  const { data, error } = await adminClient
    .from('verification_codes')
    .select('id')
    .eq('email', email)
    .eq('code', code)
    .eq('used', false)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) return false

  await adminClient.from('verification_codes').update({ used: true }).eq('id', data.id)
  return true
}

export async function POST(request: Request) {
  try {
    const { action, email, password, code } = await request.json() as {
      action?: SecurityAction
      email?: string
      password?: string
      code?: string
    }

    const normalizedCode = typeof code === 'string' ? code.trim() : ''
    if (!action || !normalizedCode) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 })
    }

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

    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    if (action === 'email') {
      const nextEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
      if (!nextEmail) return NextResponse.json({ error: '请输入新邮箱' }, { status: 400 })
      if (!isSupportedRegistrationEmail(nextEmail)) {
        return NextResponse.json({ error: REGISTRATION_EMAIL_UNSUPPORTED_MESSAGE }, { status: 400 })
      }
      if (nextEmail === user.email.toLowerCase()) {
        return NextResponse.json({ error: '新邮箱不能和当前邮箱相同' }, { status: 400 })
      }

      const ok = await verifyCode(adminClient, nextEmail, normalizedCode)
      if (!ok) return NextResponse.json({ error: '验证码错误或已过期' }, { status: 400 })

      const { error } = await adminClient.auth.admin.updateUserById(user.id, {
        email: nextEmail,
        email_confirm: true,
      })

      if (error) return NextResponse.json({ error: '邮箱更新失败：' + error.message }, { status: 500 })

      return NextResponse.json({ success: true, email: nextEmail })
    }

    if (action === 'password') {
      const nextPassword = typeof password === 'string' ? password : ''
      if (nextPassword.length < 6) {
        return NextResponse.json({ error: '新密码至少需要 6 个字符' }, { status: 400 })
      }

      const ok = await verifyCode(adminClient, user.email.toLowerCase(), normalizedCode)
      if (!ok) return NextResponse.json({ error: '验证码错误或已过期' }, { status: 400 })

      const { error } = await adminClient.auth.admin.updateUserById(user.id, {
        password: nextPassword,
      })

      if (error) return NextResponse.json({ error: '密码修改失败：' + error.message }, { status: 500 })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: '参数不完整' }, { status: 400 })
  } catch (err) {
    console.error('Security action error:', err)
    return NextResponse.json({ error: '操作失败' }, { status: 500 })
  }
}
