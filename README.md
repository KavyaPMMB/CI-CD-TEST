# MERN Todo Demo (with Login)

A modern full-stack Todo app built with:
- MongoDB + Mongoose
- Express + Node.js
- React + Vite
- Tailwind CSS + Framer Motion + DnD Kit

## Features

- JWT authentication (`register`, `login`, `me`)
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
3. Set `MONGODB_URI` and `JWT_SECRET`
4. Install and run:

```bash
npm install
npm run dev
```

Server runs on `http://localhost:5000`.

### Auth Endpoints

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` (Bearer token)

### Todo Endpoints (Auth Required)

- `GET /todos`
- `POST /todos`
- `PUT /todos/:id`
- `PUT /todos/reorder`
- `DELETE /todos/:id`

## Frontend Setup

1. Go to `frontend`
2. Copy `.env.example` to `.env` (optional)
3. Install and run:

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

Runs integration tests against an in-memory MongoDB instance (`mongodb-memory-server`).

### Selenium E2E test

```bash
npm run test:e2e
```

Starts backend and frontend, runs a headless Chrome Selenium flow (register -> add todo -> logout), then shuts down servers.

### Load test

```bash
npm run test:load
```

Runs `autocannon` against the API health endpoint with pass/fail thresholds.

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
# CI-CD-TEST
