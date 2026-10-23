import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import LoadCard from '../components/LoadCard';
import { useLoadsStore } from '../store/loadsStore';
import { useAuthStore } from '../store/authStore';
import { Search, X } from 'lucide-react';
import type { Load } from '../types/load';

type MarketTab = 'USA' | 'EUROPE';
type SortKey = 'newest' | 'rate-high' | 'rate-low' | 'distance';

const EQUIPMENT_OPTIONS = [
  'ALL',
  'Flatbed',
  'Dry Van',
  'Reefer',
  'Step Deck',
  'Lowboy',
  'Tautliner',
  'Mega',
  'Frigo',
  'Coil',
];

const inputCls =
  'h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:border-orange-400 text-sm text-navy-900 w-full';

function sortLoads(loads: Load[], sortKey: SortKey): Load[] {
  const copy = [...loads];
  if (sortKey === 'rate-high') {
    return copy.sort((a, b) => (b.rate ?? 0) - (a.rate ?? 0));
  }
  if (sortKey === 'rate-low') {
    return copy.sort((a, b) => (a.rate ?? 0) - (b.rate ?? 0));
  }
  if (sortKey === 'distance') {
    return copy.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
  }
  // newest: sort by age ascending (lower age = more recent)
  return copy.sort((a, b) => (a.age ?? 0) - (b.age ?? 0));
}

export default function LoadsPage() {
  const { loads, isLoading, searchLoads, pickLoad, clearFilters } = useLoadsStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [pickingId, setPickingId] = useState<string | null>(null);
  const [marketTab, setMarketTab] = useState<MarketTab>(
    (user?.market as MarketTab) || 'USA'
  );
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [filters, setFilters] = useState({
    originCity: '',
    destCity: '',
    equipmentType: 'ALL',
    dateFrom: '',
    dateTo: '',
    minRate: '',
    maxRate: '',
  });

  useEffect(() => {
    searchLoads({ market: marketTab });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    searchLoads({
      market: marketTab,
      originCity: filters.originCity,
      destCity: filters.destCity,
      equipmentType: filters.equipmentType === 'ALL' ? '' : filters.equipmentType,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      minRate: filters.minRate,
      maxRate: filters.maxRate,
    });
  };

  const handleClear = () => {
    clearFilters();
    setFilters({
      originCity: '',
      destCity: '',
      equipmentType: 'ALL',
      dateFrom: '',
      dateTo: '',
      minRate: '',
      maxRate: '',
    });
    searchLoads({ market: marketTab });
  };

  const handleMarketTab = (tab: MarketTab) => {
    setMarketTab(tab);
    searchLoads({ market: tab });
  };

  const handlePick = async (id: string) => {
    setPickingId(id);
    await pickLoad(id);
    setPickingId(null);
  };

  const sortedLoads = sortLoads(loads, sortKey);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy-900">Find Loads</h1>
          <p className="text-slate-500 mt-1">Browse and pick available freight loads</p>
        </div>

        {/* Search form */}
        <form
          onSubmit={handleSearch}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mb-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            {/* Origin City */}
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Origin City</label>
              <input
                value={filters.originCity}
                onChange={e => setFilters(f => ({ ...f, originCity: e.target.value }))}
                placeholder="e.g. Chicago"
                className={inputCls}
              />
            </div>
            {/* Dest City */}
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Destination City</label>
              <input
                value={filters.destCity}
                onChange={e => setFilters(f => ({ ...f, destCity: e.target.value }))}
                placeholder="e.g. Dallas"
                className={inputCls}
              />
            </div>
            {/* Equipment */}
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Equipment</label>
              <select
                value={filters.equipmentType}
                onChange={e => setFilters(f => ({ ...f, equipmentType: e.target.value }))}
                className={inputCls}
              >
                {EQUIPMENT_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>
                    {opt === 'ALL' ? 'All Equipment' : opt}
                  </option>
                ))}
              </select>
            </div>
            {/* Date From */}
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
                className={inputCls}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Date To */}
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
                className={inputCls}
              />
            </div>
            {/* Min Rate */}
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Min Rate</label>
              <input
                type="number"
                value={filters.minRate}
                onChange={e => setFilters(f => ({ ...f, minRate: e.target.value }))}
                placeholder="e.g. 1000"
                className={inputCls}
              />
            </div>
            {/* Max Rate */}
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Max Rate</label>
              <input
                type="number"
                value={filters.maxRate}
                onChange={e => setFilters(f => ({ ...f, maxRate: e.target.value }))}
                placeholder="e.g. 5000"
                className={inputCls}
              />
            </div>
            {/* Buttons */}
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 h-10 bg-accent hover:bg-accent-dark text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center justify-center gap-1 h-10 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            </div>
          </div>
        </form>

        {/* Market toggle */}
        <div className="flex items-center gap-2 mb-5">
          {(['USA', 'EUROPE'] as MarketTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => handleMarketTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${marketTab === tab
                  ? 'bg-accent text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
            >
              {tab === 'USA' ? '🇺🇸 USA' : '🇪🇺 Europe'}
            </button>
          ))}
        </div>

        {/* Results header */}
        {!isLoading && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                {loads.length} load{loads.length !== 1 ? 's' : ''} found
              </span>
            </div>
            <select
              value={sortKey}
              onChange={e => setSortKey(e.target.value as SortKey)}
              className="h-9 px-3 rounded-lg border border-gray-200 text-sm text-navy-900 focus:outline-none focus:border-orange-400"
            >
              <option value="newest">Newest</option>
              <option value="rate-high">Rate High → Low</option>
              <option value="rate-low">Rate Low → High</option>
              <option value="distance">Distance</option>
            </select>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-16 text-slate-400">Loading loads...</div>
        ) : sortedLoads.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            No loads found. Try adjusting your filters.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {sortedLoads.map(load => (
              <LoadCard
                key={load.id}
                load={load}
                onPick={handlePick}
                isPicking={pickingId === load.id}
                currentUserId={user?.id}
                onViewDetail={id => navigate(`/loads/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
