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

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Watch mode with `tsx` |
| `npm run build` | Compile to `dist/` |
| `npm start` | Run compiled server |
| `npm run typecheck` | TypeScript without emit |
| `npm test` | Vitest |
