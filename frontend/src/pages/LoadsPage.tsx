import { useState, useEffect, FormEvent } from 'react';
import Layout from '../components/Layout';
import LoadCard from '../components/LoadCard';
import { useLoadsStore } from '../store/loadsStore';
import { useAuthStore } from '../store/authStore';
import { Search } from 'lucide-react';

export default function LoadsPage() {
  const { loads, isLoading, searchLoads, pickLoad } = useLoadsStore();
  const { user } = useAuthStore();
  const [pickingId, setPickingId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    market: user?.market || 'USA',
    origin: '',
    destination: '',
    equipmentType: '',
  });

  useEffect(() => {
    searchLoads({ market: filters.market });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    searchLoads(filters);
  };

  const handlePick = async (id: string) => {
    setPickingId(id);
    await pickLoad(id);
    setPickingId(null);
  };

  const inputCls = "px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent text-sm text-navy-900";

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy-900">Find Loads</h1>
          <p className="text-slate-500 mt-1">Browse and pick available freight loads</p>
        </div>
        <form onSubmit={handleSearch} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Market</label>
              <select value={filters.market} onChange={e => setFilters(f => ({ ...f, market: e.target.value }))} className={inputCls + ' w-full'}>
                <option value="USA">🇺🇸 USA</option>
                <option value="EUROPE">🇪🇺 Europe</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Origin</label>
              <input value={filters.origin} onChange={e => setFilters(f => ({ ...f, origin: e.target.value }))} placeholder="City or state" className={inputCls + ' w-full'} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Destination</label>
              <input value={filters.destination} onChange={e => setFilters(f => ({ ...f, destination: e.target.value }))} placeholder="City or state" className={inputCls + ' w-full'} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Equipment</label>
              <input value={filters.equipmentType} onChange={e => setFilters(f => ({ ...f, equipmentType: e.target.value }))} placeholder="Dry Van, Reefer..." className={inputCls + ' w-full'} />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full flex items-center justify-center gap-2 py-2.5 bg-accent hover:bg-accent-dark text-white font-semibold rounded-xl transition-colors">
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>
          </div>
        </form>
        {isLoading ? (
          <div className="text-center py-16 text-slate-400">Loading loads...</div>
        ) : loads.length === 0 ? (
          <div className="text-center py-16 text-slate-400">No loads found. Try adjusting your filters.</div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-4">{loads.length} load{loads.length !== 1 ? 's' : ''} found</p>
            <div className="grid md:grid-cols-2 gap-4">
              {loads.map(load => (
                <LoadCard key={load.id} load={load} onPick={handlePick} isPicking={pickingId === load.id} />
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
