import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Load } from '../types/load';

interface Props {
  load: Load;
  onPick?: (id: string) => void;
  isPicking?: boolean;
  currentUserId?: string;
  onViewDetail?: (id: string) => void;
}

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

function formatAge(minutes?: number): string {
  if (minutes === undefined || minutes === null) return '';
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

function formatCurrency(amount: number, market: 'USA' | 'EUROPE'): string {
  const sym = market === 'EUROPE' ? '€' : '$';
  return `${sym}${amount.toLocaleString()}`;
}

function formatWeight(weight: number, market: 'USA' | 'EUROPE'): string {
  return market === 'EUROPE'
    ? `${weight.toLocaleString()} kg`
    : `${weight.toLocaleString()} lbs`;
}

function formatDistance(distance: number, market: 'USA' | 'EUROPE'): string {
  return market === 'EUROPE'
    ? `${distance.toLocaleString()} km`
    : `${distance.toLocaleString()} mi`;
}

function formatRatePerUnit(
  load: Load,
): string {
  if (load.market === 'EUROPE') {
    if (load.ratePerKm != null) return `€${load.ratePerKm.toFixed(2)}/km`;
    if (load.rate && load.distance) return `€${(load.rate / load.distance).toFixed(2)}/km`;
    return '';
  }
  if (load.ratePerMile != null) return `$${load.ratePerMile.toFixed(2)}/mi`;
  if (load.rate && load.distance) return `$${(load.rate / load.distance).toFixed(2)}/mi`;
  return '';
}

export default function LoadCard({ load, onPick, isPicking, currentUserId, onViewDetail }: Props) {
  const navigate = useNavigate();
  const isPickedByMe = load.pickedById != null && load.pickedById === currentUserId;
  const isPicked = load.status !== 'AVAILABLE';

  const handleViewDetail = () => {
    if (onViewDetail) {
      onViewDetail(load.id);
    } else {
      navigate(`/loads/${load.id}`);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5">
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
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
        <div className="flex flex-col items-end gap-0.5">
          {load.externalId && (
            <span className="text-xs font-mono text-slate-400">{load.externalId}</span>
          )}
          {load.age !== undefined && (
            <span className="text-xs text-slate-400">{formatAge(load.age)}</span>
          )}
        </div>
      </div>

      {/* Route line */}
      <p className="text-lg font-bold text-navy-900 mb-3">
        {load.originCity}, {load.originState} → {load.destCity}, {load.destState}
      </p>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="flex flex-col">
          <span className="text-xs text-slate-400">Weight</span>
          <span className="text-xs font-semibold text-navy-900">
            {load.weight != null ? formatWeight(load.weight, load.market) : '—'}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-400">Distance</span>
          <span className="text-xs font-semibold text-navy-900">
            {load.distance != null ? formatDistance(load.distance, load.market) : '—'}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-400">Rate</span>
          <span className="text-xs font-semibold text-accent">
            {load.rate != null ? formatCurrency(load.rate, load.market) : '—'}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-400">Per unit</span>
          <span className="text-xs font-semibold text-navy-900">
            {formatRatePerUnit(load) || '—'}
          </span>
        </div>
      </div>

      {/* Pickup date */}
      {load.pickupDate && (
        <div className="flex items-center gap-1.5 mb-3">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500">
            Pickup: {new Date(load.pickupDate).toLocaleDateString()}
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
        <span className="text-xs text-slate-400">
          Posted by {load.postedBy ?? 'Unknown'}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleViewDetail}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-navy-900 hover:bg-slate-50 transition-colors"
          >
            View Details
          </button>
          {isPickedByMe ? (
            <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-100 text-green-700">
              ✓ Picked
            </span>
          ) : (
            !isPicked && onPick && (
              <button
                onClick={() => onPick(load.id)}
                disabled={isPicking}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-accent hover:bg-accent-dark text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPicking ? 'Picking...' : 'Pick Load'}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
