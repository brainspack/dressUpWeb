import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore, { User } from './store/useAuthStore'
import PublicRoute from './components/wrappers/PublicRoute'
import PrivateRoute from './components/wrappers/PrivateRoute'
import Login from './screens/auth/Login'
import Dashboard from './screens/Dashboard'
import Customer from './screens/customer/Customer'
import NewCustomerForm from './screens/customer/modules/NewCustomerForm';
import CustomerProfile from './screens/customer/CustomerProfile';
import Shop from "./screens/shop/Shop"
import NewShopForm from  "./screens/shop/modules/NewShopForm"
import ShopProfile from './screens/shop/ShopProfile'
import TailorProfile from './screens/shop/modules/TailorProfile';
import Orders from './screens/orders/Orders'
import UserProfile from './screens/user/UserProfile'
import NewOrderForm from './screens/orders/modules/NewOrderForm'; // adjust the path if needed


function App() {
  const setUser = useAuthStore((state) => state.setUser)

  // Simulated login handler
  const handleLogin = (phone: string) => {
    setUser({ phone, role: 'admin' })

  }

  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login onLogin={handleLogin} /></PublicRoute>} />
      <Route path="/dashboard" element={<PrivateRoute allowedRoles={['SHOP_OWNER', 'admin']}><Dashboard /></PrivateRoute>} />
      <Route path="/customer" element={<PrivateRoute allowedRoles={['SHOP_OWNER', 'admin']}><Customer /></PrivateRoute>} />
      <Route
        path="/customer/new"
        element={
          <PrivateRoute allowedRoles={['SHOP_OWNER', 'admin']}>
            <NewCustomerForm />
          </PrivateRoute>
        }
      />
       <Route path="/shop" element={<PrivateRoute allowedRoles={['SHOP_OWNER', 'admin']}><Shop /></PrivateRoute>} />
       <Route
        path="/shop/new"
        element={
          <PrivateRoute allowedRoles={['SHOP_OWNER', 'admin']}>
            <NewShopForm />
          </PrivateRoute>
        }
      />
       <Route
        path="/shop/shopprofile"
        element={
          <PrivateRoute allowedRoles={['SHOP_OWNER', 'admin']}>
            <ShopProfile />
          </PrivateRoute>
        }
      />
       <Route
        path="/shop/shopprofile/:id"
        element={
          <PrivateRoute allowedRoles={['SHOP_OWNER', 'admin']}>
            <ShopProfile />
          </PrivateRoute>
        }
      />
      <Route
        path="/orders/new-order"
        element={
          <PrivateRoute allowedRoles={['SHOP_OWNER', 'admin']}>
            <NewOrderForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/orders/edit/:id"
        element={
          <PrivateRoute allowedRoles={['SHOP_OWNER', 'admin']}>
            <NewOrderForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/customer/profile/:id"
        element={
          <PrivateRoute allowedRoles={['SHOP_OWNER', 'admin']}>
            <CustomerProfile />
          </PrivateRoute>
        }
      />
      <Route
        path="/tailor/profile/:id"
        element={
          <PrivateRoute allowedRoles={['SHOP_OWNER', 'admin']}>
            <TailorProfile />
          </PrivateRoute>
        }
      />
      <Route path="/orders" element={<PrivateRoute allowedRoles={['SHOP_OWNER', 'admin']}><Orders /></PrivateRoute>} />
      <Route path="/userprofile" element={<PublicRoute><UserProfile /></PublicRoute>} />
      <Route path="*" element={<Navigate to={useAuthStore.getState().user ? "/dashboard" : "/login"} />} />
    </Routes>
  )
}

export default App


