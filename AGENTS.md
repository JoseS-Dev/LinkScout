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
- `src/commands/` — `index.ts` registers handlers onto the bot; `/jobs`, `/start`, `/help`, `/favorites`, `/alerta`, `/subscribe` exist. Handlers live in `src/commands/handlers/`: `handlerPagination.ts` (`bot.action(/^page:.+/)`), `handlerFavorite.ts` (single `bot.action(/^fav:.+/)` dispatcher for add/remove), `handlerSubscribe.ts` (`/subscribe` shows category buttons; `bot.action(/^subscribe:.+/)` → `handleCategorySelection` writes a `Subscription`). Categories are in `src/utils/constants.ts` (`CATEGORIES_AVAILABLE`).
- `src/cron/AlertCron.ts` — daily 09:00 `cron.schedule` that queries active alerts (`AlertService.getAlertsByActive`) and sends Telegram messages. Respects per-frequency periods via `lastSentAt` (Diario=1d / Semanal=7d / Mensual=30d, `FREQUENCY_CONFIG`) and filters RemoteOK by `daysOfSeniority` per frequency. `AlertService.markAsSent` stamps `lastSentAt` after each successful send.
- `src/cron/SubscriptionCron.ts` — same schedule (`config.cronJobAlert`); per category in `CATEGORIES_AVAILABLE`, fetches `getSubscriptionsByCategory(category.id)`, queries RemoteOK with `{ tagMatch: category.id, daysOfSeniority: 1 }` and sends one digest message to each subscribed user.
- `src/services/AlertService.ts` — persistence for `Alert` model (`AlertCreate`, `Frecuency` type in `src/types/root.ts`): `createAlert` (verifies user exists, P2002 not applicable), `getAlertsByActive`, `markAsSent`. `Alert.frecuency` is the Prisma enum `Frecuency`.
- `src/services/SubscriptionService.ts` — persistence for `Subscription` model (userId/category, `@@unique([userId, category])`): `createSubscription` (upserts user with `BigInt(userId)`), `removeSubscription`, `getSubscriptionsByCategory`. Category is stored lowercase.
- `src/commands/handlers/handlerAlert.ts` — `/alerta <término> <salario> <Diario|Semanal|Mensual>` parser; builds `AlertCreate` conditionally (never assigns `undefined` — `exactOptionalPropertyTypes`).
- `src/services/scraper.ts` — fetches RemoteOK API and filters by a `Filters` object (term, salaryMin/Max, tagMatch, daysOfSeniority). Imports `playwright` but never uses it (scraping is plain `fetch`, no headless browser).
- `src/services/favoriteService.ts` + `src/config/prisma/prisma.ts` — Persistence layer: Prisma 7 + `@prisma/adapter-pg`, models `User`/`Favorite` in `prisma/schema.prisma`; client generated to `src/generated/prisma` (gitignored). `addFavorite` returns `null` on duplicate (P2002).
- `src/utils/pagination.ts` — job text + inline-keyboard pagination buttons; filters are URL-encoded into the callback data (`page:<term>|<min>|<max>|<tag>|<dias>|<page>`, `fav:<...>|<page>|<add|remove>`), decoded/reused via `encodeFilters`/`decodeFilters`/`parsePaginationData` in `functions.ts`. `commandFavorites` sends `fav:del:<favId>` delete buttons (robust — DB id, no API index drift). Beware Telegram's 64-byte callback data limit.
- `src/config/` — `config.ts` exposes validated env; `pino/logger.ts` pretty-prints in dev.
- `src/types/root.ts` — shared interfaces.

## Gotchas
- `pnpm build` runs `prisma generate` then `tsc` emitting to `dist/` (tsconfig has `rootDir: ./src` + `outDir: ./dist` active). `pnpm start` runs `dist/app.js`. Note: `prisma.config.ts` and `dist` are excluded from the tsc build (both outside `rootDir`/already-compiled) — `dist` MUST stay excluded or tsc throws TS5055 (would overwrite its own output).
- Production start needs `TELEGRAM_BOT_TOKEN` in `.env.production` (local file only has `DATABASE_URL`); without it the env validation crashes with `process.exit(1)`. Don't copy the token from `.env.development` into the repo.
- `playwright` is an effectively unused dependency.