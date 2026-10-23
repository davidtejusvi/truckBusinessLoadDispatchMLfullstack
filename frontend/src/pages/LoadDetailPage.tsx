import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout';
import { useLoadsStore } from '../store/loadsStore';
import { useAuthStore } from '../store/authStore';

const EQUIPMENT_BADGE: Record<string, string> = {
  Flatbed: 'bg-blue-100 text-blue-700',
  'Dry Van': 'bg-green-100 text-green-700',
  Reefer: 'bg-cyan-100 text-cyan-700',
  'Step Deck': 'bg-purple-100 text-purple-700',
  Lowboy: 'bg-yellow-100 text-yellow-700',
  Tautliner: 'bg-blue-100 text-blue-700',
  Mega: 'bg-green-100 text-green-700',
  Frigo: 'bg-cyan-100 text-cyan-700',
  Coil: 'bg-orange-100 text-orange-700',
};

function equipmentBadgeCls(type: string): string {
  return EQUIPMENT_BADGE[type] ?? 'bg-slate-100 text-slate-700';
}

export default function LoadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentLoad, isLoading, fetchLoadById, pickLoad } = useLoadsStore();
  const { user } = useAuthStore();
  const [picking, setPicking] = useState(false);
  const [picked, setPicked] = useState(false);

  useEffect(() => {
    if (id) fetchLoadById(id);
  }, [id, fetchLoadById]);

  const handlePick = async () => {
    if (!id) return;
    setPicking(true);
    try {
      await pickLoad(id);
      setPicked(true);
    } finally {
      setPicking(false);
    }
  };

  const isEurope = currentLoad?.market === 'EUROPE';
  const currencySymbol = isEurope ? '€' : '$';
  const distanceUnit = isEurope ? 'km' : 'mi';

  const rateTotal = currentLoad?.rate ?? 0;
  const estFuelCost = rateTotal * 0.28;
  const netEstimate = rateTotal * 0.72;

  const isAlreadyPicked =
    picked ||
    (currentLoad?.status !== 'AVAILABLE') ||
    (currentLoad?.pickedById != null && currentLoad.pickedById === user?.id);

  if (isLoading && !currentLoad) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-24 text-slate-400">
          Loading load details...
        </div>
      </Layout>
    );
  }

  if (!currentLoad && !isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-navy-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Loads
          </button>
          <p className="text-slate-400">Load not found.</p>
        </div>
      </Layout>
    );
  }

  const load = currentLoad!;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-navy-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Loads
        </button>

        {/* Page title */}
        <h1 className="text-2xl font-bold text-navy-900 mb-6">
          {load.originCity} → {load.destCity}
        </h1>

        {/* Two-column layout */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Left column: load info */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
            {/* Equipment badge + commodity */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${equipmentBadgeCls(load.equipmentType)}`}
              >
                {load.equipmentType}
              </span>
              {load.commodity && (
                <span className="text-xs text-slate-500">{load.commodity}</span>
              )}
            </div>

            {/* Full route */}
            <div>
              <p className="text-xs text-slate-400 mb-1">Route</p>
              <p className="text-lg font-bold text-navy-900">
                {load.originCity}, {load.originState} → {load.destCity}, {load.destState}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400">Weight</p>
                <p className="text-sm font-semibold text-navy-900">
                  {load.weight != null
                    ? `${load.weight.toLocaleString()} ${isEurope ? 'kg' : 'lbs'}`
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Distance</p>
                <p className="text-sm font-semibold text-navy-900">
                  {load.distance != null
                    ? `${load.distance.toLocaleString()} ${distanceUnit}`
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Pickup Date</p>
                <p className="text-sm font-semibold text-navy-900 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {load.pickupDate
                    ? new Date(load.pickupDate).toLocaleDateString()
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Delivery Date</p>
                <p className="text-sm font-semibold text-navy-900 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {load.deliveryDate
                    ? new Date(load.deliveryDate).toLocaleDateString()
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Posted By</p>
                <p className="text-sm font-semibold text-navy-900">{load.postedBy ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Status</p>
                <span
                  className={`inline-flex text-xs font-semibold px-2 py-0.5 rounded-full ${
                    load.status === 'AVAILABLE'
                      ? 'bg-green-100 text-green-700'
                      : load.status === 'PICKED'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {load.status}
                </span>
              </div>
            </div>
          </div>

          {/* Right column: rate breakdown + CTA */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-semibold text-navy-900 mb-4">Rate Breakdown</h2>
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-slate-500">Total Rate</span>
                  <span className="text-2xl font-bold text-accent">
                    {rateTotal > 0
                      ? `${currencySymbol}${rateTotal.toLocaleString()}`
                      : '—'}
                  </span>
                </div>
                {load.distance != null && rateTotal > 0 && (
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-slate-500">Per {distanceUnit}</span>
                    <span className="text-sm font-semibold text-navy-900">
                      {isEurope
                        ? `€${(load.ratePerKm ?? rateTotal / load.distance).toFixed(2)}/${distanceUnit}`
                        : `$${(load.ratePerMile ?? rateTotal / load.distance).toFixed(2)}/${distanceUnit}`}
                    </span>
                  </div>
                )}
                {rateTotal > 0 && (
                  <>
                    <div className="flex items-baseline justify-between border-t border-slate-100 pt-2">
                      <span className="text-sm text-slate-500">Est. Fuel Cost (28%)</span>
                      <span className="text-sm font-semibold text-red-500">
                        −{currencySymbol}{estFuelCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-medium text-navy-900">Net Estimate</span>
                      <span className="text-sm font-bold text-green-600">
                        {currencySymbol}{netEstimate.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Pick CTA */}
            {picked ? (
              <div className="bg-green-50 rounded-xl border border-green-100 p-4 text-center">
                <p className="text-green-700 font-semibold">✓ Load picked successfully!</p>
              </div>
            ) : (
              <button
                onClick={handlePick}
                disabled={isAlreadyPicked || picking}
                className="w-full h-12 bg-accent hover:bg-accent-dark text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {picking
                  ? 'Picking...'
                  : isAlreadyPicked
                  ? load.status !== 'AVAILABLE'
                    ? 'Not Available'
                    : '✓ Already Picked'
                  : 'Pick This Load'}
              </button>
            )}
          </div>
        </div>

        {/* Map placeholder */}
        <div className="bg-slate-100 rounded-xl h-48 flex items-center justify-center">
          <p className="text-slate-500">
            🗺 Route: {load.originCity} → {load.destCity}
            {load.distance != null && ` (${load.distance.toLocaleString()} ${distanceUnit})`}
          </p>
        </div>
      </div>
    </Layout>
  );
}
