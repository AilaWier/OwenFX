import type { Metadata } from 'next';
import { Geist, Geist_Mono, Ma_Shan_Zheng } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import Navbar from '@/components/Navbar';
import BackToTop from '@/components/BackToTop';
import ScrollToTop from '@/components/ScrollToTop';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
const maShanZheng = Ma_Shan_Zheng({ weight: '400', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OwenFX — 精选软件与文章',
  description: 'OwenFX 是一个精选软件资源分享站，汇集免费、开源、实用软件与技术文章。',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let initialUser: { name: string; avatar_url: string | null } | null = null;
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
    );
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      let av: string | null = null;
      try {
        const { data: prof } = await supabase.from('profiles').select('display_name, avatar_url').eq('id', session.user.id).single();
        if (prof) {
          av = prof.avatar_url;
        }
      } catch (_) {}
      initialUser = { name: session.user.email?.split('@')[0] || '用户', avatar_url: av };
    }
  } catch (_) {}

  return (
    <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} style={{ overflowY: 'scroll', overflowX: 'hidden', scrollbarGutter: 'stable' }} data-theme="dark" suppressHydrationWarning>
            <head><style>{'::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.3);border-radius:3px}html{scrollbar-gutter:stable}body{margin:0}'}</style></head>
      <body style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <ThemeProvider>
          <Navbar initialUser={initialUser} />
          <main style={{ paddingTop: '56px', overflowX: 'hidden' }}>
            <div className="max-w-6xl mx-auto min-h-[calc(100vh-3.5rem)]" style={{ paddingLeft: '24px', paddingRight: '24px' }}>
              {children}
            </div>
          </main>
        </ThemeProvider>
          <BackToTop />
          <ScrollToTop />
      </body>
    </html>
  );
}
