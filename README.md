# SELLlIX Backend

Express + TypeScript API for product research, auth, billing, and admin.

## Setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill `.env` with MongoDB, JWT secrets, and optional Stripe / eBay / Redis keys. Never commit `.env`.

## Run

```bash
npm run dev          # http://localhost:4000
npm run build
npm start
npm run typecheck
```

API docs: `http://localhost:4000/api/docs`

## Render deploy

`dist/` is gitignored, so Render must compile TypeScript during the build.

In the Render service settings:

| Field | Value |
| --- | --- |
| Runtime | Node |
| **Build Command** | `npm install` |
| **Start Command** | `node dist/index.js` |
| Node version | `20` (`NODE_VERSION=20.18.0`) |

`postinstall` runs `tsc` after install, which creates `dist/index.js`. TypeScript is a production dependency so Render's default `npm install` is enough.

If this GitHub repo is the full SELLlIX monorepo (frontend + backend), set **Root Directory** to `backend`.

Also set these environment variables: `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`, `NODE_ENV=production`. Render injects `PORT` automatically.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Watch mode with `tsx` |
| `npm run build` | Compile to `dist/` |
| `npm start` | Run compiled server |
| `npm run typecheck` | TypeScript without emit |
| `npm test` | Vitest |
