# TipJar OP

Crypto tip-page MVP with OP Wallet onboarding prepared for deployment on Netlify.

## Stack

- React + Vite
- Tailwind CSS
- `qrcode.react`
- Netlify Functions on Node.js
- Netlify Blobs for persistent data
- `mempool.space` API for manual on-chain payment verification

## Implemented MVP

- Landing page
- Create/update creator page
- Public `/tip/:username` donation page
- QR-based Bitcoin payment request
- Donation feed with messages
- Public leaderboard for all time, month, and week
- Owner dashboard with totals, unique supporters, daily chart, full donation list, and embed snippet
- Hide-message action for creator
- Real OP Wallet connection via TON Connect for creator onboarding

## Local run

```bash
npm install
npm run dev
```

For local API simulation with Netlify:

```bash
npx netlify dev
```

## Netlify deploy

1. Push the project to Git.
2. Create a new Netlify site from the repository.
3. Use build command `npm run build`.
4. Use publish directory `dist`.
5. Functions directory is already set to `netlify/functions` in `netlify.toml`.
6. Deploy.

## OP Wallet

- The app uses `@tonconnect/ui-react` for real OP Wallet connection in the browser.
- `tonconnect-manifest.json` is served dynamically from Netlify so the manifest origin matches the deployed site.
- Connected OP Wallet accounts autofill the recipient wallet address on the create page.

## Notes

- Data persistence is handled by Netlify Blobs, so a separate database is not required for the deployed MVP.
- Payment confirmation is manual through the `Check payment` button for Bitcoin-style pages.
- OP Wallet connection is real; broader TON-native donation verification is not implemented in this MVP yet.
