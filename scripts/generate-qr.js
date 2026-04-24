const QRCode = require('qrcode')
const path = require('path')

const BASE = 'https://grandpa-app-roan.vercel.app'

const targets = [
  { url: `${BASE}/talk`,   out: 'public/qr-talk.png' },
  { url: `${BASE}/read`,   out: 'public/qr-read.png' },
  { url: `${BASE}/listen`, out: 'public/qr-listen.png' },
]

const options = {
  errorCorrectionLevel: 'H',
  margin: 2,
  width: 1024,
  color: { dark: '#000000', light: '#ffffff' },
}

;(async () => {
  for (const { url, out } of targets) {
    const outPath = path.resolve(__dirname, '..', out)
    await QRCode.toFile(outPath, url, options)
    console.log(`✓ ${out}  →  ${url}`)
  }
})().catch(err => {
  console.error('QR generation failed:', err)
  process.exit(1)
})
