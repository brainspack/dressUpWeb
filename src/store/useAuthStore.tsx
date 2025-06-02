export type User = { phone: string; role: string } | null
import { create } from 'zustand'

interface AuthState {
  user: User
  setUser: (user: User) => void
  logout: () => void
}

const useAuthStore = create<AuthState>((set) => ({
    user: null,
    setUser: (user: User) => set({ user }),
    logout: (): void => set({ user: null }),
}))

export default useAuthStore
