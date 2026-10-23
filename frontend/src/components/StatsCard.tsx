import { ReactNode } from 'react';

interface Props { icon: ReactNode; label: string; value: string | number; sub?: string; color?: string; }

export default function StatsCard({ icon, label, value, sub, color = 'text-accent' }: Props) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-xl bg-orange-50 ${color}`}>{icon}</div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-navy-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}
