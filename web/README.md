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

Set the project's **Root Directory** to `web` and enable **Include source files
outside of the Root Directory** so Vercel can resolve the root lockfile and
shared workspaces. Use `npm run build` as the build command.
