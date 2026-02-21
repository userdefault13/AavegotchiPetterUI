# QStash Scheduler Setup (Option B)

The petting API runs on Vercel. To run it on a schedule (e.g. every 12 hours), use **Upstash QStash**.

## 1. Create QStash schedule

1. Go to [Upstash Console](https://console.upstash.com/) → QStash
2. Create a new schedule:
   - **Destination:** `https://YOUR-DASHBOARD.vercel.app/api/bot/run`
   - **Method:** POST
   - **Headers:**
     - `Content-Type: application/json`
     - `X-Report-Secret: YOUR_REPORT_SECRET`
   - **Body:** `{"force":false}`
   - **Cron:** `0 */12 * * *` (every 12 hours at :00) or `0 * * * *` (every hour)

## 2. Env vars required

In Vercel → Project → Settings → Environment Variables:

| Variable | Description |
|----------|-------------|
| `PETTER_PRIVATE_KEY` | Private key of petter wallet (0x...) |
| `PETTER_ADDRESS` | Petter wallet address (same as key) |
| `REPORT_SECRET` | Secret for X-Report-Secret (must match QStash header) |
| `KV_REST_API_URL` | Upstash KV URL |
| `KV_REST_API_TOKEN` | Upstash KV token |
| `BASE_RPC_URL` | Base RPC (optional, defaults to mainnet.base.org) |

## 3. Test

1. **Manual trigger:** In dashboard, click "Trigger Now" (requires auth)
2. **Cron:** QStash will hit `/api/bot/run` on schedule. The run checks `bot:state.running`—start the bot in the dashboard first.

## 4. Security

- `PETTER_PRIVATE_KEY` is server-only (never sent to client)
- `/api/bot/run` requires `X-Report-Secret` header
- Only `interact()` is called—no ETH transfers
