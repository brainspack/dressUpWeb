import { Navigate } from 'react-router-dom'
import useAuthStore, { User } from '../../store/useAuthStore'
import { PropsWithChildren } from 'react'

interface PrivateRouteProps extends PropsWithChildren {
  allowedRoles: string[]
}

const PrivateRoute = ({ allowedRoles, children }: PrivateRouteProps) => {
  const user = useAuthStore((state) => state.user)
  return user && allowedRoles.includes(user.role) ? children : <Navigate to="/login" />
}

export default PrivateRoute
