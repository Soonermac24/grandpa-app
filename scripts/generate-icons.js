const sharp = require('sharp')
const path = require('path')

/**
 * Superhero silhouette — simple overlapping black shapes on a colored background.
 * Cape is narrow so arms/legs are visible around it. Arms are thin "strips" bent
 * at the elbow so the akimbo gap (background color between arm and torso) reads.
 */
function svgFor(bgColor) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <rect width="512" height="512" fill="${bgColor}"/>

    <!-- Cape: billowing to the right behind the figure, not hanging down over legs -->
    <path d="M 256 140
             L 298 140
             C 345 170 395 250 405 340
             C 395 380 355 385 325 360
             L 295 305
             L 262 230
             Z" fill="#000000"/>

    <!-- Head -->
    <circle cx="256" cy="108" r="30" fill="#000000"/>

    <!-- Neck -->
    <rect x="246" y="130" width="20" height="18" fill="#000000"/>

    <!-- Torso: shoulders tapered to waist (no legs — drawn separately) -->
    <path d="M 198 148 L 314 148 L 286 268 L 226 268 Z" fill="#000000"/>

    <!-- Right arm (thin bent strip: shoulder → elbow out → hand on hip) -->
    <path d="M 310 155 L 358 225 L 300 254 L 293 243 L 346 220 L 302 165 Z"
          fill="#000000"/>

    <!-- Left arm (mirror) -->
    <path d="M 202 155 L 154 225 L 212 254 L 219 243 L 166 220 L 210 165 Z"
          fill="#000000"/>

    <!-- Left leg -->
    <rect x="224" y="266" width="24" height="154" fill="#000000"/>

    <!-- Right leg -->
    <rect x="264" y="266" width="24" height="154" fill="#000000"/>

    <!-- Left foot -->
    <rect x="210" y="414" width="42" height="16" fill="#000000"/>

    <!-- Right foot -->
    <rect x="260" y="414" width="42" height="16" fill="#000000"/>

    <!-- Papa text -->
    <text x="256" y="482"
          font-family="'Arial Black', Impact, 'Helvetica Neue', Arial, sans-serif"
          font-size="58"
          font-weight="900"
          fill="#ffffff"
          text-anchor="middle"
          letter-spacing="2">Papa</text>
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
