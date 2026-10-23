import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useLoadsStore } from '../store/loadsStore';
import { useAuthStore } from '../store/authStore';

export default function ActiveLoadsPage() {
  const { activeLoads, isLoading, fetchActiveLoads } = useLoadsStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchActiveLoads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isEurope = user?.market === 'EUROPE';
  const currencySymbol = isEurope ? '€' : '$';
  const totalRevenue = activeLoads.reduce((sum, l) => sum + (l.rate ?? 0), 0);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy-900">My Active Loads</h1>
          <p className="text-slate-500 mt-1">Loads you have picked</p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <p className="text-xs text-slate-400 mb-1">Total Loads</p>
            <p className="text-2xl font-bold text-navy-900">{activeLoads.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <p className="text-xs text-slate-400 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-accent">
              {currencySymbol}{totalRevenue.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Load list */}
        {isLoading ? (
          <div className="text-center py-16 text-slate-400">Loading active loads...</div>
        ) : activeLoads.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="mb-3">No active loads yet. Browse the load board to pick loads.</p>
            <Link
              to="/loads"
              className="inline-flex items-center px-5 py-2.5 bg-accent hover:bg-accent-dark text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Browse Loads
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activeLoads.map(load => (
              <div
                key={load.id}
                className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-4"
              >
                {/* Left: route + badge + commodity */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-navy-900 truncate">
                    {load.originCity}, {load.originState} → {load.destCity}, {load.destState}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {load.equipmentType}
                    </span>
                    {load.commodity && (
                      <span className="text-xs text-slate-400">{load.commodity}</span>
                    )}
                  </div>
                </div>

                {/* Middle: pickup date + status */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-slate-400">
                    {load.pickupDate ? new Date(load.pickupDate).toLocaleDateString() : '—'}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                    PICKED
                  </span>
                </div>

                {/* Right: rate + view link */}
                <div className="flex flex-col items-end gap-2">
                  <span className="text-sm font-bold text-accent">
                    {load.rate != null
                      ? `${currencySymbol}${load.rate.toLocaleString()}`
                      : '—'}
                  </span>
                  <button
                    onClick={() => navigate(`/loads/${load.id}`)}
                    className="text-xs font-medium text-navy-900 hover:text-accent underline underline-offset-2 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
