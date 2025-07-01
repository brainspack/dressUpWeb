import { create } from 'zustand';
import { baseApi } from '../api/baseApi'; // Assuming baseApi is needed to fetch data in the store
import useAuthStore from './useAuthStore'; // Import at the top

export interface MeasurementItem {
  height?: number | null;
  chest?: number | null;
  waist?: number | null;
  hip?: number | null;
  shoulder?: number | null;
  sleeveLength?: number | null;
  inseam?: number | null;
  neck?: number | null;
}

export interface ClothingItem {
  type: string;
  color?: string;
  fabric?: string;
  designNotes?: string;
  imageUrls?: string[];
  videoUrls?: string[];
  measurements?: MeasurementItem[]; // Nested measurements
}

export interface CostItem {
  totalCost: number;
  materialCost?: number;
  laborCost?: number;
  // Add other cost item properties if needed
}

export interface CustomerInfo {
  id: string;
  name: string;
  deletedAt: string | null; // Add deletedAt to track customer deletion status
}

export interface Order {
  id: string;
  status: 'NEW' | 'PENDING' | 'DELIVERED' | 'CANCELLED'; // Assuming these statuses based on the UI metrics
  createdAt: string; // Assuming order creation timestamp
  deletedAt: string | null; // Add deletedAt to track order deletion status
  clothes: ClothingItem[];
  costs: CostItem[];
  customer: CustomerInfo; // Assuming customer details are included
  shopId: string; // Add shopId
  tailorName?: string; // Add tailorName
  tailorNumber?: string; // Add tailorNumber
  tailorId?: string; // Add tailorId
  measurements?: MeasurementItem[]; // Add top-level measurements
  // Add other fields from your actual API response as needed
  paymentMethod?: string; // Assuming a payment method might be included or derived
  priority?: 'High' | 'Medium' | 'Low'; // Assuming priority might be included
  category?: string; // Assuming category might be included or derived
  productName?: string; // Assuming a field for product name if not derived from clothes
  orderDate?: string; // Assuming a field for order date if not using createdAt directly
  deliveryDate?: string; // Assuming a field for delivery date
}

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  addOrder: (data: Partial<Order>) => Promise<Order>;
  updateOrder: (id: string, data: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  loading: false,
  error: null,

  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const response = await baseApi('/orders', { method: 'GET' });
      const user = useAuthStore.getState().user;
      let orders = response as Order[];
      if (user?.role?.toLowerCase() === 'shop_owner' && user.shopId) {
        orders = orders.filter(order => !order.deletedAt && order.shopId === user.shopId && (!order.customer?.deletedAt));
      } else {
        // SUPER_ADMIN: only filter out soft-deleted orders, not by customer
        orders = orders.filter(order => !order.deletedAt);
      }
      set({ orders, loading: false });
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      set({ error: err.message || 'Failed to fetch orders', loading: false });
    }
  },

  addOrder: async (data: Partial<Order>) => {
    set({ loading: true, error: null });
    try {
      const response = await baseApi('/orders', {
        method: 'POST',
        data: data,
      });
      set((state) => ({
        orders: [...state.orders, response as Order], // Assuming response is the created order
        loading: false,
      }));
      return response as Order;
    } catch (err: any) {
      console.error('Error adding order:', err);
      set({ error: err.message || 'Failed to add order', loading: false });
      throw err;
    }
  },

  updateOrder: async (id: string, data: Partial<Order>) => {
    set({ loading: true, error: null });
    try {
      const response = await baseApi(`/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === id ? { ...order, ...response } : order
        ),
        loading: false,
      }));
    } catch (err: any) {
      console.error('Error updating order:', err);
      set({ error: err.message || 'Failed to update order', loading: false });
      throw err;
    }
  },

  deleteOrder: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await baseApi(`/orders/${id}`, {
        method: 'DELETE',
      });
      set((state) => ({
        orders: state.orders.filter((order) => order.id !== id),
        loading: false,
      }));
    } catch (err: any) {
      console.error('Error deleting order:', err);
      set({ error: err.message || 'Failed to delete order', loading: false });
      throw err;
    }
  },
})); 