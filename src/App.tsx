import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore, { User } from './store/useAuthStore'
import PublicRoute from './components/wrappers/PublicRoute'
import PrivateRoute from './components/wrappers/PrivateRoute'
import Login from './screens/auth/Login'
import Dashboard from './screens/Dashboard'

function App() {
  const setUser = useAuthStore((state) => state.setUser)

  // Simulated login handler
  const handleLogin = (phone: string) => {
    setUser({ phone, role: 'admin' })
  }

  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login onLogin={handleLogin} /></PublicRoute>} />
      <Route path="/dashboard" element={<PublicRoute 
      // allowedRoles={['admin']}
      ><Dashboard /></PublicRoute>} />
      <Route path="*" element={<Navigate to={useAuthStore.getState().user ? "/dashboard" : "/login"} />} />
    </Routes>
  )
}

export default App
