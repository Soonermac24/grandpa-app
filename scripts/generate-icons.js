const sharp = require('sharp')
const path = require('path')

// Tall Superman-style diamond (taller than wide), fully filled yellow.
// Vertices: top (256,40), right (400,256), bottom (256,472), left (112,256).
// Width 288, height 432 — aspect ratio ~0.67, unmistakably "diamond".
const DIAMOND = 'M 256 40 L 400 256 L 256 472 L 112 256 Z'

// Bold red P sized to barely fit the diamond.
// Stem: x=195–245 (w=50), y=132–378.
// Bowl: extends to x=320 (~2px off the diamond's right edge at its top).
// Inner hole cut via fill-rule evenodd.
const LETTER_P = [
  'M 195 132',
  'L 290 132',
  'Q 320 132 320 188',
  'Q 320 244 290 244',
  'L 245 244',
  'L 245 378',
  'L 195 378',
  'Z',
  'M 245 162',
  'L 278 162',
  'Q 294 162 294 188',
  'Q 294 214 278 214',
  'L 245 214',
  'Z',
].join(' ')

function svgFor(bgColor) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${bgColor}"/>
  <path d="${DIAMOND}" fill="#FFD700"/>
  <path d="${LETTER_P}" fill="#CC0000" fill-rule="evenodd"/>
</svg>`
}

const variants = [
  {
    label: 'red',
    bg: '#CC0000',
    outputs: [
      ['public/icon-512.png', 512],
      ['public/icon-192.png', 192],
    ],
  },
  {
    label: 'dark',
    bg: '#000000',
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
