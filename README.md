# Papa App

Family communication app for hard-of-hearing loved ones.
- **`/display`** — big screen at home (always on)
- **`/talk`** — family sender (QR code → phone)
- **`/read`** — papa's mobile reader (on the go)

---

## Friday Setup — Step by Step

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Supabase
1. Go to [supabase.com](https://supabase.com) → New Project
2. Open the SQL Editor and paste + run the contents of `supabase-setup.sql`
3. Go to Settings → API → copy your Project URL and anon key

### 3. Set up OpenAI
1. Go to [platform.openai.com](https://platform.openai.com) → API Keys
2. Create a new key, copy it
3. Add $5 credit under Billing (lasts months for this use case)

### 4. Generate VAPID keys (push notifications)
```bash
node scripts/generate-vapid.js
```
Copy the output into your `.env.local`

### 5. Create your .env.local
```
cp .env.local.example .env.local
```
Then fill in all the values.

### 6. Test locally
```bash
npm run dev
```
- Open `http://localhost:3000/display` on your big monitor
- Open `http://localhost:3000/talk` on your phone
- Hold the mic button, talk, release — message appears on the display

### 7. Deploy to Vercel
```bash
npm install -g vercel
vercel
```
- Add all your `.env.local` variables in Vercel → Project Settings → Environment Variables
- Your live URL will be something like `https://papa-app.vercel.app`

### 8. Generate the QR code
Go to [qr-code-generator.com](https://qr-code-generator.com)
Enter: `https://your-app.vercel.app/talk`
Download and print it — tape to the back of the screen.

### 9. At Papa's house
1. Plug in the computer, connect to his WiFi
2. Open Chrome → go to `https://your-app.vercel.app/display`
3. Press `F11` (Windows) or `Cmd+Ctrl+F` (Mac) for full screen
4. Set computer to never sleep when plugged in
5. Presence is automatic — opening `/display` marks papa as home; closing it marks him away

---

## How It All Works

| Action | What happens |
|--------|-------------|
| Family scans QR | Opens `/talk` on their phone |
| They enter name | Saved to phone forever (PWA) |
| Hold button + talk | Records audio |
| Release | Whisper transcribes → message appears on papa's screen instantly |
| `/display` is open | Papa is marked as home; family sees the green "Papa is home" badge |
| Family calls + opens app | Two-way: they type, he talks on speaker |
| Papa on the go | Opens `/read` on his phone, same messages, push notifications |

---

## URLs
| URL | Purpose |
|-----|---------|
| `/display` | Big screen — leave this open always |
| `/talk` | Family sender — this is what the QR code points to |
| `/read` | Papa's mobile reader |
