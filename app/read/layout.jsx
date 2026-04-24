export const metadata = {
  manifest: '/manifest-read.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Papa Read',
  },
  icons: {
    apple: '/icon-dark-192.png',
  },
}

export default function ReadLayout({ children }) {
  return children
}
