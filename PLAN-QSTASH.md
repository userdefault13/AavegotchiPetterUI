# External Scheduler (Optional)

The petter runs locally with **built-in Nitro scheduled tasks** (see [LOCAL-RUN.md](LOCAL-RUN.md)). No external scheduler is required.

If you use an external scheduler (e.g. Upstash QStash, cron-job.org) to hit the API:

## QStash Setup

1. Go to [Upstash Console](https://console.upstash.com/) → QStash
2. Create a schedule:
   - **Destination:** `http://localhost:3000/api/bot/run` (or your deployed URL)
   - **Method:** POST
   - **Headers:** `X-Report-Secret: YOUR_REPORT_SECRET`, `Content-Type: application/json`
   - **Body:** `{"force":false}`
   - **Cron:** `0 * * * *` (every hour) or `0 */12 * * *` (every 12 hours)

## Env vars

| Variable | Description |
|----------|-------------|
| `PETTER_PRIVATE_KEY` | Private key (0x...) |
| `PETTER_ADDRESS` | Petter wallet address |
| `REPORT_SECRET` | Must match X-Report-Secret header |
| `KV_REST_API_URL` | Upstash KV URL |
| `KV_REST_API_TOKEN` | Upstash KV token |

## Security

- `PETTER_PRIVATE_KEY` is server-only
- `/api/bot/run` requires `X-Report-Secret` header
- Only `interact()` is called—no ETH transfers
