# White Crane Training Collective Website

Public site + role-gated dashboard. DBT Clinical Directory with application → review → publish workflow.
Client: White Crane Training Collective (Ronda Oswalt Reitz). Built by Autolinium. Scope: Proposal v6.0 / PRD v1.1.

## Files in this folder

| File | What |
|---|---|
| `white_crane_wireframes.html` | All 28 screens, self-contained. Open in browser. Left sidebar switches screens, "Show all" stacks them. |
| `README.md` | This file. |

Figma source of the same wireframes: https://www.figma.com/design/Cs0CqbmsybQlxUprrWBsWm

## Stack

- Frontend: React 18 + Vite + TypeScript, React Router, TanStack Query, react-hook-form + zod, Tailwind + shadcn/ui
- Backend: FastAPI (Python 3.12), SQLAlchemy 2 + Alembic, Pydantic v2, JWT auth (httpOnly cookie)
- DB: PostgreSQL 16
- Storage: S3-compatible (Cloudflare R2) via boto3, presigned uploads
- Email: Resend or Postmark, Jinja2 templates
- Tooling: pnpm (web), uv (api), Docker Compose for local Postgres + Mailpit, GitHub Actions

## Roles

| Role | Sees in dashboard |
|---|---|
| board | everything, creates other users |
| trainer | Trainings only |
| directorate | Applications, Listings, Renewals due only |
| public | no login: browse, apply, subscribe |

Board is the only role that manages Resources, Subscribers, Users, Landing content. Confirm with Ronda whether Trainers also need Subscribers export.

## Repo layout

```
white-crane/
├── apps/
│   ├── web/                    React + Vite
│   │   └── src/
│   │       ├── api/            fetch client, typed endpoints
│   │       ├── auth/           session context, <RequireRole>
│   │       ├── components/
│   │       │   ├── ui/         shadcn
│   │       │   ├── layout/     PublicLayout, DashboardLayout, Sidebar, Topbar
│   │       │   └── forms/      TrainingForm, ApplicationForm, ResourceForm
│   │       ├── pages/
│   │       │   ├── public/     Home, About, trainings/, directory/, Resources, Subscribed
│   │       │   ├── auth/       Login, ForgotPassword, ResetPassword, AcceptInvite
│   │       │   └── dashboard/  Index, landing/, trainings/, directory/, resources/, subscribers/, users/, Account
│   │       ├── hooks/
│   │       └── lib/            zod schemas, formatters
│   └── api/                    FastAPI
│       ├── app/
│       │   ├── main.py
│       │   ├── core/           config, security, deps (get_db, current_user, require_role)
│       │   ├── db/
│       │   ├── models/         user, training, application, listing, resource, subscriber, site_content, board_member, invite, password_reset
│       │   ├── schemas/
│       │   ├── services/       applications (approve → listing), email, storage, export
│       │   ├── routers/        public/, auth/, admin/
│       │   ├── emails/         jinja templates
│       │   └── jobs/           renewal reminders (future)
│       ├── alembic/
│       └── tests/
├── infra/docker-compose.yml    postgres + mailpit
└── .github/workflows/
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
/dashboard                       role redirect
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
GET  /public/content                 GET  /public/board-members
GET  /public/trainings               GET  /public/trainings/upcoming      GET /public/trainings/{slug}
GET  /public/directory?q=&location=  POST /public/applications
GET  /public/resources               POST /public/subscribe

POST /auth/login | refresh | logout | forgot | reset | accept-invite

/admin/* CRUD mirrors dashboard pages
POST /admin/applications/{id}/approve | decline | request-info
GET  /admin/subscribers/export.csv
POST /admin/users/invite
```

## Data model (tables)

users, site_content (key/value blocks), board_members, trainings, applications,
listings (1:1 from approved application, renewal_due_at), resources, subscribers, invites, password_resets

Application status: pending | approved | declined | info_requested
Training status: open | upcoming
Listing: hidden automatically when renewal_due_at passes, never deleted

## Setup

```bash
# prerequisites: node 20+, pnpm, python 3.12, uv, docker

git init white-crane && cd white-crane

# frontend
mkdir -p apps && cd apps
pnpm create vite web --template react-ts
cd web
pnpm add react-router-dom @tanstack/react-query react-hook-form zod @hookform/resolvers
pnpm add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npx shadcn@latest init
cd ..

# backend
mkdir api && cd api
uv init --python 3.12
uv add fastapi "uvicorn[standard]" sqlalchemy alembic psycopg[binary] pydantic-settings python-jose[cryptography] passlib[bcrypt] boto3 jinja2 resend
uv add --dev pytest httpx ruff
alembic init alembic
cd ../..

# local services
docker compose -f infra/docker-compose.yml up -d
```

`infra/docker-compose.yml`

```yaml
services:
  db:
    image: postgres:16
    environment: {POSTGRES_USER: wc, POSTGRES_PASSWORD: wc, POSTGRES_DB: whitecrane}
    ports: ["5432:5432"]
    volumes: [pg:/var/lib/postgresql/data]
  mail:
    image: axllent/mailpit
    ports: ["8025:8025", "1025:1025"]
volumes: {pg: {}}
```

## Environment

`apps/api/.env`

```
DATABASE_URL=postgresql+psycopg://wc:wc@localhost:5432/whitecrane
JWT_SECRET=change-me
ACCESS_TOKEN_MINUTES=15
REFRESH_TOKEN_DAYS=14
FRONTEND_URL=http://localhost:5173
EMAIL_PROVIDER=mailpit            # resend | postmark | mailpit
EMAIL_FROM=info@whitecrane.org
RESEND_API_KEY=
S3_ENDPOINT=                      # R2 endpoint
S3_BUCKET=whitecrane
S3_ACCESS_KEY=
S3_SECRET_KEY=
```

`apps/web/.env`

```
VITE_API_URL=http://localhost:8000
```

## Run

```bash
# api
cd apps/api && uv run uvicorn app.main:app --reload --port 8000
# web
cd apps/web && pnpm dev
```

## Using the wireframes

Open `white_crane_wireframes.html`. Each screen's markup lives in `S['Screen name']` inside the `<script>`.
Shared pieces map straight to components:

| In HTML | React component |
|---|---|
| `nav()` + `footer` | `PublicLayout` |
| `shell()` | `DashboardLayout` (Sidebar, Topbar) |
| `card()` | `Card` |
| `field()` | `Field` (label + input) |
| `table()` | `DataTable` |
| `.badge` | `Badge` with variants ok / warn / bad / acc |
| `.stat` | `StatCard` |

CSS tokens in `:root` are placeholders. Replace with client palette and fonts when branding arrives; nothing else should need to change.

## Build order (maps to PRD week plan)

1. Scaffold both apps, docker compose, CI lint + typecheck + pytest
2. Auth: users table, login/refresh/logout, invite flow, `require_role` dependency, `<RequireRole>` guard
3. Dashboard shell + role-based sidebar
4. Landing content + board members (CMS-lite, key/value blocks)
5. Trainings CRUD + public list / detail / upcoming
6. Directory: application form, review queue, approve → listing, public search, renewals view
7. Resources + subscribers + CSV export
8. Transactional email: application received, decision, subscribe confirm, invite, reset
9. Content load, role-by-role QA, go-live

## Open before coding

- Trainer role: PRD sent to Ronda still says Admin/Directorate. Confirm scope or update PRD.
- Subscribers export: board only, or trainers too.
- Prerender public pages for SEO (vite-plugin-prerender) or accept SPA. Decide day one.
- Hosting: managed (Vercel/CF Pages + Railway/Fly + Neon) vs single VPS. Recommendation is managed.
