"""TruckBiz ML prediction microservice (FastAPI).

Entrypoint that wires CORS, the health-check route, the predictions router,
and a lifespan handler that trains or loads the rate model on startup.
"""
from __future__ import annotations

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models.rate_predictor import rate_predictor
from app.routes import predictions


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Train or load the rate model on startup, then persist it."""
    if os.path.exists(rate_predictor.MODEL_PATH):
        rate_predictor.load(rate_predictor.MODEL_PATH)
    else:
        rate_predictor.train()
        rate_predictor.save(rate_predictor.MODEL_PATH)
    yield


app = FastAPI(
    title="TruckBiz ML Service",
    description="Rate prediction, fuel estimation, and demand forecasting.",
    version="1.0.0",
    lifespan=lifespan,
)

# Permissive CORS for local dev; tighten for production deployments.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    """Service health check."""
    return {"service": "truckbiz-ml", "status": "ok"}


app.include_router(predictions.router)
