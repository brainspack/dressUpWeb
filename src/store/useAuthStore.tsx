
import { create } from 'zustand'

export type User = { phone: string; role: string; shopId?: string; } | null

interface AuthState {
  user: User
  setUser: (user: User) => void
  logout: () => void
}

const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) return null;
    const parsed = JSON.parse(storedUser);
    // If role is an object, use its name
    if (parsed && typeof parsed.role === 'object' && parsed.role.name) {
      parsed.role = parsed.role.name;
    }
    return parsed;
  })(),
  setUser: (user: User) => {
    console.log(`🏪 AUTH STORE: Setting user data:`, user);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
      console.log(`💾 AUTH STORE: User data saved to localStorage`);
    } else {
      localStorage.removeItem('user')
      console.log(`🗑️ AUTH STORE: User data removed from localStorage`);
    }
    set({ user })
    console.log(`✅ AUTH STORE: User state updated`);
  },
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null });
  },
}))

export default useAuthStore
