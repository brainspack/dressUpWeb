import { create } from 'zustand';
import { baseApi } from '../api/baseApi';

interface Shop {
  id: string;
  serialNumber: number;
  name: string;
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
      const response = await baseApi('/shops/my-shops', { method: 'GET' });
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