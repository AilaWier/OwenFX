import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json()
    if (!email || !code) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Find valid, unused code
    const { data, error } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: '验证码错误或已过期' }, { status: 400 })
    }

    // Mark as used
    await supabase.from('verification_codes').update({ used: true }).eq('id', data.id)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Verify OTP error:', err)
    return NextResponse.json({ error: '验证失败' }, { status: 500 })
  }
}
