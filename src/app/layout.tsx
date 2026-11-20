import './globals.css';

import type { Metadata } from 'next';
import localFont from 'next/font/local';

import Providers from './providers';

const pretendard = localFont({
  src: '../../public/fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
});

export const metadata: Metadata = {
  title: '간지톤 관리자',
  description: '2026 간지톤 운영진을 위한 어드민 웹',
  icons: {
    icon: '/admin/logo_favicon.svg',
  },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko" className={`${pretendard.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
