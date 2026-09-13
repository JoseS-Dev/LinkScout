# AGENTS.md — LinkScout

LinkScout is a Telegram bot (Telegraf) that fetches remote-job listings from the RemoteOK JSON API and replies to the `/jobs` command. The codebase is Spanish: comments and log messages are written in Spanish — match that style.

## Commands (pnpm only)
- `pnpm install` — install deps (pnpm 11.x required; no npm/yarn lockfiles).
- `pnpm dev` — the only real way to run it: `tsx watch src/app.ts` with `NODE_ENV=development`.
- `pnpm prisma:migrate` / `prisma:generate` / `prisma:reset` — Prisma migrate dev / generate / migrate reset (Prisma 7; config in `prisma.config.ts`).
- No tests exist; `pnpm test` is a stub that exits 1. Don't hunt for a test runner.

## Environment
- Env is loaded per environment in `src/utils/functions.ts` (`loadEnv`: `.env.development` / `.env.production`) and zod-validated in `src/config/validation/env.ts`. Invalid/missing vars boot script crashes via `process.exit(1)`.
- `.env.*` files are gitignored; only `.env.example` is tracked. The local `.env.development` holds a live `TELEGRAM_BOT_TOKEN` — never commit, print, or log it.
- `.env.example` is stale: it uses `BOT_TELEGRAM_TOKEN`, but the schema requires `TELEGRAM_BOT_TOKEN`. Copying `.env.example` alone will not boot the bot.
- `DATABASE_URL` is required for favorites (Prisma+Postgres via `@prisma/adapter-pg`); without it the app falls back to the `localhost` placeholder in the env schema and the bot crashes when saving favorites.

## TypeScript rules (enforced by tsconfig)
- `module: nodenext` — relative imports must end in `.js` (e.g. `../config/config.js`).
- `verbatimModuleSyntax: true` — type-only imports must use `import type`.
- `noUncheckedIndexedAccess` — array indexing yields `T | undefined`; handle it.

## Architecture
- `src/app.ts` — entrypoint: builds Telegraf bot, registers commands, launches; exits if token missing.
- `src/commands/` — `index.ts` registers handlers onto the bot; `/jobs`, `/start`, `/help`, `/favorites` exist, plus `handlerPagination.ts` (wired via `bot.action(/^page:.+/)`) and `handlerFavorite.ts` (single `bot.action(/^fav:.+/)` dispatcher for add/remove).
- `src/services/scraper.ts` — fetches RemoteOK API and filters by a `Filters` object (term, salaryMin/Max, tagMatch, daysOfSeniority). Imports `playwright` but never uses it (scraping is plain `fetch`, no headless browser).
- `src/services/favoriteService.ts` + `src/config/prisma/prisma.ts` — Persistence layer: Prisma 7 + `@prisma/adapter-pg`, models `User`/`Favorite` in `prisma/schema.prisma`; client generated to `src/generated/prisma` (gitignored). `addFavorite` returns `null` on duplicate (P2002).
- `src/utils/pagination.ts` — job text + inline-keyboard pagination buttons; filters are URL-encoded into the callback data (`page:<term>|<min>|<max>|<tag>|<dias>|<page>`, `fav:<...>|<page>|<add|remove>`), decoded/reused via `encodeFilters`/`decodeFilters`/`parsePaginationData` in `functions.ts`. `commandFavorites` sends `fav:del:<favId>` delete buttons (robust — DB id, no API index drift). Beware Telegram's 64-byte callback data limit.
- `src/config/` — `config.ts` exposes validated env; `pino/logger.ts` pretty-prints in dev.
- `src/types/root.ts` — shared interfaces.

## Gotchas
- `package.json` has no `build` script and `dist` is not produced (tsconfig `outDir`/`rootDir` are commented out); `start:` (trailing-colon typo) points at a nonexistent `dist/app.js`. Use `pnpm dev`; the prod path is not wired up.
- `playwright` is an effectively unused dependency.