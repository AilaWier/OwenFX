import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'OwenFX — 精选软件资源站',
  description: 'OwenFX 是一个 GitHub Explore 风格的软件资源分享站，汇集精选的免费、开源、实用软件。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg-primary text-text-primary">
        <Navbar />
        <Sidebar />
        <main className="pt-14 pl-60 pr-0 transition-all duration-200">
          <div className="min-h-[calc(100vh-3.5rem)]">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
