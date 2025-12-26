import './globals.css';
import type { Metadata } from 'next';
import { Instrument_Serif } from 'next/font/google';
import { MockAuthProvider } from '@/hooks/useMockAuth';

const instrumentSerif = Instrument_Serif({ 
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-heading'
});

export const metadata: Metadata = {
  title: {
    template: '%s | Zenith',
    default: 'Zenith - Programming Contest'
  },
  description: 'A 36-hour programming contest featuring CTF, Kaggle, Hackathon, and DSA',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#171717',
  icons: {
    icon: '/favicon.ico', 
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className={instrumentSerif.variable} style={{ fontFamily: 'var(--font-body)' }}>
        <MockAuthProvider>
          {children}
        </MockAuthProvider>
      </body>
    </html>
  );
}
