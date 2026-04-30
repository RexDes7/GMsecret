# Testing GM Secret House

What the app currently is, how to run it, and what to actually test.

## What's shipped vs. not

This project is a **frontend-only** cut today. There is **no backend, no database, no real auth**:

- `components/providers/auth-provider.tsx` is a stand-in. It uses `useSyncExternalStore` over a `localStorage` key (`gm-secret-house:session`). `signIn()` writes the key, `signOut()` removes it.
- Sample content is hard-coded in `lib/content/sample.ts` (`SAMPLE_CONTENT`). There are no API routes, no fetch, no MongoDB. Don't go looking for them.
- Anything that requires `MONGODB_URI` / NextAuth / email / deploy is intentionally a phase-2 task. If a test depends on real persistence or real auth, that test cannot be run yet — note it as out-of-scope rather than chasing it.

The role-guarded admin page (`/admin` via `components/auth/auth-guard.tsx`) treats `username === "admin"` on **login** as the admin (see `components/auth/login-form.tsx`); **register** always creates a `user`. So to test admin-guarded UI, log in (don't register) with username `admin`.

## Running locally

```bash
npm install        # only first time
npm run dev        # next dev / Turbopack on :3000
```

Next.js 16 is in use (see `AGENTS.md` / `CLAUDE.md` at repo root — the version has breaking changes, read `node_modules/next/dist/docs/` before writing code). For testing it behaves close enough to standard Next dev: the server prints `Ready in XXXms` and the page is at http://localhost:3000.

The UI is **Russian only**. Use Russian button labels (`Войти`, `Регистрация`, `Выйти`, `Сообщество`, `Конструктор карт`, `Экспорт в PNG`, etc.) when scripting clicks or asserting copy.

## Golden-path test (what to record/screenshot)

This is the order that exercises the regression-prone code paths. Doing it this way also makes the recording short.

1. **Landing** (`/`)
   - Hero `<video>` should be `paused === false` after ~1s (`document.querySelector('video')`).
   - Carousel "Герои Долины" auto-rotates. Easiest proof: take two screenshots ~5s apart and the active hero changes.
2. **Register** → fill form → submit. Should redirect to `/profile/<username>` and the header should switch from "Войти / Регистрация" to `<username>` + "Выйти" **without a manual refresh**. This is the assertion that the React 19 `useSyncExternalStore` rewrite + the `emit()` cache invalidation works.
3. **Community filter**: `/community` → click a chip. URL must update to `?type=<kind>` and the count line must collapse (e.g. `Показано 1 из 1`).
4. **Map builder**: `/tools/maps` → pick a brush → click cells. Each cell's `aria-label` flips from `(x, y) floor` to `(x, y) <brush>`. Then click "Экспорт в PNG" — a `map.png` lands in `~/Downloads`.
5. **Admin role-guard**: while logged in as a `user`, visit `/admin`. `AuthGuard` redirects to `/`.
6. **Sign out**: click "Выйти" in the header. Header reverts to "Войти / Регистрация" instantly (without refresh) and `localStorage.getItem('gm-secret-house:session')` is `null`. Re-visiting `/admin` should now redirect to `/login` (the default fallback).

Steps 2 and 6 are the high-value ones. If only one of these fails, the whole `AuthProvider` rewrite is broken and that should be the headline of the test report.

## Things that can throw you off

- **Stretched-link cards**: `ContentCard` and `ContentCategoryCard` use `after:absolute:inset-0` on the title link to make the whole card clickable while still hosting a separate author link. Don't add another `<a>` wrapper around the card — that re-introduces the nested-anchor bug Devin Review caught.
- **Privacy filter**: `/content/[id]` and `/profile/[username]` both filter by `isPublic`. If a private item shows up, that is a regression, not a feature.
- **Search highlight**: `community-feed.tsx` passes `search.trim()` to `ContentCard`. Don't pass the raw value — leading/trailing whitespace breaks the highlight.
- **Carousel auto-rotate uses `setInterval`** with reduced-motion checks. If you use `prefers-reduced-motion`, expect it to stop rotating; that's intended.
- **PNG export** uses `<canvas>.toBlob` + an `<a download>` click. If the file doesn't appear in `~/Downloads`, check that Chrome's download bar isn't blocked by a popup (e.g. a "Save password?" prompt from a previous test run).
- The repo's `AGENTS.md` says explicitly: read `node_modules/next/dist/docs/` before changing routing/data-fetching/middleware. Don't skip it.

## Assets you can rely on

Media and fonts ship in-repo:

- `public/media/hero.mp4` — landing hero video (~558 KB, 1080p). Asserting `currentSrc.endsWith('hero.mp4')` is fine.
- `public/media/heroes/*.png` — three carousel portraits (`legolas`, `dwarf`, `sorceress`).
- `public/media/categories/*.png` — category thumbnails (`equipment`, `spells`, `artifacts`, `bestiary`).
- `public/fonts/Dudka-*.otf` — local font, 6 weights. Loaded via `next/font/local` in `app/layout.tsx`.

## Reporting

- Post **one** PR comment with the run results, screenshots in `<details>` blocks. Don't spam.
- Lead with anything that did NOT pass. If everything passed, lead with the table.
- Always link the Devin session.

## Devin secrets needed

Nothing for the current scope. The day a backend lands, this test will need:

- `MONGODB_URI` — to spin up a real DB
- `NEXTAUTH_SECRET` and a credentials provider config
- Optional: SMTP creds for email verification flows

At that point, request them with descriptive names (e.g. `MONGODB_URI_GMSH_DEV`) and update this skill's primary flow to include real auth instead of the localStorage stub.
