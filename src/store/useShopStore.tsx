import { create } from 'zustand';
import { baseApi } from '../api/baseApi';
import useAuthStore from './useAuthStore';
import { getEffectiveRole } from '../utils/roleUtils';

export interface Shop {
  id: string;
  serialNumber: number;
  name: string;
  phone: string;
  address: string;
  description?: string;
  ownerId: string;
  owner?: {
    id: string;
    name: string;
    mobileNumber: string;
    role: string;
  };
  totalActiveCustomers?: number;
  totalActiveTailors?: number;
  totalOrders?: number;
  deliveredOrders?: number;
  pendingOrders?: number;
}

interface ShopState {
  shops: Shop[];
  loading: boolean;
  error: string | null;
  fetchShops: () => Promise<void>;
  updateShop: (id: string, data: Partial<Shop>) => Promise<void>;
}

export const useShopStore = create<ShopState>((set) => ({
  shops: [],
  loading: false,
  error: null,

  fetchShops: async () => {
    set({ loading: true, error: null });
    try {
      const user = useAuthStore.getState().user;
      let response;
      
      const effectiveRole = getEffectiveRole(user);
      
      console.log(`🏪 SHOP STORE: User phone: ${user?.phone}, Role: ${user?.role}, Effective role: ${effectiveRole}`);
      
      if (effectiveRole === 'SUPER_ADMIN') {
        try {
          response = await baseApi('/shops', { method: 'GET' });
        } catch (error: any) {
          // If backend is outdated and still blocks SUPER_ADMIN, fallback to my-shops
          if (error.message?.includes('Access denied') || error.message?.includes('403')) {
            console.warn('🚨 BACKEND ISSUE: /shops endpoint blocked, falling back to /shops/my-shops');
            console.warn('   This indicates the deployed backend needs role elevation fixes');
            response = await baseApi('/shops/my-shops', { method: 'GET' });
          } else {
            throw error;
          }
        }
      } else {
        response = await baseApi('/shops/my-shops', { method: 'GET' });
      }
      set({ shops: response as Shop[], loading: false });
    } catch (err: any) {
      console.error('Error fetching shops:', err);
      set({ error: err.message || 'Failed to fetch shops', loading: false });
    }
  },

  updateShop: async (id: string, data: Partial<Shop>) => {
    set({ loading: true, error: null });
    try {
      const response = await baseApi(`/shops/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      set((state) => ({
        shops: state.shops.map((shop) =>
          shop.id === id ? { ...shop, ...response } : shop
        ),
        loading: false,
      }));
    } catch (err: any) {
      console.error('Error updating shop:', err);
      set({ error: err.message || 'Failed to update shop', loading: false });
      throw err;
    }
  },
})); 