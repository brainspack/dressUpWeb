import { Navigate } from 'react-router-dom'
import useAuthStore, { User } from '../../store/useAuthStore'
import { PropsWithChildren } from 'react'
import { getEffectiveRole } from '../../utils/roleUtils'

interface PrivateRouteProps extends PropsWithChildren {
  allowedRoles: string[]
}

const PrivateRoute = ({ allowedRoles, children }: PrivateRouteProps) => {
  const user = useAuthStore((state) => state.user)
  
  const effectiveRole = getEffectiveRole(user);
  
  console.log(`🔐 PRIVATE ROUTE: User phone: ${user?.phone}, Role: ${user?.role}, Effective role: ${effectiveRole}, Allowed: [${allowedRoles.join(', ')}]`);
  
  return user && allowedRoles.includes(effectiveRole) ? children : <Navigate to="/login" />
}

export default PrivateRoute
