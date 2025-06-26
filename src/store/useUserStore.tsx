// This file is not needed for logged-in user info. Use useAuthStore for current user.
import { create } from 'zustand';
import { baseApi } from '../api/baseApi';

interface User {
  id: string;
  name?: string;
  mobileNumber: string;
  role: string;
  language: string;
  createdAt: string;
}

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await baseApi('/users', {
        method: 'GET',
      });
      set({ users: response as User[], loading: false });
    } catch (err: any) {
      console.error('Error fetching users:', err);
      set({ error: err.message || 'Failed to fetch users', loading: false });
    }
  },
})); 