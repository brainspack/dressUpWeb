import Login from '../screens/auth/Login';
import Dashboard from '../screens/Dashboard';
import Customer from '../screens/customer/Customer';
import NewCustomerForm from '../screens/customer/modules/NewCustomerForm';
import CustomerProfile from '../screens/customer/CustomerProfile';
import Shop from '../screens/shop/Shop';
import NewShopForm from '../screens/shop/modules/NewShopForm';
import ShopProfile from '../screens/shop/ShopProfile';
import TailorProfile from '../screens/shop/modules/TailorProfile';
import Orders from '../screens/orders/Orders';
import UserProfile from '../screens/user/UserProfile';
import NewOrderForm from '../screens/orders/modules/NewOrderForm';
import TailorList from '../screens/shop/modules/TailorList';

export interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  routeType: 'public' | 'private';
  allowedRoles?: string[];
  useMainLayout?: boolean;
  props?: Record<string, any>;
}

export const ROUTES: RouteConfig[] = [
  // Public routes
  {
    path: '/login',
    component: Login,
    routeType: 'public',
  },

  // Private routes with MainLayout
  {
    path: '/dashboard',
    component: Dashboard,
    routeType: 'private',
    allowedRoles: ['SHOP_OWNER', 'admin'],
    useMainLayout: true,
  },
  {
    path: '/customer',
    component: Customer,
    routeType: 'private',
    allowedRoles: ['SHOP_OWNER', 'admin'],
    useMainLayout: true,
  },
  {
    path: '/customer/profile/:id',
    component: CustomerProfile,
    routeType: 'private',
    allowedRoles: ['SHOP_OWNER', 'admin'],
    useMainLayout: true,
  },
  {
    path: '/shop',
    component: Shop,
    routeType: 'private',
    allowedRoles: ['SHOP_OWNER', 'admin'],
    useMainLayout: true,
  },
  {
    path: '/shop/shopprofile/:id',
    component: ShopProfile,
    routeType: 'private',
    allowedRoles: ['SHOP_OWNER', 'admin'],
    useMainLayout: true,
  },
  {
    path: '/orders',
    component: Orders,
    routeType: 'private',
    allowedRoles: ['SHOP_OWNER', 'admin'],
    useMainLayout: true,
  },
  {
    path: '/orders/new-order',
    component: NewOrderForm,
    routeType: 'private',
    allowedRoles: ['SHOP_OWNER', 'admin'],
    useMainLayout: true,
  },
  {
    path: '/orders/edit/:id',
    component: NewOrderForm,
    routeType: 'private',
    allowedRoles: ['SHOP_OWNER', 'admin'],
    useMainLayout: true,
  },
  {
    path: '/userprofile',
    component: UserProfile,
    routeType: 'private',
    allowedRoles: ['SHOP_OWNER', 'admin'],
    useMainLayout: true,
  },

  // Private routes without MainLayout
  {
    path: '/customer/new',
    component: NewCustomerForm,
    routeType: 'private',
    allowedRoles: ['SHOP_OWNER', 'admin'],
    useMainLayout: false,
  },
  {
    path: '/shop/new',
    component: NewShopForm,
    routeType: 'private',
    allowedRoles: ['SHOP_OWNER', 'admin'],
    useMainLayout: false,
  },
  {
    path: '/shop/shopprofile',
    component: ShopProfile,
    routeType: 'private',
    allowedRoles: ['SHOP_OWNER', 'admin'],
    useMainLayout: false,
  },
  {
    path: '/tailor/profile/:id',
    component: TailorProfile,
    routeType: 'private',
    allowedRoles: ['SHOP_OWNER', 'admin'],
    useMainLayout: false,
  },
  {
    path: '/tailors',
    component: TailorList,
    routeType: 'private',
    allowedRoles: ['SHOP_OWNER', 'admin'],
    useMainLayout: false,
  },
];

// Helper functions to filter routes
export const getPublicRoutes = () => ROUTES.filter(route => route.routeType === 'public');
export const getPrivateRoutesWithMainLayout = () => ROUTES.filter(route => route.routeType === 'private' && route.useMainLayout);
export const getPrivateRoutesWithoutMainLayout = () => ROUTES.filter(route => route.routeType === 'private' && !route.useMainLayout);

// Route keys for easy reference
export const ROUTE_KEYS = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  CUSTOMER: '/customer',
  CUSTOMER_NEW: '/customer/new',
  CUSTOMER_PROFILE: '/customer/profile/:id',
  SHOP: '/shop',
  SHOP_NEW: '/shop/new',
  SHOP_PROFILE: '/shop/shopprofile',
  SHOP_PROFILE_ID: '/shop/shopprofile/:id',
  ORDERS: '/orders',
  ORDERS_NEW: '/orders/new-order',
  ORDERS_EDIT: '/orders/edit/:id',
  USER_PROFILE: '/userprofile',
  TAILOR_PROFILE: '/tailor/profile/:id',
} as const; 