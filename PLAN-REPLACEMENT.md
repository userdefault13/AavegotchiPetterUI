# Plan: AavegotchiPetterUI as Admin Dashboard Only

See **[Aavegotchi-Petter/PLAN-REPLACEMENT-ARCHITECTURE.md](../Aavegotchi-Petter/PLAN-REPLACEMENT-ARCHITECTURE.md)** for the full architecture.

## Summary: Dashboard Changes

AavegotchiPetterUI becomes **admin dashboard only**. All backend logic moves to Aavegotchi-Petter.

### Remove
- `lib/kv.ts` – replaced by Petter's Redis
- `lib/pet.ts` – moved to Petter
- `@vercel/kv` dependency
- Nitro `scheduledTasks` (cron)
- All server API route logic (replace with proxy)

### Add
- Proxy layer: server routes call `PETTER_API_URL` with `X-Report-Secret: PETTER_API_SECRET`
- Env: `PETTER_API_URL`, `PETTER_API_SECRET`

### Keep
- All Vue components (BotControl, DelegationCard, WalletConnect, HomeDashboard)
- Auth flow (wallet sign-in, session)
- Tailwind, wagmi, viem for wallet connect

### API Route → Proxy Mapping

Each current route becomes a thin proxy:

| Current Route | Proxy To |
|---------------|----------|
| /api/bot/* | PETTER_API_URL/api/bot/* |
| /api/delegation/* | PETTER_API_URL/api/delegation/* |
| /api/transactions/* | PETTER_API_URL/api/transactions/* |
| /api/errors/* | PETTER_API_URL/api/errors/* |
| /api/auth/* | Keep local (session) |
| /api/petter-balance | PETTER_API_URL/api/petter-balance |
| /api/health | PETTER_API_URL/health |

Auth routes (`/api/auth/*`) stay in Nuxt – they manage the session. All other `/api/*` proxy to Petter.
