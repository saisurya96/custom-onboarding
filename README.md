# Custom Onboarding Flow

A 3-step, admin-configurable onboarding wizard with a public data table.

- Frontend: React 18 + TypeScript + Vite, React Router v6, TanStack Query, Tailwind CSS
- Backend: Netlify Functions (Node 18)
- Database: Supabase (Postgres)

## Live

- Netlify: https://brilliant-travesseiro-dea50f.netlify.app/
- GitHub: https://github.com/saisurya96/custom-onboarding

## Features

- 3-step onboarding
  - Step 1: email + password (bcrypt hashed; no full auth provider)
  - Steps 2 & 3: dynamic components from admin config (About, Address, Birthdate)
  - Back/forward navigation; values preserved across steps
  - Session resume via httpOnly cookie `onboarding_session_id`
- Admin config (`/admin`)
  - Assign each component to Page 2 or Page 3 via 2/3 buttons
  - Save button applies all changes atomically
  - Enforces: each component is assigned once, both pages non-empty
- Public data table (`/data`)
  - Lists users + profile fields; useful for verification

## URLs

- `/` Onboarding wizard
- `/admin` Admin configuration (no auth per spec)
- `/data` Public data table (no auth)

## API (Netlify Functions)

- `POST /api/onboarding-start` → `{ email, password }`
  - Upserts user (stores bcrypt hash), creates/resumes session cookie, returns `{ currentStep, config }`
- `POST /api/onboarding-save` → `{ step, data }` (step ∈ 2|3)
  - Saves any provided profile fields; advances `current_step`
- `GET /api/onboarding-me`
  - Returns `{ currentStep, config }` from session
- `GET /api/config`
  - Returns `{ page2, page3 }`
- `POST /api/config` → `{ page2: string[], page3: string[] }`
  - Assigns components; validates that both pages are non-empty and all 3 components appear exactly once
- `GET /api/data`
  - Returns user + profile rows for `/data`
- `POST /api/logout`
  - Clears session cookie

## Database

Schema/migrations are in `supabase.sql`.

Tables:
- `users(id, email, password_hash, created_at, updated_at)`
- `user_profiles(user_id, about_me, birthdate, address_street, address_city, address_state, address_zip, updated_at)`
- `onboarding_sessions(id, user_id, current_step, created_at, updated_at)`
- `onboarding_components(component, page)` — each of `about|address|birthdate` assigned to 2 or 3

Apply: open Supabase SQL Editor, paste contents of `supabase.sql`, run.

## Environment

Set these (Netlify UI → Site settings → Build & deploy → Environment) and also create a local `.env` for `netlify dev`:

- `SUPABASE_URL` (e.g., `https://xxxx.supabase.co`)
- `SUPABASE_SERVICE_ROLE_KEY` (service role key; server-side only)

Note: The service key is used by functions only; the browser never sees it.

## Local development

```bash
npm install
# create .env with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
netlify dev
# open http://localhost:8888
```

Vite-only (`npm run dev`) runs the frontend without functions. Use `netlify dev` for full-stack local dev.

## Build & deploy (Netlify)

- Add new site from Git → select this repo
- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory is configured in `netlify.toml`
- Set env vars in the UI (see Environment section)

## Notes

- If admin changes config while a user is mid-flow, the user keeps their current step/config until refresh. Saved data remains valid.
- Cookie is `secure` in production and non-secure locally for localhost testing.
- Admin auth and RLS are omitted per exercise; in production, secure `/admin` and write RLS policies.

## Scripts

```bash
npm run dev       # vite (frontend only)
netlify dev       # frontend + functions locally
npm run build     # typecheck + vite build
npm run preview   # serve built app locally
```

## Structure

```
netlify/functions/   # serverless functions (API)
src/routes/          # Onboarding, Admin, Data routes
supabase.sql         # database schema + seed
netlify.toml         # redirects & functions config
```

## Submission checklist

- Update README with live Netlify URL and repo URL
- Supabase schema applied
- Netlify env vars set
- Manual test of `/`, `/admin`, `/data`
