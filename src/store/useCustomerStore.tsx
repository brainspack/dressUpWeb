import { create } from 'zustand';
import { baseApi } from '../api/baseApi';

export interface Customer {
  id: string;
  serialNumber: number;
  name: string;
  mobileNumber: string;
  address: string;
  shopId: string;
}

interface CustomerState {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  fetchCustomers: (shopId: string) => Promise<void>;
  fetchAllCustomers: () => Promise<void>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  customers: [],
  loading: false,
  error: null,

  fetchCustomers: async (shopId) => {
    set({ loading: true, error: null });
    try {
      const response = await baseApi(`/customers/my-customers`, { method: 'GET' });
      set({ customers: response as Customer[], loading: false });
    } catch (err: any) {
      console.error('Error fetching customers:', err);
      set({ error: err.message || 'Failed to fetch customers', loading: false });
    }
  },

  fetchAllCustomers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await baseApi(`/customers`, { method: 'GET' });
      set({ customers: response as Customer[], loading: false });
    } catch (err: any) {
      console.error('Error fetching all customers:', err);
      set({ error: err.message || 'Failed to fetch all customers', loading: false });
    }
  },

  updateCustomer: async (id: string, data: Partial<Customer>) => {
    set({ loading: true, error: null });
    try {
      const response = await baseApi(`/customers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      set((state) => ({
        customers: state.customers.map((customer) =>
          customer.id === id ? { ...customer, ...response } : customer
        ),
        loading: false,
      }));
    } catch (err: any) {
      console.error('Error updating customer:', err);
      set({ error: err.message || 'Failed to update customer', loading: false });
      throw err;
    }
  },
})); 