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
    return storedUser ? JSON.parse(storedUser) : null
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
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken') // optional, in case you store token
    set({ user: null })
  },
}))

export default useAuthStore
