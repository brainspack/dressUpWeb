// export type User = { phone: string; role: string } | null
// import { create } from 'zustand'

// interface AuthState {
//   user: User
//   setUser: (user: User) => void
//   logout: () => void
// }

// const useAuthStore = create<AuthState>((set) => ({
//     user: null,
//     setUser: (user: User) => set({ user }),
//     logout: (): void => set({ user: null }),
// }))

// export default useAuthStore



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
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
    set({ user })
  },
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null });
  },
}))

export default useAuthStore
