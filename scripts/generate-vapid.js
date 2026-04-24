// Run this once to generate your VAPID keys:
// node scripts/generate-vapid.js
//
// Then paste the output into your .env.local file

const webpush = require('web-push')
const keys = webpush.generateVAPIDKeys()
console.log('\nCopy these into your .env.local:\n')
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`)
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`)
console.log(`VAPID_EMAIL=mailto:you@example.com\n`)
