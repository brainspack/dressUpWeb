import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import useAuthStore from './store/useAuthStore'
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
  return (
    <Routes>
      {/* Public routes */}
      {getPublicRoutes().map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <PublicRoute>
              <route.component {...route.props} />
            </PublicRoute>
          }
        />
      ))}

      {/* Private routes with MainLayout */}
      <Route 
        element={
          <PrivateRoute allowedRoles={['SHOP_OWNER', 'SUPER_ADMIN', 'admin']}>
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
            <PrivateRoute allowedRoles={['SHOP_OWNER', 'SUPER_ADMIN', 'admin']}>
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


