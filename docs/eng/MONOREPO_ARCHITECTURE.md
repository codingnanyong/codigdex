# Monorepo architecture

Codigdex uses independently owned packages inside one repository. This is a
modular monolith, not a set of networked microservices: web and mobile need the
same deterministic game rules and content, while their rendering and device
integration differ.

```text
codigdex/
├─ web/                       Next.js + Phaser web application
├─ mobile/                    future Expo/React Native application
└─ packages/
   ├─ game-core/              rules, domain types, save schema/migrations
   ├─ game-content/           monsters, quizzes, chapters, careers
   └─ game-i18n/              translated UI message catalogs
```

## Dependency direction

```text
web ────────┐
mobile ─────┼──> game-content ──> game-core
            ├──> game-i18n ─────> game-core
            └───────────────────> game-core
```

- `game-core` must stay platform-neutral and must not import another workspace.
- `game-content` may import only `game-core`.
- `game-i18n` may import only locale contracts from `game-core`.
- Apps own rendering, navigation, input, audio, analytics, and persistence
  adapters. Shared packages must not import Phaser, React, Next.js, Expo,
  `window`, `document`, or a concrete device storage API.
- Prefer a new package only when code has a stable public contract and at least
  two consumers. Keep feature-specific UI inside its app.

## Mobile implementation

Create the Expo application in `mobile/` and consume the workspace packages
directly. Mobile should implement its own screens and touch-first layout; it
should not wrap or reuse the Phaser canvas. Persist the shared save snapshot
through a mobile adapter (for example AsyncStorage) and pass plain data into
the shared rules.

## Commands

Run commands from the repository root:

```bash
npm ci
npm run check:boundaries
npm run typecheck
npm run lint
npm test
npm run build:web
```

Vercel may keep `web` as its Root Directory. Because the web application
imports workspace packages outside that directory, its project setting must
allow source files outside the Root Directory.
