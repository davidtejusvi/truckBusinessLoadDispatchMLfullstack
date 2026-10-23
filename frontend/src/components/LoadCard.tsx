import { MapPin, Truck, Package, Calendar, DollarSign } from 'lucide-react';
import MarketBadge from './MarketBadge';
import type { Load } from '../store/loadsStore';

interface Props { load: Load; onPick?: (id: string) => void; isPicking?: boolean; }

export default function LoadCard({ load, onPick, isPicking }: Props) {
  const isPicked = load.status !== 'AVAILABLE';
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <MarketBadge market={load.market} size="sm" />
          <span className="text-xs text-slate-400">{load.externalId}</span>
        </div>
        {isPicked ? (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">Picked</span>
        ) : (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-600">Available</span>
        )}
      </div>
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
        <span className="font-semibold text-navy-900">{load.originCity}, {load.originState}</span>
        <span className="text-slate-400">→</span>
        <span className="font-semibold text-navy-900">{load.destCity}, {load.destState}</span>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-600">{load.equipmentType}</span>
        </div>
        {load.distance && (
          <div className="flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-600">{load.distance.toLocaleString()} mi</span>
          </div>
        )}
        {load.pickupDate && (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-600">{new Date(load.pickupDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        {load.rate ? (
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-accent" />
            <span className="text-xl font-bold text-navy-900">{load.rate.toLocaleString()}</span>
            {load.distance && <span className="text-xs text-slate-400 ml-1">(${(load.rate / load.distance).toFixed(2)}/mi)</span>}
          </div>
        ) : <span />}
        {!isPicked && onPick && (
          <button
            onClick={() => onPick(load.id)}
            disabled={isPicking}
            className="px-4 py-2 bg-accent hover:bg-accent-dark text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPicking ? 'Picking...' : 'Pick Load'}
          </button>
        )}
      </div>
    </div>
  );
}
