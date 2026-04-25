export const metadata = {
  manifest: '/manifest-display.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Papa Display',
  },
  icons: {
    apple: '/icon-huh-red-192.png',
  },
}

export default function DisplayLayout({ children }) {
  return children
}
