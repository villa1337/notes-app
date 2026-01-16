import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Notes',
  description: 'Minimalist dark notes app',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{backgroundColor: '#000'}}>
      <body style={{backgroundColor: '#000', color: '#fff'}}>{children}</body>
    </html>
  );
}
