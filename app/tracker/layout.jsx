// Private owner tracker — keep it out of search engines and don't link it
// anywhere. Access is gated by a passcode (TRACKER_PASSCODE).
export const metadata = {
  title: 'Tracker',
  robots: { index: false, follow: false },
}

export default function TrackerLayout({ children }) {
  return children
}
