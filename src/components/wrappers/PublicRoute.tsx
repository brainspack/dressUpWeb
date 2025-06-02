import { Navigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'
import { PropsWithChildren } from 'react'

const PublicRoute = ({ children }: PropsWithChildren) => {
  const user = useAuthStore((state) => state.user)
  return !user ? children : <Navigate to="/dashboard" />
}

export default PublicRoute
