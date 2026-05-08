import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AntragshelferPro – Behörden & Versicherungsservice Wuppertal',
  description: 'Professionelle Hilfe bei Antragsstellung, Übersetzungen (Albanisch↔Deutsch) und Versicherungsberatung. Mentor Berisha, Wuppertal.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/favicon-32.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{children}</body>
    </html>
  )
}
