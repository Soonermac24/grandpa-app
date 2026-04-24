export const metadata = {
  title: 'Papa App',
  description: 'Family communication for Papa',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Talk to Papa',
  },
  icons: {
    apple: '/icon-192.png',
  },
}

export const viewport = {
  themeColor: '#0f0e0c',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#0f0e0c' }}>
        {children}
      </body>
    </html>
  )
}
