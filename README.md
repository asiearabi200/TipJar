# TipJar BTC

Bitcoin tip-page MVP with OP_NET wallet onboarding prepared for deployment on Netlify.

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
- Real OP_NET wallet connection for creator onboarding

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

## OP_NET Wallet

- The app uses the official `@btc-vision/walletconnect` package.
- `OP_WALLET` can be connected directly from the app.
- Connected wallets autofill the recipient BTC address on the create page.

## Notes

- Data persistence is handled by Netlify Blobs, so a separate database is not required for the deployed MVP.
- Payment confirmation is manual through the `Check payment` button.
- The wallet integration targets the OP_NET ecosystem while donation settlement remains BTC-address based.
