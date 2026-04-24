const sharp = require('sharp')
const path = require('path')

function svgFor(bgColor) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <rect width="512" height="512" fill="${bgColor}"/>
    <text x="256" y="326"
          font-family="'Arial Black', Impact, 'Helvetica Neue', Arial, sans-serif"
          font-size="200"
          font-weight="900"
          fill="#ffffff"
          text-anchor="middle"
          letter-spacing="-2">Huh?</text>
  </svg>`
}

const variants = [
  {
    label: 'blue',
    bg: '#1E4FBF',
    outputs: [
      ['public/icon-512.png', 512],
      ['public/icon-192.png', 192],
    ],
  },
  {
    label: 'red',
    bg: '#CC0000',
    outputs: [
      ['public/icon-dark-512.png', 512],
      ['public/icon-dark-192.png', 192],
    ],
  },
]

;(async () => {
  for (const v of variants) {
    const buf = Buffer.from(svgFor(v.bg))
    for (const [out, size] of v.outputs) {
      await sharp(buf)
        .resize(size, size)
        .png({ compressionLevel: 9 })
        .toFile(path.resolve(__dirname, '..', out))
      console.log(`✓ ${out}  (${size}×${size}, ${v.label})`)
    }
  }
})().catch(err => {
  console.error('Icon generation failed:', err)
  process.exit(1)
})
