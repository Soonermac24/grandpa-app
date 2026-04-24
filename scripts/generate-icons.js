const sharp = require('sharp')
const path = require('path')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#CC0000"/>

  <!-- Yellow outer shield w/ thin black rim -->
  <path d="M 110 72 Q 256 54 402 72 Q 450 82 466 160 Q 440 340 256 484 Q 72 340 46 160 Q 62 82 110 72 Z"
        fill="#FFD700" stroke="#0a0a0a" stroke-width="6" stroke-linejoin="round"/>

  <!-- Red inner shield (leaves the yellow rim visible) -->
  <path d="M 122 88 Q 256 72 390 88 Q 432 100 446 170 Q 422 332 256 466 Q 90 332 66 170 Q 80 100 122 88 Z"
        fill="#CC0000"/>

  <!-- Yellow diamond (tall, straight-sided rhombus) -->
  <path d="M 256 100 L 410 256 L 256 412 L 102 256 Z" fill="#FFD700"/>

  <!-- Bold red P -->
  <path d="M 200 180 L 295 180 Q 325 180 325 228 Q 325 276 295 276 L 255 276 L 255 340 L 200 340 Z
           M 255 208 L 285 208 Q 302 208 302 228 Q 302 248 285 248 L 255 248 Z"
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
