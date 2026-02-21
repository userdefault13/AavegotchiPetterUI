# Running Aavegotchi Petter Locally

Two services run on your spare computer: **Aavegotchi-Petter** (backend) and **AavegotchiPetterUI** (dashboard). No cloud services.

## Quick Start

**1. Start Redis**

```bash
# macOS
brew install redis && brew services start redis
```

**2. Start Aavegotchi-Petter (backend)**

```bash
cd Aavegotchi-Petter
cp .env.example .env
# Edit .env: REDIS_URL, PETTER_PRIVATE_KEY, REPORT_SECRET
npm install && npm run build && npm start
```

Runs at http://localhost:3001

**3. Start AavegotchiPetterUI (dashboard)**

```bash
cd AavegotchiPetterUI
cp .env.example .env
# Edit .env: PETTER_API_URL, PETTER_API_SECRET (= same as Petter's REPORT_SECRET)
npm install && npm run dev
```

Open http://localhost:3000

## Environment Variables

### Aavegotchi-Petter

| Variable | Required | Description |
|----------|----------|-------------|
| `REDIS_URL` | Yes | `redis://localhost:6379` |
| `PETTER_PRIVATE_KEY` | Yes | Wallet key (0x...) |
| `REPORT_SECRET` | Yes | API auth secret |
| `PETTER_ADDRESS` | Optional | Petter wallet address |
| `BASE_RPC_URL` | Optional | Base RPC |
| `CRON_SCHEDULE` | Optional | Cron (default: every hour) |

### AavegotchiPetterUI

| Variable | Required | Description |
|----------|----------|-------------|
| `PETTER_API_URL` | Yes | `http://localhost:3001` |
| `PETTER_API_SECRET` | Yes | Same as Petter's REPORT_SECRET |
| `ALLOWED_ADDRESS` | Optional | Dashboard admin wallet(s) |
| `PETTER_ADDRESS` | Optional | For display |
| `BASE_RPC_URL` | Optional | For wallet connect |

## Production

```bash
# Petter
cd Aavegotchi-Petter && npm run build
pm2 start dist/index.js --name petter

# Dashboard
cd AavegotchiPetterUI && npm run build
pm2 start .output/server/index.mjs --name petter-ui

pm2 save && pm2 startup
```

## External Cron

To trigger petting from cron-job.org or similar:

```bash
curl -X POST http://YOUR-DASHBOARD:3000/api/bot/run \
  -H "X-Report-Secret: YOUR_REPORT_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"force":false}'
```

Or hit the Petter directly if exposed:

```bash
curl -X POST http://localhost:3001/api/bot/run \
  -H "X-Report-Secret: YOUR_REPORT_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"force":false}'
```
