# Product Requirements Document
## White Crane Training Collective — Website + DBT Clinical Directory
**Prepared by:** Autolinium · **Based on:** Proposal v6.0, Aug 2026 · **PRD Version:** 1.0

---

## 1. Overview

Build a website with 4 modules, 3 user roles, 4-week delivery. Public-facing training catalog + resources, plus a gated clinical-team directory with an application → review → publish workflow.

**Core modules:**
1. Landing page (mission, board bios)
2. Trainings (catalog + detail pages, external registration links)
3. Clinical Directory (application form → Directorate review → public directory)
4. Resources + distribution list (signup, exportable)

**Explicitly out of scope (v1):** on-site payments, newsletter sending, individual clinician sub-listings, automated renewal emails, paid membership tiers. All flagged as future phases below.

---

## 2. What's Needed From the Client (checklist)

Collect all of this before Week 1 starts — late items push the timeline 1:1.

| Item | Detail needed | Blocks |
|---|---|---|
| **Domain** | Registrar login or nameserver access, or the domain name if registered elsewhere (need DNS access to point A/CNAME records) | Go-live, SSL |
| **Branding** | Logo (vector/SVG preferred), color hex codes, font names/files or Google Fonts picks | Design pass, Week 1 |
| **Landing content** | Mission/vision/values text, board member names + photos + bios (if using board page) | Landing page |
| **Training content** | List of trainings: title, date/time, description, objectives, agenda, trainer names, registration URL per training | Trainings module |
| **Attestation wording** | Legal/clinical text for the DBT fidelity attestation on the application form | Application form, Week 1 latest |
| **Directory fields** | Confirm exactly what's public per listing: agency name, location, website/contact — anything else? | Directory schema |
| **Roles/people** | Who gets Administrator logins (names + emails), who gets Directorate logins (names + emails) | Auth setup |
| **Resources content** | Links, downloadable forms/files to seed the resources page | Resources module |
| **First payment** | Per proposal terms | Work start |
| **Email sender identity** | Domain-verified "from" address for distribution-list signups (SPF/DKIM access on the domain) | Distribution list deliverability |
| **Registration platform** | Which external platform (Eventbrite, etc.) so registration links/buttons match its URL pattern | Trainings module |

---

## 3. User Structure

| Role | Access | Can do |
|---|---|---|
| **Board of Directors** | Owns everything; not necessarily a login-holding role day-to-day | Approves scope/changes; ultimate content owner |
| **Administrator** (White Crane staff, multiple seats) | Dashboard login, scoped to landing + trainings + resources + distribution list | Edit landing copy, board bios; CRUD trainings; edit resources; export distribution list |
| **Directorate** (separate group, multiple seats) | Dashboard login, scoped to Clinical Directory only | Review applications, approve/decline/request-info, view renewal-due list, edit published listing status |
| **Public visitor** | No login | Browse landing, trainings, public directory, resources; submit team application; sign up for distribution list |

Two logins, two dashboards-in-one — same shell, role-based nav so each sees only its own area (matches the "separate logins, separate areas" requirement in the proposal).

**Auth model:** email + password with reset flow, or magic-link. Role stored on user record; middleware gates routes by role. No self-serve signup for Admin/Directorate — accounts created by a super-admin (Autolinium, handed off post-launch) or seeded via invite link.

---

## 4. Site / Project Structure

```
Public site
├── / (landing)
├── /about (board bios — optional)
├── /trainings
│   ├── /trainings/[slug] (detail page)
│   └── /trainings/upcoming (not-yet-open list)
├── /directory
│   └── /directory/apply (team application form)
├── /resources
└── /subscribe (distribution list signup — likely embedded, not standalone)

Dashboard (role-gated, e.g. /dashboard/*)
├── /dashboard (role-based redirect)
├── Administrator area
│   ├── /dashboard/landing (edit copy, board bios)
│   ├── /dashboard/trainings (CRUD)
│   ├── /dashboard/resources (CRUD)
│   └── /dashboard/subscribers (view/export list)
└── Directorate area
    ├── /dashboard/applications (queue: pending/approved/declined/info-requested)
    ├── /dashboard/applications/[id] (review + decision)
    └── /dashboard/listings (published directory, renewal-due view)
```

---

## 5. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js (React) | SSR/SSG for public pages = fast + SEO-friendly directory/training pages; one codebase for public + dashboard |
| Styling | Tailwind CSS | Fast to theme to client branding, small footprint |
| Backend | Next.js API routes (or a small Express service if logic grows) | No separate backend to deploy/maintain at this scale |
| Database | PostgreSQL | Relational fit for applications→listings→renewals, roles, trainings |
| ORM | Prisma | Type-safe schema, migrations |
| Auth | NextAuth.js (credentials or magic-link) or Clerk if budget allows managed auth | Role-based session, less custom security code to maintain |
| File/image storage | S3-compatible object storage (AWS S3, Cloudflare R2, or Backblaze B2) | Logos, board photos, resource downloads |
| Email delivery | Postmark or SendGrid (transactional) | Distribution-list signup confirmations, application notifications — not the future newsletter-sending feature |
| Hosting | Vercel (app) + managed Postgres (Neon/Supabase/RDS) — **or** single VPS running everything (Docker) | See §7 Scaling Options |
| DNS/SSL | Client's registrar DNS + auto SSL (Vercel/Caddy/Let's Encrypt) | |

---

## 6. Build Pipeline (Week-by-Week, expanded from proposal)

| Week | Engineering tasks |
|---|---|
| **1** | Repo + infra scaffold, DB schema v1, auth + roles, design system applied (client branding), landing page built + editable fields wired, application form built |
| **2** | Directorate dashboard + review workflow (approve/decline/request-info + status emails), public directory (search/filter by agency/location), trainings CRUD + detail pages + upcoming list, resources CRUD |
| **3** | Distribution list signup + storage + export, transactional emails wired (Postmark/SendGrid), full content load from client assets, cross-role QA, client review pass, fixes |
| **Buffer/sign-off** | Final walkthrough with Board/Admins/Directorate, credentials handed over, DNS cutover, go-live |

Timeline starts when client checklist (§2) is delivered, not from signature — same as proposal.

---

## 7. Scaling Options

Traffic profile here is low-to-moderate (a training collective's public site + a gated review workflow) — don't over-build, but leave room.

| Stage | Setup | Cost posture |
|---|---|---|
| **Launch (v1)** | Vercel Hobby/Pro + managed Postgres free/starter tier (Neon or Supabase) + R2/S3 free tier | Lowest cost, near-zero ops |
| **Growth** (more trainings, more directory traffic) | Vercel Pro, Postgres upgraded tier (more storage/connections), CDN already included via Vercel | Scales with usage, no re-architecture needed |
| **Heavier/self-hosted preference** | Single VPS (Docker Compose: app + Postgres + object storage or S3), reverse proxy (Caddy/nginx), managed backups | Predictable flat monthly cost, more ops burden on whoever maintains it post-handoff |
| **Future: payments on-site** | Add Stripe, likely needs a background job runner (webhooks) — still fits Next.js API routes or a small worker | Already structured for this per proposal §3 |
| **Future: automated renewal emails** | Add a scheduled job (Vercel Cron, or a cron on the VPS) hitting the renewal-due query | Small addition once directory is real |

Recommendation: start on the managed stack (Vercel + Neon/Supabase + R2) for launch — cheapest, least maintenance, and every future item in §3 of the proposal layers on without rebuilding.

---

## 8. Ongoing Subscriptions / Infrastructure Costs

**Not included:** any AI/LLM tooling costs — infra only, what keeps the site running.

| Service | Purpose | Approx. monthly (USD) |
|---|---|---|
| Domain renewal | Already client-owned typically | ~$1–2/mo (annual) |
| Hosting (Vercel Pro) | App hosting, CDN, SSL | $20/mo (or $0 on Hobby if traffic is light — Hobby is not for commercial use per Vercel ToS, worth checking) |
| Managed Postgres (Neon/Supabase) | Database | $0–25/mo depending on tier |
| Object storage (R2/S3) | Images, downloadable resources | $0–5/mo at this scale (R2 has no egress fee) |
| Transactional email (Postmark) | Signup confirmations, review notifications | $0–15/mo (free tier covers low volume) |
| Backups | DB snapshot storage, if not bundled with managed Postgres tier | $0–5/mo |
| **Estimated total** | | **roughly $20–70/mo** depending on tiers chosen |

*(VPS alternative: a single $10–20/mo VPS — e.g., Hetzner/DigitalOcean — running Docker Compose covers app + DB + storage in one line item, trading cost for the client needing someone to manage updates/security patches.)*

---

## 9. Pipeline for Future Updates (post-launch)

- **Source control:** Git repo (GitHub), main branch = production, feature branches + PR review before merge.
- **CI:** on PR — lint, type-check, build; on merge to main — auto-deploy (Vercel does this natively; VPS route needs a simple GitHub Actions → SSH deploy script).
- **DB migrations:** Prisma migrations versioned in repo, run as part of deploy step — never hand-edit the production DB.
- **Staging environment:** a preview deploy (Vercel gives this per-PR automatically) or a second VPS/subdomain for the Docker route — lets Admin/Directorate test before go-live on changes.
- **Handoff options for who owns "future":**
  1. Client requests each future-phase item (§3 of proposal) as a separately scoped project, same as stated.
  2. A lightweight maintenance retainer for bug fixes/small tweaks between larger phases, if desired.
- **Monitoring:** basic uptime check (free tier — UptimeRobot or Vercel's built-in) + error logging (Sentry free tier) so issues surface before a user reports them.

---

## 10. Structural Implementation Plan

### 10.1 Data model (core tables)

```
User        (id, email, password_hash/magic-link, role[admin|directorate], name)
Training    (id, title, slug, date, time, description, objectives, agenda, trainer, registration_url, status[open|upcoming])
Application (id, agency_name, location, contact_info, attestation_signed_at, status[pending|approved|declined|info_requested], submitted_at, reviewed_by, reviewed_at)
Listing     (id, application_id FK, agency_name, location, contact, published_at, renewal_due_at)
Resource    (id, title, url_or_file, description, category)
Subscriber  (id, email, subscribed_at, source)
```

### 10.2 Implementation phases (engineering-level, maps to §6)

1. **Scaffold** — repo, Next.js + Tailwind + Prisma init, environment configs (dev/staging/prod), CI skeleton.
2. **Auth & roles** — User table, session handling, role-gated middleware on `/dashboard/*`.
3. **Landing** — editable content blocks (CMS-lite: fields stored in DB, edited via Admin dashboard forms, not hardcoded).
4. **Trainings** — CRUD + public list/detail/upcoming views.
5. **Clinical Directory** — Application table + public form + Directorate review queue + decision actions (approve → creates Listing) + public searchable directory + renewal-due view.
6. **Resources & Subscribers** — CRUD + public list; signup form → Subscriber table + export-to-CSV for Admin.
7. **Transactional email** — wire Postmark/SendGrid for: application received, application decision, subscriber confirmation.
8. **Content load** — client assets go in per §2 checklist.
9. **QA pass** — role-by-role walkthrough (Admin, Directorate, public/anonymous).
10. **Go-live** — DNS cutover, SSL verify, credential handoff, final sign-off per proposal.

### 10.3 Open questions to resolve with client before/at kickoff

- Exact public directory fields — confirm nothing beyond agency/location/contact is shown.
- Who counts as "Administrator" — how many seats, is there tiering among admins?
- Distribution list: opt-in language / consent wording for compliance (even though sending itself is out of scope).
- Preferred hosting posture — managed (Vercel-style) vs. self-hosted VPS — affects §7/§8 and who patches it later.