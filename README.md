# ple.simway.io

## Local Development

This site uses Vercel Serverless Functions (`/api/waitlist`). Standard static servers (e.g. `python -m http.server`) won't work — you need the Vercel CLI.

### Prerequisites

```bash
npm i -g vercel
```

### Setup

```bash
git clone https://github.com/sim-way/ple.simway.io.git
cd ple.simway.io
npm install
vercel link
vercel env pull .env.local   # pulls Resend and Discord credentials
```

### Run

```bash
vercel dev
```

Opens at `http://localhost:3000`. The `/api/waitlist` route is handled locally by the Vercel dev server.

### Test

```bash
npm test
```

Runs unit tests for the `/api/waitlist` handler (validation, CORS, partial failures, missing config).

### Required Environment Variables

| Variable | Source |
|---|---|
| `RESEND_API_KEY` | [resend.com/api-keys](https://resend.com/api-keys) (Full Access) |
| `DISCORD_WEBHOOK_URL` | Discord → Channel Settings → Integrations → Webhooks |

Add all variables to the Vercel dashboard under **Settings → Environment Variables** (check **Development**, **Preview**, and **Production**).
