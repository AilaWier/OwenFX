import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll() {},
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ user: null })

  const { data: profile } = await supabase.from('profiles').select('display_name, avatar_url').eq('id', session.user.id).maybeSingle()
  const metadata = session.user.user_metadata as Record<string, unknown>
  const metadataName = typeof metadata.display_name === 'string' ? metadata.display_name : typeof metadata.name === 'string' ? metadata.name : null
  const metadataAvatar = typeof metadata.avatar_url === 'string' ? metadata.avatar_url : typeof metadata.picture === 'string' ? metadata.picture : null

  return NextResponse.json({
    user: {
      id: session.user.id,
      email: session.user.email,
      name: profile?.display_name || metadataName || session.user.email?.split('@')[0] || 'User',
      avatar_url: profile?.avatar_url || metadataAvatar || null
    }
  })
}
