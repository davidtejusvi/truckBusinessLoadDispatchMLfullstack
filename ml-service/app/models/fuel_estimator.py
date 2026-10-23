"""Fuel price simulation and fuel cost estimation.

Fuel prices are simulated deterministically per calendar day (seeded by the
date ordinal) so that trends are stable across requests within a day.
"""
from __future__ import annotations

import random
from datetime import date, timedelta
from typing import Dict, List


class FuelEstimator:
    """Simulated diesel pricing and per-trip fuel cost estimation."""

    # Base fuel prices: USA $/gallon, EUROPE EUR/liter.
    BASE_PRICES: Dict[str, float] = {"USA": 3.85, "EUROPE": 1.65}

    def _fluctuation(self, day: date) -> float:
        """Deterministic +/-5% fluctuation seeded by the date's ordinal."""
        return random.Random(day.toordinal()).uniform(-0.05, 0.05)

    def _market_config(self, market: str):
        """Return (base_price, currency_symbol, unit) for a market."""
        base = self.BASE_PRICES[market]
        if market == "USA":
            return base, "$", "gallon"
        return base, "EUR", "liter"

    def get_fuel_price(self, market: str) -> Dict[str, object]:
        """Today's simulated fuel price for the given market."""
        today = date.today()
        base, currency, unit = self._market_config(market)
        price = round(base * (1 + self._fluctuation(today)), 3)
        return {"price": price, "currency": currency, "unit": unit}

    def estimate_fuel_cost(self, market: str, distance: float) -> Dict[str, object]:
        """Estimate the total fuel cost for a trip of the given distance."""
        base, currency, unit = self._market_config(market)
        today = date.today()
        price = base * (1 + self._fluctuation(today))
        if market == "USA":
            # 6.5 miles per gallon.
            fuel_cost = round((distance / 6.5) * price, 2)
            fuel_efficiency = "6.5 mpg"
        else:
            # 28 liters per 100 km.
            fuel_cost = round((distance / 100 * 28) * price, 2)
            fuel_efficiency = "28 L/100km"
        return {
            "fuel_cost": fuel_cost,
            "fuel_price": round(price, 3),
            "currency": currency,
            "unit": unit,
            "fuel_efficiency": fuel_efficiency,
        }

    def get_fuel_trend(self, market: str, days: int = 7) -> List[Dict[str, object]]:
        """Daily fuel prices for the last ``days`` days (date-seeded)."""
        base, _, _ = self._market_config(market)
        today = date.today()
        trend: List[Dict[str, object]] = []
        for i in range(days - 1, -1, -1):
            day = today - timedelta(days=i)
            price = round(base * (1 + self._fluctuation(day)), 3)
            trend.append({"date": day.isoformat(), "price": price})
        return trend


# Module-level singleton used by the routes.
fuel_estimator = FuelEstimator()
