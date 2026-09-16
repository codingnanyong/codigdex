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

Set the project's **Root Directory** to `web` and keep **Include source files
outside of the Root Directory in the Build Step** enabled. Vercel can then
resolve the root npm workspace and its shared packages while treating this
folder as the single deployable application. Keep the build command at the
framework default (`npm run build`); `prebuild` synchronizes game assets first.
