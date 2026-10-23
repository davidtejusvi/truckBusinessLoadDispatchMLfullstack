"""Lane demand heatmap and per-lane demand forecasting.

Demand scores are deterministic, derived from a stable hash of the lane name so
that the heatmap and forecasts are reproducible across requests.
"""
from __future__ import annotations

import hashlib
from datetime import date, timedelta
from typing import Dict, List


class DemandForecaster:
    """Deterministic lane demand scores and 7-day lane forecasts."""

    # 15 city pairs per market, reused from the mock-load lanes for realism.
    LANES: Dict[str, List[Dict[str, str]]] = {
        "USA": [
            {"origin": "Chicago", "destination": "Atlanta"},
            {"origin": "Dallas", "destination": "Los Angeles"},
            {"origin": "New York", "destination": "Miami"},
            {"origin": "Seattle", "destination": "Phoenix"},
            {"origin": "Denver", "destination": "Houston"},
            {"origin": "Chicago", "destination": "Dallas"},
            {"origin": "Los Angeles", "destination": "Seattle"},
            {"origin": "Miami", "destination": "Chicago"},
            {"origin": "Phoenix", "destination": "Denver"},
            {"origin": "Houston", "destination": "Nashville"},
            {"origin": "Atlanta", "destination": "New York"},
            {"origin": "Boston", "destination": "Philadelphia"},
            {"origin": "Kansas City", "destination": "Memphis"},
            {"origin": "Minneapolis", "destination": "Detroit"},
            {"origin": "Charlotte", "destination": "Nashville"},
        ],
        "EUROPE": [
            {"origin": "Amsterdam", "destination": "Paris"},
            {"origin": "Hamburg", "destination": "Warsaw"},
            {"origin": "Madrid", "destination": "Lisbon"},
            {"origin": "Milan", "destination": "Vienna"},
            {"origin": "Rotterdam", "destination": "Frankfurt"},
            {"origin": "Paris", "destination": "Berlin"},
            {"origin": "Brussels", "destination": "Amsterdam"},
            {"origin": "Warsaw", "destination": "Prague"},
            {"origin": "Lisbon", "destination": "Madrid"},
            {"origin": "Vienna", "destination": "Budapest"},
            {"origin": "Frankfurt", "destination": "Munich"},
            {"origin": "Munich", "destination": "Zurich"},
            {"origin": "Zurich", "destination": "Lyon"},
            {"origin": "Lyon", "destination": "Barcelona"},
            {"origin": "Barcelona", "destination": "Madrid"},
        ],
    }

    def _demand_score(self, lane: str) -> int:
        """Deterministic 0-100 demand score derived from a lane hash."""
        digest = hashlib.sha256(lane.encode("utf-8")).hexdigest()
        return int(digest[:8], 16) % 101  # 0..100 inclusive

    def _rate_base(self, market: str) -> float:
        return 1.80 if market == "USA" else 1.50

    def get_demand_heatmap(self, market: str) -> List[Dict[str, object]]:
        """Top-15 lane demand objects for the given market."""
        lanes = self.LANES[market]
        rate_base = self._rate_base(market)
        heatmap: List[Dict[str, object]] = []
        for lane in lanes:
            lane_name = f"{lane['origin']} -> {lane['destination']}"
            score = self._demand_score(lane_name)
            load_count = int(score * 0.8) + 20
            avg_rate = round(rate_base * (1 + score / 200.0), 2)
            heatmap.append(
                {
                    "lane": lane_name,
                    "origin": lane["origin"],
                    "destination": lane["destination"],
                    "demand_score": score,
                    "load_count": load_count,
                    "avg_rate": avg_rate,
                }
            )
        # Highest demand first; keep the top 15.
        heatmap.sort(key=lambda item: item["demand_score"], reverse=True)
        return heatmap[:15]

    def get_lane_forecast(
        self,
        origin: str,
        destination: str,
        market: str,
        days: int = 7,
    ) -> List[Dict[str, object]]:
        """Per-day demand forecast for a single lane with a mild deterministic trend."""
        lane_name = f"{origin} -> {destination}"
        base_score = self._demand_score(lane_name)
        rate_base = self._rate_base(market)
        today = date.today()
        forecast: List[Dict[str, object]] = []
        for i in range(days):
            day = today + timedelta(days=i)
            # Mild upward trend across the horizon.
            trend_factor = 1.0 + 0.03 * (i + 1 - days / 2)
            predicted_loads = max(1, int(base_score * 0.6 * trend_factor))
            predicted_avg_rate = round(
                rate_base * (1 + base_score / 200.0) * trend_factor, 2
            )
            # Confidence decreases slightly further into the future.
            confidence = round(0.75 + 0.02 * (days - i) / days, 2)
            forecast.append(
                {
                    "date": day.isoformat(),
                    "predicted_loads": predicted_loads,
                    "predicted_avg_rate": predicted_avg_rate,
                    "confidence": confidence,
                }
            )
        return forecast


# Module-level singleton used by the routes.
demand_forecaster = DemandForecaster()
