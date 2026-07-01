import type { Metadata } from 'next';
import { Geist, Geist_Mono, Ma_Shan_Zheng } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import Navbar from '@/components/Navbar';
import BackToTop from '@/components/BackToTop';
import ScrollToTop from '@/components/ScrollToTop';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
const maShanZheng = Ma_Shan_Zheng({ weight: '400', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OwenFX — 精选软件与文章',
  description: 'OwenFX 是一个精选软件资源分享站，汇集免费、开源、实用软件与技术文章。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable} h-full overflow-x-hidden antialiased`} data-theme="dark" suppressHydrationWarning>
      <body style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <ThemeProvider>
          <Navbar />
          <main className="pt-14 overflow-x-hidden">
            <div className="max-w-6xl mx-auto px-4 md:px-6 min-h-[calc(100vh-3.5rem)]">
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
