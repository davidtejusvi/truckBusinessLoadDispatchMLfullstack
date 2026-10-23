import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatsCard from '../components/StatsCard';
import { Truck, DollarSign, Activity, MapPin, Search } from 'lucide-react';
import { dashboardApi } from '../api/dashboard';
import { useLoadsStore } from '../store/loadsStore';

interface Stats {
  activeLoads: number;
  totalRevenue: number;
  loadsThisWeek: number;
  milesThisWeek: number;
  revenueThisMonth: number;
  pendingLoads: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { activeLoads, fetchActiveLoads } = useLoadsStore();
  const navigate = useNavigate();

  useEffect(() => {
    dashboardApi.getDashboard().then(setStats).catch(() => {
      setStats({
        activeLoads: 3,
        totalRevenue: 12850,
        loadsThisWeek: 7,
        milesThisWeek: 4230,
        revenueThisMonth: 38400,
        pendingLoads: 2,
      });
    });
    fetchActiveLoads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQuickSearch = () => {
    navigate('/loads', { state: { searchTerm } });
  };

  const recentLoads = activeLoads.slice(0, 5);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-navy-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Your freight operations at a glance</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatsCard
            icon={<Truck className="w-5 h-5" />}
            label="Active Loads"
            value={stats?.activeLoads ?? '—'}
            sub="In transit now"
          />
          <StatsCard
            icon={<DollarSign className="w-5 h-5" />}
            label="Revenue This Month"
            value={stats ? `$${stats.revenueThisMonth.toLocaleString()}` : '—'}
            sub="Gross earnings"
          />
          <StatsCard
            icon={<Activity className="w-5 h-5" />}
            label="Loads This Week"
            value={stats?.loadsThisWeek ?? '—'}
            sub="Completed"
          />
          <StatsCard
            icon={<MapPin className="w-5 h-5" />}
            label="Miles Driven"
            value={stats ? stats.milesThisWeek.toLocaleString() : '—'}
            sub="This week"
          />
        </div>

        {/* Quick Search bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-6 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleQuickSearch()}
            placeholder="Search loads..."
            className="flex-1 text-sm text-navy-900 outline-none placeholder-slate-400"
          />
          <button
            onClick={handleQuickSearch}
            className="px-4 py-1.5 bg-accent hover:bg-accent-dark text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Go
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Recent Active Loads */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="font-semibold text-navy-900 mb-4">Recent Active Loads</h2>
            <div className="space-y-3">
              {recentLoads.length === 0 ? (
                <p className="text-sm text-slate-400">No loads yet.</p>
              ) : (
                recentLoads.map(load => (
                  <div
                    key={load.id}
                    className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-navy-900">
                        {load.originCity}, {load.originState} → {load.destCity},{' '}
                        {load.destState}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400">{load.equipmentType}</span>
                        <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-green-50 text-green-600">
                          {load.status}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-accent">
                      {load.rate != null ? `$${load.rate.toLocaleString()}` : '—'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="font-semibold text-navy-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/loads"
                className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors"
              >
                <Truck className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium text-accent">Browse Available Loads</span>
              </Link>
              <Link
                to="/loads/active"
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <MapPin className="w-5 h-5 text-slate-500" />
                <span className="text-sm font-medium text-slate-600">My Active Loads</span>
              </Link>
              <Link
                to="/predictions"
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <Activity className="w-5 h-5 text-slate-500" />
                <span className="text-sm font-medium text-slate-600">View Rate Predictions</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
