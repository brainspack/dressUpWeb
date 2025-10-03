import { create } from 'zustand';
import { baseApi } from '../api/baseApi';
import useAuthStore from './useAuthStore';
import { getEffectiveRole } from '../utils/roleUtils';

interface Tailor {
  id: string;
  serialNumber: number;
  name: string;
  mobileNumber: string;
  shopId: string;
}

interface TailorState {
  tailors: Tailor[];
  loading: boolean;
  error: string | null;
  addTailor: (tailorData: { name: string; mobileNumber: string; shopId: string }) => Promise<void>;
  fetchTailors: (shopId: string) => Promise<void>;
  fetchAllTailors: () => Promise<void>;
  updateTailor: (id: string, data: Partial<Tailor>) => Promise<void>;
  clearTailors: () => void;
}

export const useTailorStore = create<TailorState>((set) => ({
  tailors: [],
  loading: false,
  error: null,

  addTailor: async (tailorData) => {
    set({ loading: true, error: null });
    try {
      const response = await baseApi('/tailors', {
        method: 'POST',
        body: JSON.stringify(tailorData),
      });
      set((state) => ({
        tailors: [...state.tailors, response as Tailor],
        loading: false,
      }));
    } catch (err: any) {
      console.error('Error adding tailor:', err);
      set({ error: err.message || 'Failed to add tailor', loading: false });
      throw err;
    }
  },

  fetchTailors: async (shopId) => {
    set({ loading: true, error: null, tailors: [] }); // Clear tailors immediately
    try {
      console.log('🔍 Fetching tailors for shop:', shopId);
      // Add cache busting to ensure fresh data
      const response = await baseApi(`/tailors/by-shop/${shopId}?_t=${Date.now()}`, { method: 'GET' });
      console.log('📦 Raw API response:', response);
      const user = useAuthStore.getState().user;
      const role = getEffectiveRole(user).toLowerCase();
      let tailors = response as Tailor[];
      if (role === 'shop_owner' && user?.shopId) {
        tailors = tailors.filter(tailor => tailor.shopId === user.shopId);
      }
      console.log('✅ Tailors fetched:', tailors.length, 'for shop:', shopId);
      console.log('📋 Tailor details:', tailors.map(t => ({ name: t.name, mobileNumber: t.mobileNumber, shopId: t.shopId })));
      set({ tailors, loading: false });
    } catch (err: any) {
      console.error('❌ Error fetching tailors for shop', shopId, ':', err);
      set({ error: err.message || 'Failed to fetch tailors', loading: false, tailors: [] });
    }
  },

  fetchAllTailors: async () => {
    set({ loading: true, error: null });
    try {
      const response = await baseApi(`/tailors`, { method: 'GET' });
      const user = useAuthStore.getState().user;
      const role = getEffectiveRole(user).toLowerCase();
      let tailors = response as Tailor[];
      if (role === 'shop_owner' && user?.shopId) {
        tailors = tailors.filter(tailor => tailor.shopId === user.shopId);
      }
      set({ tailors, loading: false });
    } catch (err: any) {
      console.error('Error fetching all tailors:', err);
      set({ error: err.message || 'Failed to fetch all tailors', loading: false });
    }
  },

  updateTailor: async (id: string, data: Partial<Tailor>) => {
    set({ loading: true, error: null });
    try {
      const response = await baseApi(`/tailors/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      set((state) => ({
        tailors: state.tailors.map((tailor) =>
          tailor.id === id ? { ...tailor, ...response } : tailor
        ),
        loading: false,
      }));
    } catch (err: any) {
      console.error('Error updating tailor:', err);
      set({ error: err.message || 'Failed to update tailor', loading: false });
      throw err;
    }
  },

  clearTailors: () => {
    set({ tailors: [], error: null });
  }
})); 