# White Crane Training Collective Website

Public site + role-gated dashboard. DBT Clinical Directory with application → review → publish workflow.
Client: White Crane Training Collective (Ronda Oswalt Reitz). Built by Autolinium. Scope: Proposal v6.0 / PRD v1.1.

## Reference material

| Path                                    | What                                                                                                      |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `wireframe/white_crane_wireframes.html` | All 28 screens, self-contained. Open in a browser. Left sidebar switches screens, "Show all" stacks them. |
| `PRD.md`, `docs/`                       | PRD and proposal                                                                                          |

Figma source of the same wireframes: https://www.figma.com/design/Cs0CqbmsybQlxUprrWBsWm

## Stack

- Frontend: React 19 + Vite + TypeScript, React Router 7, TanStack Query, react-hook-form + zod, Tailwind v4 + shadcn-style components
- Backend: FastAPI (Python 3.12), SQLAlchemy 2 + Alembic, Pydantic v2, JWT auth (PyJWT, httpOnly cookies), bcrypt
- DB: PostgreSQL 16
- Storage: S3-compatible (Cloudflare R2) via boto3, presigned uploads
- Email: Resend or Postmark (Mailpit locally), Jinja2 templates
- Tooling: pnpm (web), uv (api), Docker Compose for local Postgres + Mailpit, GitHub Actions

## Roles

| Role        | Sees in dashboard                         |
| ----------- | ----------------------------------------- |
| board       | everything, creates other users           |
| trainer     | Trainings only                            |
| directorate | Applications, Listings, Renewals due only |
| public      | no login: browse, apply, subscribe        |

Board is the only role that manages Resources, Subscribers, Users, Landing content. Roles are enforced twice: `require_role` on the API (source of truth) and `<RequireRole>` in the router (UI only).

## Repo layout

```
white_crane/
├── apps/
│   ├── web/                        React + Vite
│   │   └── src/
│   │       ├── api/                client.ts (fetch + cookie refresh), endpoints.ts (typed), types.ts, mock.ts
│   │       ├── auth/               SessionProvider, useSession, RequireRole, roles.ts (sidebar + role homes)
│   │       ├── components/
│   │       │   ├── ui/             button, card, input, badge, table, tabs, dialog, placeholder
│   │       │   ├── layout/         PublicLayout, DashboardLayout (Sidebar, Topbar), AuthLayout, Section, Logo
│   │       │   ├── forms/          Field, ApplicationForm, TrainingForm, ResourceForm, SubscribeForm
│   │       │   └── DataTable, StatCard, TrainingCard, PageState
│   │       ├── pages/
│   │       │   ├── public/         Home, About, trainings/, directory/, Resources, Subscribed
│   │       │   ├── auth/           Login, ForgotPassword, ResetPassword, AcceptInvite
│   │       │   └── dashboard/      Index, landing/, trainings/, directory/, resources/, subscribers/, users/, Account
│   │       ├── hooks/              queries.ts (TanStack Query hooks + keys), useDocumentTitle
│   │       ├── lib/                schemas.ts (zod), format.ts, status.ts, training.ts, utils.ts
│   │       └── router.tsx          all routes, lazy-loaded per page
│   └── api/                        FastAPI
│       ├── app/
│       │   ├── main.py
│       │   ├── seed.py             create the first Board invite
│       │   ├── core/               config, security (JWT cookies, bcrypt, tokens), deps (get_db, current_user, require_role)
│       │   ├── db/                 Base, session
│       │   ├── models/             user, training, application, listing, resource, subscriber, site_content, board_member, invite, password_reset
│       │   ├── schemas/
│       │   ├── services/           applications (approve → listing), content, users (invites), email, storage, export
│       │   ├── routers/            public/, auth/, admin/
│       │   ├── emails/             Jinja templates
│       │   └── jobs/               renewal_reminders (future phase stub)
│       ├── alembic/
│       └── tests/
├── infra/docker-compose.yml        postgres + mailpit
├── wireframe/
└── .github/workflows/ci.yml
```

## Routes

```
Public
/                     /about
/trainings            /trainings/upcoming        /trainings/:slug
/directory            /directory/apply           /directory/apply/submitted
/resources            /subscribed
/login  /forgot-password  /reset-password/:token  /invite/:token

Dashboard  (/dashboard/*)
/dashboard                       board overview; trainer → /trainings, directorate → /applications
/dashboard/landing               board
/dashboard/board-members         board
/dashboard/trainings[/new|/:id]  board, trainer
/dashboard/applications[/:id]    board, directorate
/dashboard/listings              board, directorate
/dashboard/renewals              board, directorate
/dashboard/resources[/:id]       board
/dashboard/subscribers           board
/dashboard/users                 board
/dashboard/account               all
```

## API surface

```
GET  /health

GET  /public/content                 GET  /public/board-members
GET  /public/trainings               GET  /public/trainings/upcoming      GET /public/trainings/{slug}
GET  /public/directory?q=&location=  POST /public/applications
GET  /public/resources               POST /public/subscribe               GET /public/subscribe/confirm/{token}

POST /auth/login | refresh | logout | forgot | reset | accept-invite
GET  /auth/me                        GET  /auth/invite/{token}

/admin/* mirrors the dashboard pages
GET  /admin/summary
GET|PATCH /admin/content
CRUD /admin/board-members            POST /admin/board-members/reorder
CRUD /admin/trainings
GET  /admin/applications[?status=]   POST /admin/applications/{id}/approve | decline | request-info
GET  /admin/listings[?renewal=next_30|next_90|overdue]   PATCH /admin/listings/{id}   POST /admin/listings/{id}/renew
CRUD /admin/resources                POST /admin/uploads/presign (Board + Trainer)
PUT  /uploads/{key}?token=  GET /files/{key}   local dev storage only (S3_ENDPOINT empty)
GET  /admin/subscribers              GET  /admin/subscribers/export.csv   DELETE /admin/subscribers/{id}
GET  /admin/users                    POST /admin/users/invite   POST /admin/users/{id}/resend-invite   PATCH /admin/users/{id}
PATCH /admin/account                 POST /admin/account/password
```

Interactive docs at http://localhost:8000/docs when the API is running.

## Data model (tables)

users, site_content (key/value blocks), board_members, trainings, applications,
listings (1:1 from approved application, renewal_due_at), resources, subscribers, invites, password_resets

- Application status: pending | approved | declined | info_requested. Approve creates the listing; decided applications cannot be decided again; request-info requires a note.
- Training status: open | upcoming
- Listing: hidden automatically when renewal_due_at passes, never deleted. "Mark renewed" sets it one year out.
- All timestamps are stored as naive UTC.

## Setup

Prerequisites: node 20+, pnpm, python 3.12, uv, and Docker for Postgres + Mailpit (or SQLite, see below).

```bash
pnpm install                                   # web deps (workspace root)
cd apps/api && uv sync && cd ../..             # api deps
docker compose -f infra/docker-compose.yml up -d

cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env         # then set JWT_SECRET

# database (migrations live in apps/api/alembic/versions)
cd apps/api
uv run alembic upgrade head
uv run python -m app.seed --email you@whitecrane.org --name "Your Name" --password "a-long-password"
uv run python -m app.seed_demo                 # optional: wireframe placeholder content
```

- `app.seed` without `--password` prints an invite link instead (the normal way to create the real first Board account).
- `app.seed_demo` only runs on an empty database. It leaves registration URLs blank: they must be the real event pages on the client's registration platform, entered per training in the dashboard.
- After changing models: `uv run alembic revision --autogenerate -m "..."`, review the file, commit it.

No Docker? Set `DATABASE_URL=sqlite:///./dev.db` and `EMAIL_PROVIDER=console` in `apps/api/.env` (emails, including invite and reset links, are then printed in the API log). Production stays on Postgres.

No uv? `python -m venv .venv`, activate it, then `pip install fastapi "uvicorn[standard]" sqlalchemy alembic "psycopg[binary]" "pydantic[email]" pydantic-settings pyjwt bcrypt boto3 jinja2 resend httpx pytest ruff` and drop the `uv run` prefix from the commands.

Uploads (resource files, training covers, board photos, hero image): with `S3_ENDPOINT` empty the API stores them in `apps/api/uploads/` and serves them at `/files/`. Set the `S3_*` variables to use Cloudflare R2 in production.

`infra/docker-compose.yml`

```yaml
services:
  db:
    image: postgres:16
    environment:
      { POSTGRES_USER: wc, POSTGRES_PASSWORD: wc, POSTGRES_DB: whitecrane }
    ports: ["5432:5432"]
    volumes: [pg:/var/lib/postgresql/data]
  mail:
    image: axllent/mailpit
    ports: ["8025:8025", "1025:1025"]
volumes: { pg: {} }
```

Mailpit inbox: http://localhost:8025

## Environment

`apps/api/.env`: every variable is documented in [apps/api/.env.example](apps/api/.env.example). Keep comments on their own line; an empty value followed by `# ...` is read as the comment text. Production essentials:

- `JWT_SECRET`: long random string.
- `COOKIE_SECURE=true`. `COOKIE_SAMESITE=lax` when the site and API share a domain (`whitecrane.org` + `api.whitecrane.org`); `none` only if they are on different domains (e.g. `*.vercel.app` + `*.up.railway.app`).
- `FRONTEND_URL` / `API_URL` set to the public URLs; `CORS_ORIGINS` for any extra origins (preview deploys).
- `EMAIL_PROVIDER=resend` or `postmark` with its key; `S3_*` for R2.

`apps/web/.env`

```
VITE_API_URL=http://localhost:8000
VITE_USE_MOCKS=false                # true = in-memory demo data, no API needed
```

With `VITE_USE_MOCKS=true` the frontend runs on in-memory data (`src/api/mock.ts`) with no API or database; changes reset on reload. Sign in with any password: `ronda@whitecrane.org` (Board), `t1@whitecrane.org` (Trainer), `reviewer@directorate.org` (Directorate).

## Run

```bash
# api
cd apps/api && uv run uvicorn app.main:app --reload --port 8000
# web
pnpm dev
```

## Checks (same as CI)

```bash
pnpm lint && pnpm typecheck && pnpm build                  # web
cd apps/api && uv run ruff check . && uv run pytest         # api
```

## Wireframes → code

Each wireframe screen's markup lives in `S['Screen name']` inside the `<script>` of `wireframe/white_crane_wireframes.html`.

| In wireframe HTML            | React                                                                            |
| ---------------------------- | -------------------------------------------------------------------------------- |
| `nav()` + `footer`           | `components/layout/PublicLayout`                                                 |
| `shell()`                    | `components/layout/DashboardLayout` (`DashboardLayout` + `DashboardPage` topbar) |
| `authCard()`                 | `components/layout/AuthLayout` (`AuthCard`)                                      |
| `card()`                     | `components/ui/card`                                                             |
| `field()`                    | `components/forms/Field` (label + input + error)                                 |
| `table()`                    | `components/DataTable`                                                           |
| `.badge`                     | `components/ui/badge`, variants ok / warn / bad / acc                            |
| `.stat`                      | `components/StatCard`                                                            |
| `.box` (grey placeholder)    | `components/ui/placeholder`                                                      |
| "(drawer)" / "(modal)" cards | `components/ui/dialog` with `variant="drawer"` / `"modal"`                       |

| Wireframe screen                                                  | Page                                              |
| ----------------------------------------------------------------- | ------------------------------------------------- |
| Home, Home (mobile 390)                                           | `pages/public/Home` (responsive)                  |
| About                                                             | `pages/public/About`                              |
| Trainings / Training detail / Upcoming trainings                  | `pages/public/trainings/*`                        |
| Directory / Apply to directory / Application submitted            | `pages/public/directory/*`                        |
| Resources / Subscribed                                            | `pages/public/Resources`, `Subscribed`            |
| Login / Forgot / Reset / Accept invite                            | `pages/auth/*`                                    |
| Dashboard home                                                    | `pages/dashboard/Index`                           |
| Landing content / Board members                                   | `pages/dashboard/landing/*`                       |
| Trainings list / Training editor                                  | `pages/dashboard/trainings/*`                     |
| Applications queue / Application review / Listings / Renewals due | `pages/dashboard/directory/*`                     |
| Resources admin                                                   | `pages/dashboard/resources/*`                     |
| Subscribers / Users / My account                                  | `pages/dashboard/subscribers`, `users`, `Account` |

CSS tokens in `apps/web/src/index.css` (`:root`) are the wireframe placeholders. Replace them with the client palette and fonts when branding arrives; nothing else should need to change.

Differences from the wireframes, deliberately:

- Board members reorder with up/down buttons instead of drag and drop.
- Training editor has one "Save and publish" button; the data model has no draft state (PRD: open | upcoming only).

## Build order (maps to PRD week plan)

1. ~~Scaffold both apps, docker compose, CI lint + typecheck + pytest~~
2. ~~Auth: users table, login/refresh/logout, invite flow, `require_role` dependency, `<RequireRole>` guard~~
3. ~~Dashboard shell + role-based sidebar~~
4. ~~Landing content + board members (CMS-lite, key/value blocks)~~ (photo/hero image upload UI still a placeholder)
5. ~~Trainings CRUD + public list / detail / upcoming~~ (cover image upload UI still a placeholder)
6. ~~Directory: application form, review queue, approve → listing, public search, renewals view~~
7. ~~Resources + subscribers + CSV export~~
8. Transactional email: templates and sending are wired; verify deliverability with the real provider (SPF/DKIM)
9. Initial Alembic migration against Postgres, content load, role-by-role QA, go-live

## Open before go-live

- Trainer role: PRD sent to Ronda still says Admin/Directorate. Confirm scope or update PRD.
- Subscribers export: board only, or trainers too.
- Attestation wording: placeholder text in `components/forms/ApplicationForm.tsx`.
- Prerender public pages for SEO (vite-plugin-prerender) or accept SPA. Decide early.
- Hosting: managed (Vercel/CF Pages + Railway/Fly + Neon) vs single VPS. Recommendation is managed. Web and API on the same site (e.g. `whitecrane.org` + `api.whitecrane.org`) so the auth cookies stay first-party.
