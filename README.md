# Bug Tracker

A full-stack bug tracking application built with React, TypeScript, Express, and PostgreSQL.

## Features

- **Log Bugs** — Submit bugs with title, severity, progress stage, reporter name, estimated fix time, and date
- **Bug List** — Browse all bugs with multi-select filters for progress, severity, date range, and reporter
- **Analytics** — Visual dashboard with progress distribution (pie), bug funnel, weekly severity (stacked bar), and average estimated fix time for live bugs

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, Radix UI, Recharts |
| Backend | Node.js, Express 4, TypeScript |
| Database | PostgreSQL |
| Testing | Vitest + Testing Library (UI), Jest + Supertest (backend) |

## Prerequisites

- Node.js 18+
- PostgreSQL 14+

## Setup

### 1. Database

```bash
createdb bug_tracker
psql bug_tracker -f backend/migrations/001_create_bugs.sql
```

Optionally seed with sample data:

```bash
cd backend
npm install
npm run seed
```

### 2. Backend

```bash
cd backend
cp .env.example .env       # then edit DATABASE_URL and PORT
npm install
npm run dev                # starts on http://localhost:3001
```

### 3. Frontend

```bash
cd ui
npm install
npm run dev                # starts on http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:3001` automatically.

## Environment Variables

**`backend/.env`**

| Variable | Example | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgres://postgres:password@localhost:5432/bug_tracker` | PostgreSQL connection string |
| `PORT` | `3001` | Port the API server listens on |

## Running Tests

**Backend** (requires a local `bug_tracker_test` database):

```bash
cd backend
TEST_DATABASE_URL=postgres://postgres:password@localhost:5432/bug_tracker_test npm test
```

**Frontend:**

```bash
cd ui
npm test
```

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/bugs` | Create a new bug |
| `GET` | `/api/bugs` | List bugs (supports `progress`, `severity`, `date_range`, `reporter_name` query params) |
| `GET` | `/api/bugs/reporters` | List distinct reporter names |
| `GET` | `/api/analytics/progress-distribution` | Bug counts grouped by progress stage |
| `GET` | `/api/analytics/weekly-severity` | Weekly bug counts grouped by severity |
| `GET` | `/api/analytics/avg-dev-to-live` | Average estimated fix hours for Live bugs |
| `GET` | `/api/analytics/funnel` | Bug counts per stage ordered for funnel visualization |
| `GET` | `/health` | Health check |

## Project Structure

```
bug-tracker/
├── backend/
│   ├── migrations/        # SQL schema
│   ├── scripts/           # Seed script
│   └── src/
│       ├── app.ts         # Express app factory
│       ├── db.ts          # PostgreSQL pool
│       ├── routes/        # bugs.ts, analytics.ts
│       └── __tests__/     # Integration tests (Jest + Supertest)
└── ui/
    └── src/
        ├── components/    # Layout, Navbar, shared UI primitives
        ├── pages/         # LogBugPage, BugListPage, AnalyticsPage
        └── __tests__/     # Component tests (Vitest + Testing Library)
```
