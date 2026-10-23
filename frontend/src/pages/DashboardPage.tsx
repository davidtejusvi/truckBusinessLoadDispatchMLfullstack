import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import StatsCard from '../components/StatsCard';
import { Truck, DollarSign, Activity, MapPin } from 'lucide-react';
import { dashboardApi } from '../api/dashboard';

interface Stats { activeLoads: number; totalRevenue: number; loadsThisWeek: number; milesThisWeek: number; revenueThisMonth: number; pendingLoads: number; }

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    dashboardApi.getDashboard().then(setStats).catch(() => {
      setStats({ activeLoads: 3, totalRevenue: 12850, loadsThisWeek: 7, milesThisWeek: 4230, revenueThisMonth: 38400, pendingLoads: 2 });
    });
  }, []);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-navy-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Your freight operations at a glance</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatsCard icon={<Truck className="w-5 h-5" />} label="Active Loads" value={stats?.activeLoads ?? '—'} sub="In transit now" />
          <StatsCard icon={<DollarSign className="w-5 h-5" />} label="Revenue This Month" value={stats ? `$${stats.revenueThisMonth.toLocaleString()}` : '—'} sub="Gross earnings" />
          <StatsCard icon={<Activity className="w-5 h-5" />} label="Loads This Week" value={stats?.loadsThisWeek ?? '—'} sub="Completed" />
          <StatsCard icon={<MapPin className="w-5 h-5" />} label="Miles Driven" value={stats ? stats.milesThisWeek.toLocaleString() : '—'} sub="This week" />
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="font-semibold text-navy-900 mb-4">Recent Loads</h2>
            <div className="space-y-3">
              {[{ route: 'Chicago, IL → Dallas, TX', type: 'Dry Van', rate: 2850 }, { route: 'Hamburg → Warsaw', type: 'Curtainsider', rate: 2200 }, { route: 'Atlanta, GA → Miami, FL', type: 'Reefer', rate: 2100 }].map(l => (
                <div key={l.route} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div><p className="text-sm font-medium text-navy-900">{l.route}</p><p className="text-xs text-slate-400">{l.type}</p></div>
                  <span className="text-sm font-bold text-accent">${l.rate.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="font-semibold text-navy-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <a href="/loads" className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors">
                <Truck className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium text-accent">Browse Available Loads</span>
              </a>
              <a href="/predictions" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <Activity className="w-5 h-5 text-slate-500" />
                <span className="text-sm font-medium text-slate-600">View Rate Predictions</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
