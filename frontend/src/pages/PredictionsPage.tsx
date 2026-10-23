import { useState, useEffect, FormEvent } from 'react';
import Layout from '../components/Layout';
import { useMarketStore } from '../store/marketStore';
import { usePredictionsStore } from '../store/predictionsStore';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { TrendingUp, Fuel, MapPin, Calculator } from 'lucide-react';
import type { DemandLane, Market } from '../api/predictions';

// Equipment options are market-specific and must match the mock-load types.
const EQUIPMENT_BY_MARKET: Record<Market, string[]> = {
  USA: ['Flatbed', 'Dry Van', 'Reefer', 'Step Deck', 'Lowboy'],
  EUROPE: ['Tautliner', 'Mega', 'Frigo', 'Flatbed', 'Coil'],
};

// day_of_week is an integer 0-6 (Mon-Sun), matching the ML service contract.
const DAYS_OF_WEEK = [
  { label: 'Monday', value: 0 },
  { label: 'Tuesday', value: 1 },
  { label: 'Wednesday', value: 2 },
  { label: 'Thursday', value: 3 },
  { label: 'Friday', value: 4 },
  { label: 'Saturday', value: 5 },
  { label: 'Sunday', value: 6 },
];

const currencyFor = (market: Market) => (market === 'USA' ? '$' : 'EUR');
const distanceUnitFor = (market: Market) => (market === 'USA' ? 'miles' : 'km');

const money = (value: number, currency: string) =>
  currency === '$'
    ? `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    : `${currency} ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

// Demand score colour band: red 80-100, orange 50-79, green 0-49.
const demandColor = (score: number) => {
  if (score >= 80) return 'bg-red-500';
  if (score >= 50) return 'bg-orange-500';
  return 'bg-green-500';
};

const inputCls =
  'h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:border-orange-400 text-sm text-navy-900 w-full';
const labelCls = 'text-xs font-medium text-slate-500 mb-1 block';

export default function PredictionsPage() {
  const selectedMarket = useMarketStore((s) => s.selectedMarket);
  const setMarketStore = useMarketStore((s) => s.setMarket);
  const {
    ratePrediction,
    fuelPrice,
    fuelCost,
    demandHeatmap,
    demandForecast,
    loading,
    error,
    fetchRatePrediction,
    fetchFuelPrice,
    fetchFuelCost,
    fetchDemandHeatmap,
    fetchDemandForecast,
  } = usePredictionsStore();

  // Local form inputs; market is pre-filled from the market store.
  const [market, setMarket] = useState<Market>(selectedMarket);
  const [equipment, setEquipment] = useState<string>(
    EQUIPMENT_BY_MARKET[selectedMarket][0]
  );
  const [distance, setDistance] = useState('500');
  const [dayOfWeek, setDayOfWeek] = useState('0');
  const [fuelPriceInput, setFuelPriceInput] = useState('');
  const [fuelDistance, setFuelDistance] = useState('500');
  const [selectedLane, setSelectedLane] = useState<DemandLane | null>(null);

  // On mount and when the market changes, refetch the fuel price + heatmap.
  useEffect(() => {
    fetchFuelPrice(market);
    fetchDemandHeatmap(market);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [market]);

  // Reset the equipment list when the market switches.
  useEffect(() => {
    setEquipment(EQUIPMENT_BY_MARKET[market][0]);
  }, [market]);

  // Pre-fill the fuel price input from the fuel price API.
  useEffect(() => {
    if (fuelPrice) setFuelPriceInput(String(fuelPrice.price));
  }, [fuelPrice]);

  // Average market rate = mean of the heatmap avg_rate values for the market.
  const avgMarketRate =
    demandHeatmap.length > 0
      ? demandHeatmap.reduce((sum, lane) => sum + lane.avg_rate, 0) /
      demandHeatmap.length
      : 0;

  const rateChartData = ratePrediction
    ? [
      { name: 'Predicted', rate: Number(ratePrediction.predicted_rate.toFixed(2)) },
      { name: 'Market Avg', rate: Number(avgMarketRate.toFixed(2)) },
    ]
    : [];

  const handleMarketChange = (newMarket: Market) => {
    setMarket(newMarket);
    setMarketStore(newMarket);
    setSelectedLane(null);
  };

  const handlePredictRate = (e: FormEvent) => {
    e.preventDefault();
    fetchRatePrediction({
      market,
      equipmentType: equipment,
      distance: Number(distance) || 0,
      dayOfWeek: Number(dayOfWeek),
      fuelPrice: Number(fuelPriceInput) || 0,
    });
  };

  const handleEstimateFuelCost = (e: FormEvent) => {
    e.preventDefault();
    fetchFuelCost(market, Number(fuelDistance) || 0);
  };

  const handleLaneClick = (lane: DemandLane) => {
    setSelectedLane(lane);
    fetchDemandForecast({
      origin: lane.origin,
      destination: lane.destination,
      market,
      days: 7,
    });
  };

  const unitLabel = distanceUnitFor(market);
  const currency = currencyFor(market);
  const perUnit =
    ratePrediction && Number(distance) > 0
      ? ratePrediction.predicted_rate / Number(distance)
      : 0;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy-900">AI Predictions</h1>
          <p className="text-slate-500 mt-1">
            Intelligent freight analytics powered by machine learning
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}
        {/* Loading indicator */}
        {loading && (
          <div className="mb-5 text-center text-slate-400 text-sm">
            Loading predictions…
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* SECTION 1 — Rate Prediction Calculator (left, larger) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-accent" />
              <h2 className="font-semibold text-navy-900">
                Rate Prediction Calculator
              </h2>
            </div>

            <form
              onSubmit={handlePredictRate}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4"
            >
              {/* Market */}
              <div>
                <label className={labelCls}>Market</label>
                <select
                  value={market}
                  onChange={(e) => handleMarketChange(e.target.value as Market)}
                  className={inputCls}
                >
                  <option value="USA">🇺🇸 USA</option>
                  <option value="EUROPE">🇪🇺 Europe</option>
                </select>
              </div>
              {/* Equipment */}
              <div>
                <label className={labelCls}>Equipment</label>
                <select
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value)}
                  className={inputCls}
                >
                  {EQUIPMENT_BY_MARKET[market].map((eq) => (
                    <option key={eq} value={eq}>
                      {eq}
                    </option>
                  ))}
                </select>
              </div>
              {/* Distance */}
              <div>
                <label className={labelCls}>Distance ({unitLabel})</label>
                <input
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="500"
                  className={inputCls}
                />
              </div>
              {/* Day of week */}
              <div>
                <label className={labelCls}>Day of Week</label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  className={inputCls}
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
              {/* Fuel price (pre-filled from the fuel price API) */}
              <div>
                <label className={labelCls}>
                  Fuel Price ({currency}/
                  {fuelPrice?.unit ?? (market === 'USA' ? 'gallon' : 'liter')})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={fuelPriceInput}
                  onChange={(e) => setFuelPriceInput(e.target.value)}
                  placeholder="3.85"
                  className={inputCls}
                />
              </div>
              {/* Predict button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 h-10 bg-accent hover:bg-accent-dark text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
                >
                  <TrendingUp className="w-4 h-4" />
                  Predict Rate
                </button>
              </div>
            </form>

            {/* Result card */}
            {ratePrediction ? (
              <div className="rounded-xl bg-slate-50 p-5">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-navy-900">
                    {ratePrediction.predicted_rate.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <span className="text-sm font-semibold text-accent">
                    {ratePrediction.currency}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  Confidence range:{' '}
                  {money(ratePrediction.confidence_low, ratePrediction.currency)} –{' '}
                  {money(ratePrediction.confidence_high, ratePrediction.currency)}
                </p>
                <p className="text-sm text-slate-500">
                  Rate per {unitLabel}:{' '}
                  {money(perUnit, ratePrediction.currency)}
                </p>

                {/* Predicted rate vs average market rate */}
                <div className="mt-4">
                  <ResponsiveContainer width="100%" height={224}>
                    <BarChart data={rateChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="rate"
                        fill="#F97316"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                Enter your lane details and predict a rate to see the forecast.
              </p>
            )}
          </div>

          {/* SECTION 2 — Fuel Cost Estimator (top right) */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Fuel className="w-5 h-5 text-accent" />
              <h2 className="font-semibold text-navy-900">Fuel Cost Estimator</h2>
            </div>

            {fuelPrice ? (
              <>
                <div className="rounded-xl bg-slate-50 p-4 mb-4">
                  <p className="text-xs font-medium text-slate-500 mb-1">
                    Current Diesel Price
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-navy-900">
                      {fuelPrice.price.toFixed(2)}
                    </span>
                    <span className="text-sm font-semibold text-accent">
                      {fuelPrice.currency}
                    </span>
                    <span className="text-xs text-slate-400">
                      / {fuelPrice.unit}
                    </span>
                  </div>
                </div>

                {/* 7-day fuel price trend */}
                <div className="mb-4">
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={fuelPrice.trend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(v) => String(v).slice(5)}
                      />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#F97316"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400 mb-4">Loading fuel prices…</p>
            )}

            {/* Fuel cost calculator */}
            <form onSubmit={handleEstimateFuelCost} className="grid grid-cols-1 gap-3">
              <div>
                <label className={labelCls}>Trip Distance ({unitLabel})</label>
                <input
                  type="number"
                  value={fuelDistance}
                  onChange={(e) => setFuelDistance(e.target.value)}
                  placeholder="500"
                  className={inputCls}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 h-10 bg-accent hover:bg-accent-dark text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
              >
                <Calculator className="w-4 h-4" />
                Estimate Fuel Cost
              </button>
            </form>

            {fuelCost && (
              <div className="mt-4 rounded-xl bg-slate-50 p-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Fuel Cost</span>
                  <span className="font-bold text-navy-900">
                    {money(fuelCost.fuel_cost, fuelCost.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fuel Price</span>
                  <span className="text-navy-900">
                    {money(fuelCost.fuel_price, fuelCost.currency)} /{' '}
                    {fuelCost.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Efficiency</span>
                  <span className="text-navy-900">{fuelCost.fuel_efficiency}</span>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3 — Demand Heatmap (bottom, full width) */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-accent" />
                <h2 className="font-semibold text-navy-900">Demand Heatmap</h2>
              </div>
              {/* Market toggle re-fetches the heatmap */}
              <div className="flex items-center gap-2">
                {(['USA', 'EUROPE'] as Market[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => handleMarketChange(m)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${market === m
                        ? 'bg-accent text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    {m === 'USA' ? '🇺🇸 USA' : '🇪🇺 Europe'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {demandHeatmap.map((lane) => (
                <button
                  key={lane.lane}
                  onClick={() => handleLaneClick(lane)}
                  className={`text-left p-4 rounded-xl border transition-colors ${selectedLane?.lane === lane.lane
                      ? 'border-accent bg-orange-50'
                      : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
                    }`}
                >
                  <p className="text-sm font-semibold text-navy-900">
                    {lane.origin} → {lane.destination}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full ${demandColor(lane.demand_score)}`}
                        style={{ width: `${lane.demand_score}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-600">
                      {lane.demand_score}
                    </span>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-slate-500">
                    <span>{lane.load_count} loads</span>
                    <span>{money(lane.avg_rate, currency)}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Clicked-lane 7-day forecast */}
            {selectedLane && demandForecast.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-navy-900 mb-3">
                  7-day forecast: {selectedLane.origin} →{' '}
                  {selectedLane.destination}
                </p>
                <ResponsiveContainer width="100%" height={256}>
                  <LineChart data={demandForecast}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(v) => String(v).slice(5)}
                    />
                    <YAxis yAxisId="loads" />
                    <YAxis yAxisId="rate" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="loads"
                      type="monotone"
                      dataKey="predicted_loads"
                      stroke="#F97316"
                      name="Predicted Loads"
                      dot={false}
                    />
                    <Line
                      yAxisId="rate"
                      type="monotone"
                      dataKey="predicted_avg_rate"
                      stroke="#0F172A"
                      name="Avg Rate"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
