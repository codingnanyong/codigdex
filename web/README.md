# Codigdex — web app

Next.js + Phaser.js game client. The repo root keeps policy/community-health files (`AGENTS.md`, `docs/`, etc.); this folder is the actual application.

## Develop

Run these commands from the repository root so npm can resolve the shared
workspaces:

```bash
npm install
npm run dev --workspace @codigdex/web # http://localhost:3001
npm run build:web
npm run lint
```

## Vercel

Keep the project's **Root Directory** at the repository root so Vercel can use
the root lockfile and resolve the shared workspaces. Use `npm run build:web` as
the build command.
