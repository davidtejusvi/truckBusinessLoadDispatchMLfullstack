"""Freight rate prediction model.

Trains a ``GradientBoostingRegressor`` on synthetic USA/Europe lane data and
predicts the total freight rate for a lane given the market, equipment type,
distance, day of week, and fuel price. The trained predictor persists itself
to ``ml-service/data/rate_model.joblib`` via joblib.
"""
from __future__ import annotations

import os
import random
from typing import Dict

import joblib
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor


class RatePredictor:
    """Predict total freight rates with a gradient-boosting regressor."""

    # Path the trained model is cached at (relative to the service CWD).
    MODEL_PATH = "ml-service/data/rate_model.joblib"

    # Per-market equipment-type rate multipliers.
    EQUIPMENT_MULTIPLIERS: Dict[str, Dict[str, float]] = {
        "USA": {
            "Flatbed": 1.0,
            "Dry Van": 0.95,
            "Reefer": 1.15,
            "Step Deck": 1.1,
            "Lowboy": 1.25,
        },
        "EUROPE": {
            "Tautliner": 1.0,
            "Mega": 0.95,
            "Frigo": 1.2,
            "Flatbed": 1.05,
            "Coil": 1.1,
        },
    }

    # Market -> integer code used as a model feature.
    MARKET_MAP: Dict[str, int] = {"USA": 0, "EUROPE": 1}

    # Per-market equipment-type -> integer code (kept in the same order as the
    # multiplier dicts above). Defined explicitly so it is available as a class
    # attribute without a class-body comprehension scoping issue.
    EQUIPMENT_CODES: Dict[str, Dict[str, int]] = {
        "USA": {"Flatbed": 0, "Dry Van": 1, "Reefer": 2, "Step Deck": 3, "Lowboy": 4},
        "EUROPE": {"Tautliner": 0, "Mega": 1, "Frigo": 2, "Flatbed": 3, "Coil": 4},
    }

    def __init__(self) -> None:
        self.model: GradientBoostingRegressor | None = None
        self._trained = False

    def _equipment_code(self, market: str, equipment_type: str) -> int:
        return self.EQUIPMENT_CODES[market][equipment_type]

    def _generate_samples(self, n_samples: int = 2000):
        """Build ~``n_samples`` synthetic (features, target) rows."""
        rng = random.Random(42)
        x_rows: list[list[float]] = []
        y_rows: list[float] = []
        markets = list(self.MARKET_MAP.keys())
        for _ in range(n_samples):
            market = rng.choice(markets)
            equipment = rng.choice(list(self.EQUIPMENT_MULTIPLIERS[market].keys()))
            equipment_mult = self.EQUIPMENT_MULTIPLIERS[market][equipment]
            distance = rng.uniform(50, 2000)
            day_of_week = rng.randint(0, 6)
            if market == "USA":
                # $/gal around 3.85 with light noise.
                fuel_price = 3.85 + rng.uniform(-0.25, 0.25)
                base = 1.80 * equipment_mult * distance * (1 - 0.00002 * distance)
            else:
                # EUR/L around 1.65 with light noise.
                fuel_price = 1.65 + rng.uniform(-0.15, 0.15)
                base = 1.50 * equipment_mult * distance * (1 - 0.00002 * distance)
            rate = base * (1 + rng.uniform(-0.15, 0.15))
            x_rows.append(
                [
                    float(distance),
                    float(self._equipment_code(market, equipment)),
                    float(self.MARKET_MAP[market]),
                    float(day_of_week),
                    float(fuel_price),
                ]
            )
            y_rows.append(float(rate))
        return np.array(x_rows, dtype=float), np.array(y_rows, dtype=float)

    def train(self) -> None:
        """Generate synthetic data and fit the gradient-boosting model."""
        x, y = self._generate_samples(2000)
        self.model = GradientBoostingRegressor(random_state=42)
        self.model.fit(x, y)
        self._trained = True

    def predict(
        self,
        market: str,
        equipment_type: str,
        distance: float,
        day_of_week: int,
        fuel_price: float,
    ) -> Dict[str, float]:
        """Predict the total freight rate and an +/-8% confidence band."""
        if self.model is None:
            self.train()
        features = np.array(
            [
                [
                    float(distance),
                    float(self._equipment_code(market, equipment_type)),
                    float(self.MARKET_MAP[market]),
                    float(day_of_week),
                    float(fuel_price),
                ]
            ]
        )
        rate = float(self.model.predict(features)[0])
        return {
            "predicted_rate": round(rate, 2),
            "confidence_low": round(rate * 0.92, 2),
            "confidence_high": round(rate * 1.08, 2),
        }

    def save(self, path: str = MODEL_PATH) -> None:
        """Persist this predictor instance to disk via joblib."""
        os.makedirs(os.path.dirname(path), exist_ok=True)
        joblib.dump(self, path)

    def load(self, path: str = MODEL_PATH) -> None:
        """Restore this predictor's trained model from a joblib file."""
        loaded = joblib.load(path)
        self.model = loaded.model
        self._trained = loaded._trained


# Module-level singleton used by the routes and the app lifespan.
rate_predictor = RatePredictor()
