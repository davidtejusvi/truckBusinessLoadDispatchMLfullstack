import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MarketState {
  selectedMarket: 'USA' | 'EUROPE';
  setMarket: (market: 'USA' | 'EUROPE') => void;
}

export const useMarketStore = create<MarketState>()(
  persist(
    (set) => ({
      selectedMarket: 'USA',
      setMarket: (market) => set({ selectedMarket: market }),
    }),
    { name: 'truckbiz-market' }
  )
);
