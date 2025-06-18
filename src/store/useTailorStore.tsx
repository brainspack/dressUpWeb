import { create } from 'zustand';
import { baseApi } from '../api/baseApi';

interface Tailor {
  id: string;
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
  updateTailor: (id: string, data: Partial<Tailor>) => Promise<void>;
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
    set({ loading: true, error: null });
    try {
      const response = await baseApi(`/tailors?shopId=${shopId}`, { method: 'GET' });
      set({ tailors: response as Tailor[], loading: false });
    } catch (err: any) {
      console.error('Error fetching tailors:', err);
      set({ error: err.message || 'Failed to fetch tailors', loading: false });
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
})); 