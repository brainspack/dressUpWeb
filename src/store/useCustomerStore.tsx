import { create } from 'zustand';
import { baseApi } from '../api/baseApi';

export interface Customer {
  id: string;
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
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  customers: [],
  loading: false,
  error: null,

  fetchCustomers: async (shopId) => {
    set({ loading: true, error: null });
    try {
      // Assuming your API has an endpoint to fetch customers by shopId
      // If /customers/my-customers fetches all customers for the logged-in user's shops, that's fine.
      // Otherwise, you might need a /customers?shopId=xyz endpoint on the backend.
      const response = await baseApi(`/customers/my-customers`, { method: 'GET' });
      // Filter customers by shopId on the frontend if the backend endpoint doesn't already do so for a specific shop
      const filteredCustomers = (response as Customer[]).filter(customer => customer.shopId === shopId);
      set({ customers: filteredCustomers, loading: false });
    } catch (err: any) {
      console.error('Error fetching customers:', err);
      set({ error: err.message || 'Failed to fetch customers', loading: false });
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