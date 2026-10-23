# Phase 3 — ML Prediction Engine: Implementation Plan

> Goal: add a Python FastAPI ML microservice, backend proxy routes, a full
> frontend Predictions dashboard (replacing the "Coming Soon" placeholder),
> and wire it through Docker Compose, Helm, Terraform ECR, and the CD pipeline.
> Phase 1 & 2 are complete; never delete or break existing files.

## Key design decisions (no design doc was provided)

1. **Backend HTTP client → native `fetch`.** `backend/package.json` has no axios
   and the backend runs Node 20; `@types/node ^20` (auto-included, tsconfig does
   not restrict `types`) declares the global `fetch`/`Request`/`Response`/
   `Headers`. No new dependency is added. Rationale: avoids a new dep and matches
   the Node 20 runtime.
2. **ML service URL is configurable.** Backend reads
   `process.env.ML_SERVICE_URL || 'http://localhost:8000'`. Rationale: lets
   Docker Compose / Helm override the in-cluster URL while defaulting to local
   dev. Added to `backend/.env.example` and README.
3. **Proxy error handling.** On upstream non-2xx the backend forwards the
   upstream JSON body and status; on network error it returns `502` with
   `{ error }`. Rationale: standard, transparent proxy behavior.
4. **Rate model persistence.** `RatePredictor` trains on first startup only if
   `ml-service/data/rate_model.joblib` is absent, then loads it on later boots.
   Rationale: avoids retraining ~2000 samples every boot; `data/` is the
   persistence dir.
5. **Encoding.** Equipment → integer codes; market `USA=0, EUROPE=1`. Equipment
   lists exactly match the mock-load equipment types (USA: Flatbed, Dry Van,
   Reefer, Step Deck, Lowboy; Europe: Tautliner, Mega, Frigo, Flatbed, Coil).
6. **Confidence interval.** `±8%` band around the predicted rate
   (`low = rate*0.92`, `high = rate*1.08`). Rationale: simple, deterministic,
   deterministic enough to chart.
7. **`day_of_week`** is an integer `0–6` (Mon–Sun); the frontend dropdown maps
   weekday names to these ints.
8. **Frontend store** uses a plain `create<PredictionsState>()((set) => ...)`
   (no middleware, no persistence) matching the `loadsStore` action shape.
9. **"Average market rate" bar** uses the mean of the demand-heatmap `avg_rate`
   values for the selected market (already fetched for Section 3). Rationale:
   data-driven from the ML service, no extra endpoint, no deviation from the
   route contract (which returns only `predicted_rate` + confidence + currency).
10. **recharts** added at `^2.15.0` (current 2.x, React 18 compatible).
11. **Helm** adds a `truckbiz.mlServiceFullname` helper and `ml-service`
    templates mirroring the backend; values add an `mlService` section; dev
    override `replicaCount: 1`, prod `replicaCount: 2`.
12. **Terraform ECR** adds a third explicit `aws_ecr_repository.ml_service`
    (`${var.app_name}-ml-service`) + lifecycle policy + output, matching the
    existing explicit-resource pattern (simpler than parameterizing, no churn
    in other modules).
13. **cd.yml** adds a "Build & push ml-service image" step (new secret
    `ECR_ML_SERVICE_REPO`) and extends the yq Helm-values step to set
    `.mlService.image.repository`/`.tag`.

---

## A. Python FastAPI ML microservice  (feature FEAT-001)

### A.0  Scaffolding
- [ ] 1. Create `ml-service/requirements.txt` with exactly: `fastapi`,
      `uvicorn[standard]`, `scikit-learn`, `pandas`, `numpy`, `joblib`,
      `httpx`, `pydantic`.
      Files: `ml-service/requirements.txt`
      Verify: `pip3 install -r ml-service/requirements.txt --dry-run` exits 0
      (resolves all packages).
- [ ] 2. Create `ml-service/app/__init__.py` (empty) and
      `ml-service/app/models/__init__.py` (empty) and
      `ml-service/app/routes/__init__.py` (empty). Create
      `ml-service/data/.gitkeep` (empty) so the persistence dir exists in git.
      Files: `ml-service/app/__init__.py`, `ml-service/app/models/__init__.py`,
      `ml-service/app/routes/__init__.py`, `ml-service/data/.gitkeep`
      Verify: `python3 -m py_compile ml-service/app/__init__.py
      ml-service/app/models/__init__.py ml-service/app/routes/__init__.py` (no
      output = ok).

### A.1  Models
- [ ] 3. Create `ml-service/app/models/rate_predictor.py` — class
      `RatePredictor` with a `GradientBoostingRegressor`. Attributes:
      `EQUIPMENT_MULTIPLIERS` (USA `{Flatbed:1.0, Dry Van:0.95, Reefer:1.15,
      Step Deck:1.1, Lowboy:1.25}`, EUROPE `{Tautliner:1.0, Mega:0.95, Frigo:1.2,
      Flatbed:1.05, Coil:1.1}`), `MARKET_MAP = {USA:0, EUROPE:1}`,
      equipment→int code maps per market. Methods:
      - `train()` — generate ~2000 synthetic samples:
        USA: `rate = 1.80 * equipment_mult * distance * (1 - 0.00002*distance)
        * (1 + uniform(-0.15,0.15))` ($ total); distance `50–2000` miles,
        fuel_price ~3.85 with noise. EUROPE: `rate = 1.50 * equipment_mult *
        distance * (1 - 0.00002*distance) * (1 + uniform(-0.15,0.15))` (EUR
        total); distance `50–2000` km, fuel_price ~1.65 with noise. day_of_week
        `0–6`. Fit `GradientBoostingRegressor` on features
        `[distance, equipment_encoded, market_encoded, day_of_week,
        fuel_price]` → target `rate`.
      - `predict(market, equipment_type, distance, day_of_week, fuel_price)` →
        `{"predicted_rate": float, "confidence_low": rate*0.92,
        "confidence_high": rate*1.08}`.
      - `save(path)`, `load(path)` via `joblib.dump(self, path)` /
        `joblib.load(path)`. Model path constant
        `MODEL_PATH = "ml-service/data/rate_model.joblib"`.
      Files: `ml-service/app/models/rate_predictor.py`
      Verify: `python3 -m py_compile
      ml-service/app/models/rate_predictor.py` exits 0.
- [ ] 4. Create `ml-service/app/models/fuel_estimator.py` — class
      `FuelEstimator`. `BASE_PRICES = {USA: 3.85, EUROPE: 1.65}` ($/gal,
      EUR/L). Methods:
      - `_fluctuation(date)` — deterministic ±5% via
        `random.Random(date.toordinal()).uniform(-0.05, 0.05)`.
      - `get_fuel_price(market)` → `{"price": float, "currency": "$"|"EUR",
        "unit": "gallon"|"liter"}` for today.
      - `estimate_fuel_cost(market, distance)` → USA `(distance/6.5)*price`,
        EUROPE `(distance/100*28)*price`; returns `{"fuel_cost", "fuel_price",
        "currency", "unit", "fuel_efficiency": "6.5 mpg"|"28 L/100km"}`.
      - `get_fuel_trend(market, days=7)` → list of `{"date", "price"}` for the
        last `days` days using the date-seeded fluctuation.
      Files: `ml-service/app/models/fuel_estimator.py`
      Verify: `python3 -m py_compile
      ml-service/app/models/fuel_estimator.py` exits 0.
- [ ] 5. Create `ml-service/app/models/demand_forecaster.py` — class
      `DemandForecaster` with `LANES` dict (15 city pairs per market reused from
      the mock-load lanes for realism, e.g. USA: Chicago→Atlanta,
      Dallas→Los Angeles, …; EUROPE: Amsterdam→Paris, Hamburg→Warsaw, …).
      Methods:
      - `get_demand_heatmap(market)` → top-15 list of `{"lane", "origin",
        "destination", "demand_score": 0-100 (deterministic from lane hash),
        "load_count": int, "avg_rate": float}`.
      - `get_lane_forecast(origin, destination, market, days=7)` → list of
        `{"date", "predicted_loads", "predicted_avg_rate", "confidence"}` per
        day with a mild upward/downward deterministic trend.
      Files: `ml-service/app/models/demand_forecaster.py`
      Verify: `python3 -m py_compile
      ml-service/app/models/demand_forecaster.py` exits 0.

### A.2  Routes + app entry
- [ ] 6. Create `ml-service/app/routes/predictions.py` — `router =
      APIRouter()` with pydantic request models (`RateRequest`,
      `FuelCostRequest`, `ForecastRequest`). Endpoints (exact paths):
      - `POST /predict/rate` → `{"predicted_rate", "confidence_low",
        "confidence_high", "currency"}` (currency derived from market).
      - `GET /fuel/price/{market}` → `{"price", "currency", "unit", "trend":
        [7 daily {date, price}]}`.
      - `POST /fuel/cost` → `{"fuel_cost", "fuel_price", "currency", "unit",
        "fuel_efficiency"}`.
      - `GET /demand/heatmap/{market}` → array of lane demand objects.
      - `POST /demand/forecast` → array of daily forecasts.
      Import the module-level singletons from the model modules.
      Files: `ml-service/app/routes/predictions.py`
      Verify: `python3 -m py_compile
      ml-service/app/routes/predictions.py` exits 0.
- [ ] 7. Create `ml-service/app/main.py` — `FastAPI()` app; `CORSMiddleware`
      (allow all origins for dev); `GET /` →
      `{"service": "truckbiz-ml", "status": "ok"}`; `include_router(
      predictions.router)`. Use a `lifespan` handler: on startup, if
      `rate_model.joblib` exists `RatePredictor.load(MODEL_PATH)` else
      `train()` + `save(MODEL_PATH)`.
      Files: `ml-service/app/main.py`
      Verify: `python3 -m py_compile ml-service/app/main.py` exits 0.

### A.3  Docker / env
- [ ] 8. Create `ml-service/Dockerfile` — multi-stage: builder
      `python:3.12-slim` creates `/opt/venv` and `pip install -r
      requirements.txt`; runner `python:3.12-slim` copies `/opt/venv` + `app/`,
      creates non-root user (uid 1001), `ENV PATH="/opt/venv/bin:$PATH"`,
      `EXPOSE 8000`, `CMD ["uvicorn","main:app","--host","0.0.0.0",
      "--port","8000"]`, `WORKDIR /app`.
      Files: `ml-service/Dockerfile`
      Verify: (build is heavy; verify syntax by `docker build` is optional.)
- [ ] 9. Create `ml-service/.env.example` with `ML_SERVICE_PORT=8000` and
      `BACKEND_URL=http://localhost:3001`.
      Files: `ml-service/.env.example`
      Verify: file exists with both lines.

### A.4  Feature verification (FEAT-001)
- [ ] 10. Run full FEAT-001 checks:
       `python3 -m py_compile ml-service/app/main.py
       ml-service/app/models/rate_predictor.py
       ml-service/app/models/fuel_estimator.py
       ml-service/app/models/demand_forecaster.py
       ml-service/app/routes/predictions.py` → 0 errors; and
       `pip3 install -r ml-service/requirements.txt --dry-run` → resolves OK.

---

## B. Backend prediction proxy routes  (feature FEAT-002)

- [ ] 11. Create `backend/src/routes/predictions.ts` — `Router()` with all
      routes behind `authenticate`. Constant
      `const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';`.
      Use the global `fetch` (Node 20). Routes (exact):
      - `GET /rate` — read query `market, equipmentType, distance, dayOfWeek,
        fuelPrice`; POST JSON `{market, equipment_type: equipmentType,
        distance: Number, day_of_week: Number, fuel_price: Number}` to
        `${ML_SERVICE_URL}/predict/rate`; return upstream JSON.
      - `GET /fuel/:market` — proxy GET `${ML_SERVICE_URL}/fuel/price/:market`.
      - `GET /fuel-cost` — read query `market, distance`; POST JSON
        `{market, distance: Number}` to `${ML_SERVICE_URL}/fuel/cost`; return
        upstream JSON.
      - `GET /demand/:market` — proxy GET `${ML_SERVICE_URL}/demand/heatmap/:market`.
      - `POST /demand/forecast` — forward `req.body` to
        `${ML_SERVICE_URL}/demand/forecast`; return upstream JSON.
      Error handling: upstream non-2xx → `res.status(upstream.status).json(
      upstream body)`; fetch throws → `res.status(502).json({error})`.
      Files: `backend/src/routes/predictions.ts`
      Verify: `cd backend && npx tsc --noEmit` → 0 errors.
- [ ] 12. Modify `backend/src/index.ts` — add `import predictionsRoutes from
      './routes/predictions';` and mount `app.use('/api/predictions',
      predictionsRoutes);` alongside the existing mounts.
      Files: `backend/src/index.ts`
      Verify: `cd backend && npx tsc --noEmit` → 0 errors; and
      `grep -n "api/predictions" backend/src/index.ts` shows the mount line.
- [ ] 13. Modify `backend/.env.example` — append `ML_SERVICE_URL=http://localhost:8000`.
      Files: `backend/.env.example`
      Verify: line present.
- [ ] 14. (No axios needed — skip; `backend/package.json` is unchanged.)
      Files: —
      Verify: `cd backend && npx tsc --noEmit` → 0 errors.

---

## C. Frontend predictions UI  (feature FEAT-003)

- [ ] 15. Modify `frontend/package.json` — add `"recharts": "^2.15.0"` to
      `dependencies` (sorted alphabetically after `react-router-dom`). Do NOT
      bump other versions.
      Files: `frontend/package.json`
      Verify: `cd frontend && npm install` exits 0 and installs recharts;
      `node -e "console.log(require('./node_modules/recharts/package.json').version)"` prints a 2.x version.
- [ ] 16. Create `frontend/src/api/predictions.ts` using `apiClient` from
      `./client`. Typed exports (mirror `loadsApi` shape):
      - `getRatePrediction(params: {market, equipmentType, distance, dayOfWeek,
        fuelPrice})` → `apiClient.get('/predictions/rate', {params})`.
      - `getFuelPrice(market)` → `apiClient.get(\`/predictions/fuel/${market}\`)`.
      - `getFuelCost(market, distance)` → `apiClient.get('/predictions/fuel-cost',
        {params:{market, distance}})`.
      - `getDemandHeatmap(market)` → `apiClient.get(\`/predictions/demand/${market}\`)`.
      - `getDemandForecast(body: {origin, destination, market, days})` →
        `apiClient.post('/predictions/demand/forecast', body)`.
      Define response TS interfaces for each.
      Files: `frontend/src/api/predictions.ts`
      Verify: `cd frontend && npx tsc --noEmit` → 0 errors.
- [ ] 17. Create `frontend/src/store/predictionsStore.ts` (Zustand, plain
      `create`). State: `ratePrediction`, `fuelPrice`, `fuelCost`,
      `demandHeatmap` (array), `demandForecast` (array), `loading`, `error`.
      Actions: `fetchRatePrediction(params)`, `fetchFuelPrice(market)`,
      `fetchFuelCost(market, distance)`, `fetchDemandHeatmap(market)`,
      `fetchDemandForecast(body)`, `clear()`. Follow the `loadsStore`
      try/catch → `set({error})` pattern.
      Files: `frontend/src/store/predictionsStore.ts`
      Verify: `cd frontend && npx tsc --noEmit` → 0 errors.
- [ ] 18. Rewrite `frontend/src/pages/PredictionsPage.tsx` — remove all
      "Coming Soon" placeholder content. Full dashboard, `Layout` wrapper,
      responsive grid (reuse existing Tailwind classes `navy-900`, `accent`,
      `rounded-2xl`, `shadow-sm`, etc.). Use `useMarketStore` for the default
      market, `usePredictionsStore` for data, local state for form inputs and
      the selected lane. Recharts via `ResponsiveContainer`.
      - **Section 1 — Rate Prediction Calculator (left, larger, `lg:col-span-2`):**
        market dropdown (USA/EUROPE, pre-filled from `marketStore`), equipment
        dropdown (USA vs Europe lists), distance number input (miles USA / km
        Europe), day-of-week dropdown (Mon–Sun → 0–6), fuel price input
        pre-filled from the fuel price API; "Predict Rate" button →
        `fetchRatePrediction`. Result card: predicted rate (large bold),
        confidence range `low – high`, currency badge (`$`/`EUR`), rate-per-mile
        or per-km secondary stat. Recharts `BarChart` comparing predicted rate
        vs. average market rate (= mean of heatmap `avg_rate` for the market).
      - **Section 2 — Fuel Cost Estimator (top right):** current diesel price
        (big number + currency + per gallon/L), Recharts `LineChart` of the
        7-day trend, fuel cost calculator (distance input → estimated fuel
        cost via `getFuelCost`), show fuel cost, fuel efficiency assumption,
        fuel price used.
      - **Section 3 — Demand Heatmap (bottom, full width):** market toggle
        (USA/EUROPE) that re-fetches the heatmap; grid of top 15 lanes each with
        origin → destination, demand score (0–100) with a colored bar
        (red 80–100, orange 50–79, green 0–49), load count, average rate.
        Clicking a lane → `getDemandForecast` → Recharts `LineChart` of
        `predicted_loads` and `predicted_avg_rate` over 7 days.
      On mount: `fetchFuelPrice(market)` and `fetchDemandHeatmap(market)`; when
      market changes, refetch both.
      Files: `frontend/src/pages/PredictionsPage.tsx`
      Verify: `cd frontend && npx tsc --noEmit` → 0 errors; and
      `grep -c "Coming Soon" frontend/src/pages/PredictionsPage.tsx` → 0.
- [ ] 19. Confirm `frontend/src/App.tsx` already routes `/predictions` to
      `PredictionsPage` (it does). No change required unless the import path
      changed (it did not).
      Files: `frontend/src/App.tsx`
      Verify: `cd frontend && npx tsc --noEmit` → 0 errors; route present.

---

## D, E, F, G, H. Infrastructure & docs  (feature FEAT-004)

### D. Docker Compose
- [ ] 20. Modify `docker-compose.yml` — add an `ml-service` service:
      `build: ./ml-service`, `ports: ["8000:8000"]`,
      `environment: ML_SERVICE_PORT=8000`, `depends_on: [backend]`. Keep all
      existing services and the `pgdata` volume.
      Files: `docker-compose.yml`
      Verify: `docker compose config >/dev/null` exits 0.

### E. Helm
- [ ] 21. Modify `helm/truckbiz/templates/_helpers.tpl` — add a
      `truckbiz.mlServiceFullname` helper mirroring `backendFullname`.
      Files: `helm/truckbiz/templates/_helpers.tpl`
      Verify: `helm lint helm/truckbiz` → 0 failures.
- [ ] 22. Create `helm/truckbiz/templates/ml-service/deployment.yaml` —
      Deployment for the ML service using `.Values.mlService` (image, ports,
      resources, readiness/liveness probe `httpGet path: / port: 8000`,
      `securityContext.runAsNonRoot: true`). Mirror the backend deployment
      template structure.
      Files: `helm/truckbiz/templates/ml-service/deployment.yaml`
      Verify: `helm template truckbiz ./helm/truckbiz -f
      helm/truckbiz/values.yaml -f helm/truckbiz/values-dev.yaml >/dev/null`
      exits 0 and renders a `Deployment` for ml-service.
- [ ] 23. Create `helm/truckbiz/templates/ml-service/service.yaml` — ClusterIP
      `Service` on port 8000 using `.Values.mlService.service`.
      Files: `helm/truckbiz/templates/ml-service/service.yaml`
      Verify: same `helm template` renders a `Service` for ml-service.
- [ ] 24. Modify `helm/truckbiz/values.yaml` — add an `mlService` section:
      `image.{repository, tag: latest, pullPolicy: IfNotPresent}`,
      `replicaCount: 2`, `service.{type: ClusterIP, port: 8000, targetPort:
      8000}`, `resources.{requests:{cpu:100m,memory:256Mi}, limits:{cpu:500m,
      memory:512Mi}}`, `securityContext.runAsNonRoot: true`,
      `readinessProbe`/`livenessProbe` (`httpGet path: / port: 8000`).
      Files: `helm/truckbiz/values.yaml`
      Verify: `helm lint helm/truckbiz` → 0 failures.
- [ ] 25. Modify `helm/truckbiz/values-dev.yaml` — add `mlService` override
      (`replicaCount: 1`, smaller resources). Modify
      `helm/truckbiz/values-prod.yaml` — add `mlService` override
      (`replicaCount: 2`).
      Files: `helm/truckbiz/values-dev.yaml`, `helm/truckbiz/values-prod.yaml`
      Verify: `helm template` with each override file renders 1 / 2 replicas.

### F. Terraform
- [ ] 26. Modify `terraform/modules/ecr/main.tf` — add a third
      `aws_ecr_repository.ml_service` (name `${var.app_name}-ml-service`,
      `MUTABLE`, `scan_on_push = true`) and a matching
      `aws_ecr_lifecycle_policy.ml_service` (keep last 10). Keep existing
      backend/frontend resources.
      Modify `terraform/modules/ecr/outputs.tf` — add
      `output "ecr_ml_service_repo_url"` =
      `aws_ecr_repository.ml_service.repository_url`.
      Files: `terraform/modules/ecr/main.tf`, `terraform/modules/ecr/outputs.tf`
      Verify: `terraform fmt -check terraform/modules/ecr/main.tf
      terraform/modules/ecr/outputs.tf` → no diff; (best-effort)
      `terraform -chdir=terraform/environments/dev init -backend=false` then
      `terraform -chdir=terraform/environments/dev validate` → valid (needs
      network to fetch the AWS provider).

### G. GitHub Actions CD
- [ ] 27. Modify `.github/workflows/cd.yml` — add a "Build & push ml-service
      image" step mirroring the backend/frontend steps, using a new secret
      `ECR_ML_SERVICE_REPO` (`docker build ./ml-service`, push `:$IMAGE_TAG`
      and `:latest`). Extend the "Update Helm values" yq block to also set
      `.mlService.image.repository` and `.mlService.image.tag` in
      `values-${ENV}.yaml`. Add the new secret to README's required-secrets
      table (done in step 29).
      Files: `.github/workflows/cd.yml`
      Verify: (no local linter installed; structural review + the workflow's
      YAML must remain valid) — best-effort: create a temp venv and run
      `python -c "import yaml; yaml.safe_load(open('.github/workflows/cd.yml'))"`
      (see note); primary reliance is on careful editing + the structural
      presence of the ml-service step.

### H. README
- [ ] 28. Modify `README.md`:
      - Tech Stack table: add a row "ML Service | Python 3.12, FastAPI,
        scikit-learn, joblib, Uvicorn".
      - Project Structure block: add `├── ml-service/   # Python FastAPI ML
        prediction microservice`.
      - API Endpoints table: add the prediction routes
        (`GET /api/predictions/rate`, `GET /api/predictions/fuel/:market`,
        `GET /api/predictions/fuel-cost`, `GET /api/predictions/demand/:market`,
        `POST /api/predictions/demand/forecast`, all Auth ✓, backend proxied).
      - Environment Variables: add backend `ML_SERVICE_URL` (default
        `http://localhost:8000`) and ml-service `ML_SERVICE_PORT` /
        `BACKEND_URL`.
      - Docker section: add "ML Service: `http://localhost:8000`" to the
        services list.
      - Required GitHub Secrets table: add `ECR_ML_SERVICE_REPO`.
      - Phase Roadmap: change the "🔮 Phase 3 — ML Predictions" header to
        "✅ Phase 3 — ML Predictions" and rewrite its bullets as delivered:
        GradientBoosting rate predictor (USA/Europe), 7-day lane demand
        forecast, demand heatmap (top 15 lanes), fuel cost estimator with
        simulated live pricing, FastAPI microservice + backend proxy.
      Files: `README.md`
      Verify: README contains "✅ Phase 3 — ML Predictions" and "ml-service".

---

## Final cross-cutting verification (must all pass before done)

Run from the workspace root (quote the path due to the space):

1. `cd backend && npx tsc --noEmit` → **0 errors**
2. `cd frontend && npm install` → **succeeds, installs recharts, no errors**
3. `cd frontend && npx tsc --noEmit` → **0 errors**
4. `pip3 install -r ml-service/requirements.txt --dry-run` → **valid (resolves)**
5. `python3 -m py_compile ml-service/app/main.py
   ml-service/app/models/rate_predictor.py
   ml-service/app/models/fuel_estimator.py
   ml-service/app/models/demand_forecaster.py
   ml-service/app/routes/predictions.py` → **0 errors**
6. `grep -n "api/predictions" backend/src/index.ts` → mount line present
7. `grep -c "Coming Soon" frontend/src/pages/PredictionsPage.tsx` → **0**
8. `docker compose config >/dev/null` → exits 0
9. `helm lint helm/truckbiz` → 0 failures; `helm template truckbiz
   ./helm/truckbiz -f helm/truckbiz/values.yaml -f helm/truckbiz/values-dev.yaml
   >/dev/null` → exits 0 and renders ml-service Deployment+Service
10. `terraform fmt -check terraform/modules/ecr/main.tf
    terraform/modules/ecr/outputs.tf` → no diff

All new prediction routes registered in `backend/src/index.ts`;
`PredictionsPage.tsx` no longer contains "Coming Soon".

---

## Files created (summary)
`ml-service/requirements.txt`, `ml-service/Dockerfile`, `ml-service/.env.example`,
`ml-service/app/__init__.py`, `ml-service/app/main.py`,
`ml-service/app/models/__init__.py`, `ml-service/app/models/rate_predictor.py`,
`ml-service/app/models/fuel_estimator.py`, `ml-service/app/models/demand_forecaster.py`,
`ml-service/app/routes/__init__.py`, `ml-service/app/routes/predictions.py`,
`ml-service/data/.gitkeep`, `backend/src/routes/predictions.ts`,
`frontend/src/api/predictions.ts`, `frontend/src/store/predictionsStore.ts`,
`helm/truckbiz/templates/ml-service/deployment.yaml`,
`helm/truckbiz/templates/ml-service/service.yaml`.

## Files modified (summary)
`backend/src/index.ts`, `backend/.env.example`, `frontend/package.json`,
`frontend/src/pages/PredictionsPage.tsx`, `docker-compose.yml`,
`helm/truckbiz/templates/_helpers.tpl`, `helm/truckbiz/values.yaml`,
`helm/truckbiz/values-dev.yaml`, `helm/truckbiz/values-prod.yaml`,
`terraform/modules/ecr/main.tf`, `terraform/modules/ecr/outputs.tf`,
`.github/workflows/cd.yml`, `README.md`.
