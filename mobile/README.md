# Codigdex Mobile

Reserved application boundary for the future Expo/React Native client.
Install Expo here when mobile implementation begins; do not copy web scenes or
Phaser rendering code into this app.

The mobile client should reuse:

- `@codigdex/game-core` for rules, state types, and save migrations
- `@codigdex/game-content` for monsters, quizzes, chapters, and careers
- `@codigdex/game-i18n` for translated UI messages

Rendering, navigation, input, audio, and persistence adapters belong in this
directory because those concerns differ between web and mobile.
