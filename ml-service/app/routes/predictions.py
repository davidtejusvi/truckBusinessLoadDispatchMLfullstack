"""Prediction API routes for the TruckBiz ML service.

Exposes rate prediction, fuel pricing/cost, and demand heatmap/forecast
endpoints. Delegates to the module-level singletons in ``app.models.*``.
"""
from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

from app.models.demand_forecaster import demand_forecaster
from app.models.fuel_estimator import fuel_estimator
from app.models.rate_predictor import rate_predictor

router = APIRouter()


class RateRequest(BaseModel):
    market: str
    equipment_type: str
    distance: float
    day_of_week: int
    fuel_price: float


class FuelCostRequest(BaseModel):
    market: str
    distance: float


class ForecastRequest(BaseModel):
    origin: str
    destination: str
    market: str
    days: int = 7


@router.post("/predict/rate")
def predict_rate(request: RateRequest):
    """Predict the total freight rate and confidence band for a lane."""
    result = rate_predictor.predict(
        market=request.market,
        equipment_type=request.equipment_type,
        distance=request.distance,
        day_of_week=request.day_of_week,
        fuel_price=request.fuel_price,
    )
    currency = "$" if request.market == "USA" else "EUR"
    return {
        "predicted_rate": result["predicted_rate"],
        "confidence_low": result["confidence_low"],
        "confidence_high": result["confidence_high"],
        "currency": currency,
    }


@router.get("/fuel/price/{market}")
def fuel_price(market: str):
    """Current fuel price plus a 7-day price trend for the market."""
    price_info = fuel_estimator.get_fuel_price(market)
    trend = fuel_estimator.get_fuel_trend(market, days=7)
    return {
        "price": price_info["price"],
        "currency": price_info["currency"],
        "unit": price_info["unit"],
        "trend": trend,
    }


@router.post("/fuel/cost")
def fuel_cost(request: FuelCostRequest):
    """Estimate the total fuel cost for a trip."""
    return fuel_estimator.estimate_fuel_cost(
        market=request.market, distance=request.distance
    )


@router.get("/demand/heatmap/{market}")
def demand_heatmap(market: str):
    """Top-15 lane demand heatmap for the market."""
    return demand_forecaster.get_demand_heatmap(market)


@router.post("/demand/forecast")
def demand_forecast(request: ForecastRequest):
    """7-day per-day demand forecast for a single lane."""
    return demand_forecaster.get_lane_forecast(
        origin=request.origin,
        destination=request.destination,
        market=request.market,
        days=request.days,
    )
