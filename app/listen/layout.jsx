export const metadata = {
  manifest: '/manifest-listen.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Papa Listen',
  },
  icons: {
    apple: '/icon-dark-192.png',
  },
}

export default function ListenLayout({ children }) {
  return children
}
