# Smart Menu Upload

Simple single-service app (Express + Vite + React + TypeScript) that serves a frontend and an upload API from one Node process.

## Requirements

- Node.js 18+
- npm

## Quick start

1. Install

```bash
cd /Users/asaipriyans/Asaipriyan/menu/smart-menu-upload
npm install
```

2. Development (single command — frontend served via Vite middleware inside Express, HMR enabled)

```bash
npm run dev
# open http://localhost:3000
```

3. Production (build frontend + server, then run single Node process)

```bash
npm run build
npm start
# open http://localhost:3000
```

## Available scripts

- `npm run dev` — start single-process development server (NODE_ENV=development)
- `npm run build` — build frontend (`vite build`) and compile server (`tsc`)
- `npm start` — run production server (NODE_ENV=production)

(See package.json for exact script definitions.)

## API

- POST /upload
  - Form field: `image`
  - Response: `{ ok: true, file: { filename, url } }`
- Uploaded files served at: `GET /uploads/<filename>`

## Config & paths

- Server default port: `3000` (use PORT env var to change)
- Uploads directory: project-root/uploads
- Frontend entry: `index.html` + `src/` (Vite)
- Production frontend build output: `dist/`

## Running in background (optional)

Install pm2 and start:

```bash
npm install -g pm2
pm2 start build/server.js --name smart-menu-upload
```

## Notes

- Frontend posts to `/upload`; in dev the server proxies/handles Vite middleware so no separate frontend URL is needed.
- Limit upload size in server config (currently 10MB in multer).
- For production, ensure `npm run build` completes so `dist/` exists
