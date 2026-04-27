# Skynetclouds Todos (Supabase Auth)

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

## Credentials and Environment Variables

Use these keys in local `.env` files and keep real secrets out of git.

### Backend (`backend/.env`)

```bash
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<db>?retryWrites=true&w=majority&appName=<app-name>

# Local JWT fallback mode (used when SUPABASE_URL is empty)
JWT_SECRET=<strong-random-secret>
JWT_EXPIRES_IN=7d

# Supabase verification mode (recommended for production)
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_JWT_AUD=authenticated
```

### Frontend (`frontend/.env`)

```bash
# Optional. Keep empty to use Vite proxy in local dev.
VITE_API_URL=

# Required for Supabase signup/login UI
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<supabase-anon-key>
```

### Test-only variables

```bash
MONGODB_URI_TEST=mongodb://127.0.0.1:27017/mern_todos_test
E2E_EMAIL=<existing-test-user-email>
E2E_PASSWORD=<existing-test-user-password>
```

### GitHub Actions secret

- `K6_CLOUD_TOKEN` for Grafana Cloud k6 visualization

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

Starts backend and frontend, runs a headless Chrome Selenium flow (login -> add todo -> logout), then shuts down servers.

By default the test logs in with:
- `kavyapmmb1@gmail.com`
- `Kavya@123`

Override via environment variables when needed:

```bash
E2E_EMAIL=your-test-user@example.com E2E_PASSWORD=your-password npm run test:e2e
```

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

## In-App Visual Reports

Inside the app, click `Reports` to view:

- Backend Mocha status from `tests/results/backend-report.json`
- Selenium E2E status and step logs from `tests/results/selenium-report.json`
- k6 summary metrics from `k6-summary.json`
- k6 HTML preview/full-page view from `k6-report.html` (when generated)

Use the refresh icon in the modal to fetch latest test output.

## CI/CD Pipeline

GitHub Actions workflow: `.github/workflows/ci.yml`

Pipeline stages:
- Backend Mocha tests
- Frontend build
- Selenium E2E
- Load test
- Deploy job gated on all checks

The deploy step is intentionally a placeholder command so you can plug in your actual hosting provider deployment command

## Environment Variables 

### Backend

- `PORT` - backend server port (default `5000`)
- `MONGODB_URI` - MongoDB connection string for app data
- `JWT_SECRET` - secret for local JWT fallback auth mode
- `JWT_EXPIRES_IN` - token expiry in fallback mode (example: `7d`)
- `SUPABASE_URL` - Supabase project URL used for JWT verification
- `SUPABASE_JWT_AUD` - expected Supabase JWT audience (usually `authenticated`)

### Frontend

- `VITE_API_URL` - optional API base URL (leave empty in local dev to use proxy)
- `VITE_SUPABASE_URL` - Supabase project URL for frontend auth client
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key for frontend auth client
- `VITE_FORCE_BACKEND_AUTH` - force backend JWT fallback mode for E2E/dev checks

### Test Variables

- `MONGODB_URI_TEST` - MongoDB URI used by backend integration tests
- `E2E_EMAIL` - Selenium login email override
- `E2E_PASSWORD` - Selenium login password override
- `BASE_URL` - k6 target base URL override (example: `http://localhost:5000`)
- `K6_WEB_DASHBOARD` - enable k6 live local dashboard (`true`/`false`)
- `K6_WEB_DASHBOARD_EXPORT` - export k6 HTML report filename (example: `k6-report.html`)

### CI Secret

- `K6_CLOUD_TOKEN` - Grafana Cloud token for `k6 run -o cloud`
