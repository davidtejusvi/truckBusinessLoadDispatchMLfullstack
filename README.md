# TruckBiz — Freight Management Platform

![Node](https://img.shields.io/badge/Node.js-20-green?logo=node.js) ![React](https://img.shields.io/badge/React-18-blue?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql) ![Redis](https://img.shields.io/badge/Redis-7-red?logo=redis) ![Tailwind](https://img.shields.io/badge/TailwindCSS-3-teal?logo=tailwindcss) ![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)

TruckBiz is a full-stack freight management platform for carriers, brokers, and dispatchers operating in the **USA** and **Europe** markets. It lets users browse and pick available freight loads, view AI-powered rate predictions, and manage their operations from a single dashboard.

<img width="1774" height="904" alt="Screenshot 2026-10-24 at 1 06 24 AM" src="https://github.com/user-attachments/assets/def38834-6736-49a3-8eb7-8e9c18f347f7" />
<img width="555" height="841" alt="Screenshot 2026-10-24 at 1 06 39 AM" src="https://github.com/user-attachments/assets/22c4596c-b376-44a4-8e39-cc853e07d599" />
<img width="1754" height="925" alt="Screenshot 2026-10-24 at 1 06 47 AM" src="https://github.com/user-attachments/assets/29c8169a-e691-4de1-a714-cd18f1e8ba8b" />
<img width="1768" height="998" alt="Screenshot 2026-10-24 at 1 11 18 AM" src="https://github.com/user-attachments/assets/5811ae55-f814-42d1-b1d8-d533e66f1f3a" />
<img width="1780" height="944" alt="Screenshot 2026-10-24 at 1 11 07 AM" src="https://github.com/user-attachments/assets/8ba23663-a6d2-4e38-a057-15fce1b79524" />
<img width="1779" height="943" alt="Screenshot 2026-10-24 at 1 10 54 AM" src="https://github.com/user-attachments/assets/96ed1dab-dd1c-4209-a3c7-a79d9cd346e8" />




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

## Infrastructure & CI/CD

### CI/CD Pipeline Overview

```
┌─────────┐    ┌──────────┐    ┌─────────┐    ┌───────────┐    ┌──────────────┐
│  Push    │──▶ │ Gitleaks  │──▶ │ Lint    │──▶ │  Trivy    │──▶ │  SonarCloud  │
│  / PR    │    │ Secret    │    │ & Test  │    │  Vuln Scan│    │  Code Quality│
└─────────┘    └──────────┘    └─────────┘    └───────────┘    └──────────────┘
                                                                      │
┌──────────────┐    ┌───────────┐    ┌──────────┐    ┌──────────────┐  │
│  ArgoCD Sync │◀── │ Git Push  │◀── │  yq      │◀── │ Build & Push │◀─┘
│  (auto-dev)  │    │ Helm vals │    │  Patch   │    │  to ECR      │
└──────────────┘    └───────────┘    └──────────┘    └──────────────┘
       │
       ▼
  ┌─────────┐
  │  EKS     │  Backend (2-6 pods, HPA)  +  Frontend (2-3 pods)
  │  Cluster │  Ingress (nginx + TLS)   +  NetworkPolicy (deny-all)
  └─────────┘
```

| Workflow | Trigger | Purpose |
|---|---|---|
| `ci.yml` | Push / PR to main | Gitleaks → lint → test → Trivy → SonarCloud |
| `cd.yml` | `workflow_dispatch` (dev/prod) | OIDC AWS login → build → ECR push → Helm update → Slack |
| `security-scan.yml` | Cron (Mon 9am UTC) + manual | Trivy image scan + Gitleaks full history |

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `AWS_DEPLOY_ROLE_ARN` | IAM role ARN for OIDC (no long-lived keys) |
| `ECR_BACKEND_REPO` | ECR repository name for backend image |
| `ECR_FRONTEND_REPO` | ECR repository name for frontend image |
| `SONAR_TOKEN` | SonarCloud analysis token |
| `SONAR_ORGANIZATION` | SonarCloud organization key |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook for deploy notifications |
| `GITLEAKS_LICENSE` | Gitleaks Action license key (for private repos) |

### Deploy via GitHub Actions

```bash
# Trigger CD pipeline for dev
gh workflow run cd.yml -f environment=dev -f image_tag=v1.0.0

# Trigger CD pipeline for prod
gh workflow run cd.yml -f environment=prod -f image_tag=v1.0.0
```

### Terraform

Provisions ECR, VPC (2 AZs), EKS 1.29, and RDS PostgreSQL on AWS.

```bash
# Dev environment
cd terraform/environments/dev
terraform init
terraform plan
terraform apply

# Prod environment
cd terraform/environments/prod
terraform init
terraform plan
terraform apply
```

### Helm Chart

```bash
# Install to dev
helm install truckbiz ./helm/truckbiz \
  -f ./helm/truckbiz/values.yaml \
  -f ./helm/truckbiz/values-dev.yaml \
  -n truckbiz-dev --create-namespace

# Install to prod
helm install truckbiz ./helm/truckbiz \
  -f ./helm/truckbiz/values.yaml \
  -f ./helm/truckbiz/values-prod.yaml \
  -n truckbiz-prod --create-namespace
```

### ArgoCD Setup

```bash
# Apply ArgoCD project + applications
kubectl apply -f argocd/project.yaml
kubectl apply -f argocd/application-dev.yaml
kubectl apply -f argocd/application-prod.yaml
```

Dev syncs automatically (prune + self-heal). Prod requires manual sync via ArgoCD UI or `argocd app sync truckbiz-prod`.

---

## Phase Roadmap

### ✅ Phase 1 — Foundation & Auth
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

### ✅ Phase 2 — Load Board
- 45 mock loads (25 USA + 20 Europe) with realistic lane data
- Full search with 8 filter params (origin, dest, equipment, rate, distance, date)
- Load detail page with rate breakdown + fuel estimate
- Active loads page with revenue tracking
- Pick load flow (claim → 409 on already-picked)
- Load stats endpoint (by market, by equipment, averages)

### 🔮 Phase 3 — ML Predictions
- AI-powered freight rate prediction engine
- Lane-specific 7-day rate forecasting
- Demand heatmap (USA & Europe)
- Fuel cost estimator with live pricing
- Market intelligence and benchmarking
- Revenue optimization recommendations

### ✅ Infrastructure & CI/CD
- Terraform (ECR, VPC, EKS, RDS) — dev + prod
- GitHub Actions (CI, CD, security scanning)
- Gitleaks secret scanning
- Trivy vulnerability scanning
- SonarCloud code quality
- Multi-stage Dockerfiles (non-root)
- Helm chart (deployments, HPA, ingress, network policies)
- ArgoCD GitOps (auto-sync dev, manual prod)

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
