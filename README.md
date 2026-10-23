# TruckBiz — Freight Management Platform

![Node](https://img.shields.io/badge/Node.js-20-green?logo=node.js) ![React](https://img.shields.io/badge/React-18-blue?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql) ![Redis](https://img.shields.io/badge/Redis-7-red?logo=redis) ![Tailwind](https://img.shields.io/badge/TailwindCSS-3-teal?logo=tailwindcss) ![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)

TruckBiz is a full-stack freight management platform for carriers, brokers, and dispatchers operating in the **USA** and **Europe** markets. It lets users browse and pick available freight loads, view AI-powered rate predictions, and manage their operations from a single dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Zustand, React Router v6, Axios |
| Backend | Node.js, Express, TypeScript, Prisma ORM |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Validation | Zod |
| Containerization | Docker + Docker Compose |

---

## Project Structure

```
truckBusinessTrac/
├── frontend/          # React 18 + TypeScript + Vite
├── backend/           # Node.js + Express + TypeScript + Prisma
└── docker-compose.yml
```

---

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose (for PostgreSQL + Redis)
- npm 10+

### 1. Start the database and Redis

```bash
docker-compose up postgres redis -d
```

### 2. Set up the backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Backend runs on `http://localhost:3001`

### 3. Set up the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### 4. Open the app

Navigate to [http://localhost:5173](http://localhost:5173) and register a new account.

---

## Environment Variables (backend `.env`)

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://truckbiz:truckbiz123@localhost:5432/truckbiz` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | Secret key for JWT signing | change in production |
| `PORT` | Backend port | `3001` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:5173` |

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ✗ | Register a new user |
| POST | `/api/auth/login` | ✗ | Login and get JWT token |
| GET | `/api/loads/search` | ✗ | Search available loads |
| POST | `/api/loads/pick/:id` | ✓ | Pick a load |
| GET | `/api/loads/active` | ✓ | Get user's active loads |
| GET | `/api/dashboard` | ✓ | Get dashboard stats |
| GET | `/health` | ✗ | Health check |

---

## Phase Roadmap

### ✅ Phase 1 — Foundation & Auth (Current)
- Monorepo setup (frontend + backend)
- JWT authentication (register / login)
- USA & Europe market selection
- Load search with filters (market, origin, destination, equipment type)
- Load picking functionality
- Dashboard with stats
- AI Predictions placeholder UI
- Responsive sidebar layout
- PostgreSQL schema via Prisma ORM
- Docker Compose for local services

### 🔜 Phase 2 — DAT Integration
- Real DAT load board API integration
- Live load data from DAT One
- Automated load sync and polling
- Advanced search with more filters
- Load detail pages with broker contacts
- Email/SMS notifications for matching loads

### 🔮 Phase 3 — ML Predictions
- AI-powered freight rate prediction engine
- Lane-specific 7-day rate forecasting
- Demand heatmap (USA & Europe)
- Fuel cost estimator with live pricing
- Market intelligence and benchmarking
- Revenue optimization recommendations

---

## Docker (Full Stack)

To run the entire platform with Docker:

```bash
# Copy backend env
cp backend/.env.example backend/.env

# Start everything
docker-compose up --build
```

Services:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

---

© 2026 TruckBiz. Built for carriers worldwide.
