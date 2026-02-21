# Migration to New Petter Wallet

Use this when switching to the new petter address `0x9a3E95f448f3daB367dd9213D4554444faa272F1`.

## 1. Fix displayed address (Vercel)

The Petter Wallet address shown in the dashboard comes from **build-time env vars**. If you see the old address:

1. Go to **Vercel** → Project → **Settings** → **Environment Variables**
2. Set `PETTER_ADDRESS` = `0x9a3E95f448f3daB367dd9213D4554444faa272F1`
   - If it's already set to the old address, update it
   - If not set, add it (or remove any old value so the code default is used)
3. **Redeploy** the project (trigger a new deployment)

## 2. Set private key

Ensure `PETTER_PRIVATE_KEY` is set in Vercel env vars (the private key for `0x9a3E95f448f3daB367dd9213D4554444faa272F1`).

## 3. Clear KV delegated owners

Owners who registered for the old petter need to re-register for the new one. Clear the list:

**Option A – Dashboard (when logged in):**
- Open the **Delegating Owners** section
- Click **Unregister all**

**Option B – cURL (with REPORT_SECRET):**
```bash
curl -X POST https://YOUR-DASHBOARD.vercel.app/api/delegation/clear-all \
  -H "X-Report-Secret: YOUR_REPORT_SECRET"
```

## 4. Owners re-register

Each owner must:
1. Call `setPetOperatorForAll(0x9a3E95f448f3daB367dd9213D4554444faa272F1, true)` on the Aavegotchi contract
2. Re-register via AarcadeGh-t or the dashboard
