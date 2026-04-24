const sharp = require('sharp')
const path = require('path')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#CC0000"/>

  <path d="M 88 96 Q 256 64 424 96 L 444 186 Q 438 356 256 472 Q 74 356 68 186 Z"
        fill="none" stroke="#7a0000" stroke-width="12" stroke-linejoin="round"/>

  <path d="M 256 80 L 432 256 L 256 432 L 80 256 Z" fill="#FFD700"/>

  <path d="M 180 175 L 295 175 Q 330 175 330 225 Q 330 275 295 275 L 240 275 L 240 355 L 180 355 Z M 240 205 L 285 205 Q 300 205 300 225 Q 300 245 285 245 L 240 245 Z"
        fill="#CC0000" fill-rule="evenodd"/>
</svg>`

const targets = [
  { out: 'public/icon-512.png', size: 512 },
  { out: 'public/icon-192.png', size: 192 },
]

;(async () => {
  for (const { out, size } of targets) {
    const outPath = path.resolve(__dirname, '..', out)
    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toFile(outPath)
    console.log(`✓ ${out} (${size}×${size})`)
  }
})().catch(err => {
  console.error('Icon generation failed:', err)
  process.exit(1)
})
