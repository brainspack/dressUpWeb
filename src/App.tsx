import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import useAuthStore, { User } from './store/useAuthStore'
import PublicRoute from './components/wrappers/PublicRoute'
import PrivateRoute from './components/wrappers/PrivateRoute'
import MainLayout from './components/MainLayout';
import { 
  ROUTES, 
  getPublicRoutes, 
  getPrivateRoutesWithMainLayout, 
  getPrivateRoutesWithoutMainLayout 
} from './constants/routes';

function App() {
  const setUser = useAuthStore((state) => state.setUser)

  // Simulated login handler
  const handleLogin = (phone: string) => {
    setUser({ phone, role: 'admin' })
  }

  return (
    <Routes>
      {/* Public routes */}
      {getPublicRoutes().map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <PublicRoute>
              <route.component {...route.props} onLogin={handleLogin} />
            </PublicRoute>
          }
        />
      ))}

      {/* Private routes with MainLayout */}
      <Route 
        element={
          <PrivateRoute allowedRoles={['SHOP_OWNER', 'admin']}>
            <MainLayout>
              <Outlet />
            </MainLayout>
          </PrivateRoute>
        }
      >
        {getPrivateRoutesWithMainLayout().map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<route.component {...route.props} />}
          />
        ))}
      </Route>

      {/* Private routes without MainLayout */}
      {getPrivateRoutesWithoutMainLayout().map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <PrivateRoute allowedRoles={route.allowedRoles || ['SHOP_OWNER', 'admin']}>
              <route.component {...route.props} />
            </PrivateRoute>
          }
        />
      ))}

      {/* Default redirect */}
      <Route 
        path="*" 
        element={
          <Navigate to={useAuthStore.getState().user ? "/dashboard" : "/login"} />
        } 
      />
    </Routes>
  )
}

export default App


