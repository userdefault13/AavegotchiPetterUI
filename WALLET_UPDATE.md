# Wallet Update Guide

When you create and fund a new petter wallet, update these locations:

## AavegotchiPetterUI (Vercel Dashboard)

Update your `.env` locally and **Vercel Project Settings → Environment Variables**:

| Variable | Description |
|----------|-------------|
| `ALLOWED_ADDRESSES` | Your new wallet address (comma-separated if multiple) |
| `PETTER_ADDRESS` | Your new petter/bot wallet address |
| `WALLET_ADDRESS` | Your new wallet address |
| `PRIVATE_KEY` | Your new wallet's private key (for triggering bot from dashboard) |

Example:
```
ALLOWED_ADDRESSES="0xYourNewWalletAddress"
PETTER_ADDRESS="0xYourNewWalletAddress"
WALLET_ADDRESS="0xYourNewWalletAddress"
PRIVATE_KEY="your_new_private_key_hex"
```

After updating, redeploy the Vercel app.

## Aavegotchi-Petter (Cloudflare Worker)

Update Cloudflare Worker secrets via Wrangler:

```bash
cd worker
wrangler secret put PRIVATE_KEY    # Your new wallet private key
wrangler secret put WALLET_ADDRESS # Your new wallet address
```

Then redeploy:
```bash
npm run deploy
```

## Post-Update Checklist

1. **Delegation**: If you had previous delegations, owners must call `setPetOperatorForAll(newPetterAddress, true)` with your new wallet address.
2. **Dashboard**: Re-approve the new petter in the dashboard delegation flow.
3. **Verify**: Trigger a manual pet from the dashboard to confirm the new wallet works.
