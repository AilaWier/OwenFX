import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: '请填写所有字段' }, { status: 400 })
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          },
        },
      }
    )

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', data.user.id).single()

    return NextResponse.json({
      success: true,
      user: { id: data.user.id, email: data.user.email, name: profile?.display_name || email.split('@')[0] }
    })
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
