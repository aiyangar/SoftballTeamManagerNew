# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Branching

All changes go to the `desarrollo` branch. Never commit or push directly to `main`.

## Commands

```bash
npm run dev          # Start dev server on localhost:5173
npm run build        # Production build (output: dist/)
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run format:check # Check formatting without modifying files
```

There are no tests configured in this project.

## Architecture

**Softball Team Manager** is a React 19 SPA using Vite + Supabase (PostgreSQL backend). No TypeScript — pure JSX.

### State Management
- `AuthContext` — global auth state (Supabase session, login/logout)
- `TeamContext` — currently selected team and cached team list
- Local `useState` in page components for UI state
- No Redux/Zustand

### Data Fetching
All data fetching happens **directly in page components** via the Supabase client (`src/supabaseClient.js`). There is no centralized API layer. Pattern:

```js
const { data, error } = await supabase
  .from('table_name')
  .select('columns')
  .eq('field', value)
```

Key tables: `equipos` (teams), `jugadores` (players), `partidos` (games), `asistencia_partidos` (attendance), `pagos` (payments), `posiciones`, `jugador_posiciones`.

### Routing (`src/router.jsx`)
- Public: `/signin`, `/signup`
- Protected (via `ProtectedRoute`): `/dashboard`, `/teams`, `/players`, `/schedule`, `/myaccount`
- Admin-only: `/admin` (checked against `VITE_ADMIN_EMAIL` env var)
- `AutoNavigator` handles redirect logic on app load

### Component Organization (`src/components/`)
- `Cards/` — individual card display components (PlayerCard, ScheduleCard, etc.)
- `CardGrids/` — grid layout wrappers for card lists
- `Forms/` — reusable form components (PlayerForm, ScheduleForm, TeamForm, PaymentForm)
- `Modals/` — modal dialogs; use `useModal` hook for scroll management
- `Widgets/` — specialized standalone components (PaymentStatusWidget)
- `Layout.jsx` / `Menu.jsx` — shell and navigation

Pages (`src/pages/`) contain data-fetching logic; components are presentational.

### Styling
Tailwind CSS 4 (via Vite plugin). Dark theme by default (`neutral-900`, `gray-800` backgrounds). No CSS modules — utility classes only, with occasional global styles in `index.css` and `src/components/styles/`.

### Environment Variables (`.env`)
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_ADMIN_EMAIL
SUPABASE_ACCESS_TOKEN
```

### Deployment
Deployed to Vercel (`vercel.json` present). Build output is `dist/`. Sourcemaps are disabled in production.
