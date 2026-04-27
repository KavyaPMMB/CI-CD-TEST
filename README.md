# MERN Todo Demo (Supabase Auth)

A modern full-stack Todo app built with:
- MongoDB + Mongoose
- Express + Node.js
- React + Vite.
- Tailwind CSS + Framer Motion + DnD Kit

## Features

- Supabase email/password authentication (signup, login, logout)
- Todo CRUD (create, read, update, delete)
- Inline edit, complete/incomplete toggle
- Filter tabs (All / Pending / Completed)
- Drag-and-drop reordering (All tab)
- Light/Dark theme toggle
- Toast notifications, loading and empty states
- Glassmorphism-inspired responsive UI

## Project Structure

- `backend/` Express API + MongoDB models/routes/controllers
- `frontend/` React Vite UI

## Backend Setup

1. Go to `backend`
2. Copy `.env.example` to `.env`
3. Set `MONGODB_URI`
4. (Recommended) set `SUPABASE_URL` to verify Supabase JWTs server-side
5. Install and run:

```bash
npm install
npm run dev
```

Server runs on `http://localhost:5000`.

### Auth Notes

- Frontend login/signup uses Supabase directly via `@supabase/supabase-js`.
- Backend protects `/todos` by validating Bearer JWT tokens.
- If `SUPABASE_URL` is set, backend verifies tokens against Supabase JWKS.
- If `SUPABASE_URL` is empty, backend falls back to local JWT secret mode (useful for tests/CI).

### Todo Endpoints (Auth Required)

- `GET /todos`
- `POST /todos`
- `PUT /todos/:id`
- `PUT /todos/reorder`
- `DELETE /todos/:id`

## Frontend Setup

1. Go to `frontend`
2. Copy `.env.example` to `.env`
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
4. Install and run:

```bash
npm install
npm run dev
```

App runs on `http://localhost:5173`.

In development, Vite proxies API calls to the backend.

## Testing

### Backend tests (Mocha + Supertest)

```bash
npm run test:backend
```

Runs integration tests against a MongoDB instance. By default it uses `mongodb://127.0.0.1:27017/mern_todos_test` (override with `MONGODB_URI_TEST`).

### Selenium E2E test

```bash
npm run test:e2e
```

Starts backend and frontend, runs a headless Chrome Selenium flow (signup/login -> add todo -> logout), then shuts down servers.

### Load test (k6)

```bash
npm run test:load
```

Uses **Grafana k6** against `GET /health` with thresholds (errors + p95 latency). Install k6 first: [k6 installation](https://grafana.com/docs/k6/latest/set-up/install-k6/).

### Grafana Cloud k6

To push load test metrics to Grafana Cloud dashboards from CI:

1. Create a k6 Cloud API token in Grafana Cloud.
2. Add GitHub Actions secret: `K6_CLOUD_TOKEN`.
3. CI `load-test` job will automatically run:

```bash
npm run test:load:cloud
```

This uses local execution against your CI-started backend and streams results to Grafana Cloud (`k6 run -o cloud ...`).

**Visualization**

- CI uploads `k6-summary.json` as a workflow artifact (download from the Actions run).
- Locally, the same file is written to the repo root after `npm run test:load` (gitignored).
- For live charts in the browser, enable k6’s built-in web dashboard (start the API first, then run):

```bash
set K6_WEB_DASHBOARD=true
k6 run -e BASE_URL=http://localhost:5000 ./tests/load/k6-smoke.js
```

Then open `http://127.0.0.1:5665` (see [k6 web dashboard docs](https://grafana.com/docs/k6/latest/results-output/web-dashboard/)).

- Optional HTML export at the end of a run:

```bash
set K6_WEB_DASHBOARD=true
set K6_WEB_DASHBOARD_EXPORT=k6-report.html
k6 run -e BASE_URL=http://localhost:5000 ./tests/load/k6-smoke.js
```

- For hosted dashboards, use **Grafana Cloud k6**. In this project we use `k6 run -o cloud` so traffic still targets local CI services while metrics are visualized in Grafana Cloud.

### Full pre-deployment gate

```bash
npm run test:all
```

This executes backend tests, frontend build, Selenium E2E, and load tests in sequence.

## CI/CD Pipeline

GitHub Actions workflow: `.github/workflows/ci.yml`

Pipeline stages:
- Backend Mocha tests
- Frontend build
- Selenium E2E
- Load test
- Deploy job gated on all checks

The deploy step is intentionally a placeholder command so you can plug in your actual hosting provider deployment command.
