import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuthStore, { User } from '../store/useAuthStore'
import { ShoppingBag,  Package as PackageIcon,  Users, Star, Store, Scissors } from 'lucide-react'
import { Link } from 'react-router-dom'

// Import Shadcn UI components
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "../components/ui/card"
import { useShopStore } from '../store/useShopStore';
import { useTailorStore } from '../store/useTailorStore';
import { useCustomerStore } from '../store/useCustomerStore';
import { useOrderStore } from '../store/useOrderStore';

type CountKey = 'shops' | 'tailors' | 'customers' | 'orders';

const cardConfigs: {
  title: string;
  icon: React.ElementType;
  countKey: CountKey;
  route: string;
  desc: string;
}[] = [
  {
    title: 'Shops',
    icon: Store,
    countKey: 'shops',
    route: '/shop',
    desc: 'Total Shops',
  },
  {
    title: 'Tailors',
    icon: Scissors,
    countKey: 'tailors',
    route: '/tailors',
    desc: 'Total Tailors',
  },
  {
    title: 'Customers',
    icon: Users,
    countKey: 'customers',
    route: '/customer',
    desc: 'Total Customers',
  },
  {
    title: 'Orders',
    icon: ShoppingBag,
    countKey: 'orders',
    route: '/orders',
    desc: 'Total Orders',
  },
];

const Dashboard: React.FC = () => {
  const user: User = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const location = useLocation();

  // Fetch data from stores
  const { shops, fetchShops } = useShopStore();
  const { tailors, fetchAllTailors } = useTailorStore();
  const { customers, fetchAllCustomers } = useCustomerStore();
  const { orders, fetchOrders } = useOrderStore();

  useEffect(() => {
    fetchShops();
    fetchAllTailors();
    fetchAllCustomers();
    fetchOrders();
  }, []);

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // For dynamic counts
  const counts: Record<CountKey, number> = {
    shops: shops.length,
    tailors: tailors.length,
    customers: customers.length,
    orders: orders.length,
  };

  return (
    <div
      className="flex flex-1"
      style={{
        backgroundImage: `url('/assets/sidebar-bg.svg')`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'left',
        backgroundColor: '#F2F7FE',
      }}
    >
      {/* Main content flex-grow with own scroll */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <div className="w-full  px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {cardConfigs.map((card) => {
                const isActive = location.pathname === card.route || location.pathname.startsWith(card.route);
                return (
                  <Link key={card.title} to={card.route} className="group">
                    <Card
                      className={`transition-colors duration-200 cursor-pointer k/.k/kk 
                        ${isActive ? 'bg-[#55AC8A] text-white' : 'bg-white'}
                        group-hover:bg-green-100 group-hover:text-[#55AC8A]
                        ${isActive ? '' : 'hover:bg-green-100 hover:text-[#55AC8A]'}
                      `}
                      style={{
                        boxShadow: '0 4px 8px rgba(85, 172, 138, 0.5)', // <-- Mint green shadow
                      }}
                    >
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className={`text-sm font-medium ${isActive ? 'text-white' : 'text-[#000000] group-hover:text-[#55AC8A]'}`}>{card.title}</CardTitle>
                        <card.icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-[#000000] group-hover:text-[#55AC8A]'}`} />
                      </CardHeader>
                      <CardContent>
                        <div className={`text-2xl font-bold ${isActive ? 'text-white' : 'text-[#000000] group-hover:text-[#55AC8A]'}`}>{counts[card.countKey]}</div>
                        <p className={`text-xs ${isActive ? 'text-white' : 'text-muted-foreground group-hover:text-[#55AC8A]'}`}>{card.desc}</p>
                      </CardContent>
                      <CardFooter>
                        <span className={`text-sm ${isActive ? 'text-white underline' : 'text-[#55AC8A] group-hover:text-[#55AC8A] hover:underline'}`}>View All →</span>
                      </CardFooter>
                    </Card>
                  </Link>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">Sales Chart Placeholder</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3"><Star size={20} /></div>
                      <div>
                        <p className="font-semibold text-sm">Twitter Subscription</p>
                        <p className="text-xs text-gray-500">$159.69</p>
                      </div>
                    </div>
                    <span className="text-green-500 text-sm font-semibold">+</span>
                  </div>
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3"><Star size={20} /></div>
                      <div>
                        <p className="font-semibold text-sm">Xbox Purchased</p>
                        <p className="text-xs text-gray-500">$36.38</p>
                      </div>
                    </div>
                    <span className="text-red-500 text-sm font-semibold">-</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-3"><Star size={20} /></div>
                      <div>
                        <p className="font-semibold text-sm">Youtube Subscription</p>
                        <p className="text-xs text-gray-500">$23.85</p>
                      </div>
                    </div>
                    <span className="text-green-500 text-sm font-semibold">+</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-blue-500 text-white flex flex-col items-center justify-end" style={{ height: '300px' }}>
              <CardHeader className="self-start">
                <CardTitle className="text-white">Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full max-w-xs flex flex-col items-center">
                  <div className="w-1/2 h-6 bg-red-500 mb-1"></div>
                  <div className="w-2/3 h-6 bg-pink-500 mb-1"></div>
                  <div className="w-full h-6 bg-yellow-500 mb-1"></div>
                  <div className="w-2/3 h-6 bg-green-500 mb-1"></div>
                  <div className="w-1/2 h-6 bg-teal-500 mb-1"></div>
                  <div className="w-1/3 h-6 bg-cyan-500 mb-1"></div>
                  <div className="w-full h-6 bg-blue-400 mb-1"></div>
                  <div className="w-2/3 h-6 bg-indigo-500 mb-1"></div>
                  <div className="w-1/2 h-6 bg-purple-500"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
