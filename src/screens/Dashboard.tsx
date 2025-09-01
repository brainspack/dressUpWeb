import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuthStore, { User } from '../store/useAuthStore'
import { ShoppingBag,  Package as PackageIcon,  Users, Store, Scissors } from 'lucide-react'
import { Link } from 'react-router-dom'

// Import reusable UI components
import ReusableCard from "../components/ui/CustomCard";
import Loader from "../components/ui/Loader";
import { useShopStore } from '../store/useShopStore';
import { useTailorStore } from '../store/useTailorStore';
import { useCustomerStore } from '../store/useCustomerStore';
import { useOrderStore } from '../store/useOrderStore';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

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
  const [range, setRange] = useState<'today' | 'last3' | 'last7' | 'last30' | 'last365'>('today')

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

  // Filtered arrays for shop_owner
  const filteredShops = user?.role?.toLowerCase() === 'shop_owner'
    ? shops.filter(s => s.id === user.shopId)
    : shops;
  const filteredTailors = user?.role?.toLowerCase() === 'shop_owner'
    ? tailors.filter(t => t.shopId === user.shopId)
    : tailors;
  const filteredCustomers = user?.role?.toLowerCase() === 'shop_owner'
    ? customers.filter(c => c.shopId === user.shopId)
    : customers;
  const filteredOrders = user?.role?.toLowerCase() === 'shop_owner'
    ? orders.filter(o => o.shopId === user.shopId)
    : orders;

  // For dynamic counts
  const counts: Record<CountKey, number> = {
    shops: filteredShops.length,
    tailors: filteredTailors.length,
    customers: filteredCustomers.length,
    orders: filteredOrders.length,
  };

  // Earnings helpers
  const getOrderTotal = (order: any): number => {
    const costs = Array.isArray(order.costs) ? order.costs : [];
    if (costs.length > 0 && typeof costs[0]?.totalCost === 'number') return costs[0].totalCost;
    const sum = costs.reduce((acc: number, c: any) => acc + (c?.totalCost ?? 0), 0);
    return Number.isFinite(sum) ? sum : 0;
  };

  const filterByRange = useMemo(() => {
    const now = new Date();
    let start = new Date();
    if (range === 'today') start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (range === 'last3') start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2);
    if (range === 'last7') start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    if (range === 'last30') start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
    if (range === 'last365') start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    return { start, now };
  }, [range]);

  const earningsData = useMemo(() => {
    const { start, now } = filterByRange;
    const dataMap: Record<string, number> = {};
    const isYear = range === 'last365';

    const labelForDate = (d: Date) => {
      if (isYear) return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}`;
      return `${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
    };

    // seed labels for consistent x-axis
    const seed = new Date(start);
    while (seed <= now) {
      const label = labelForDate(seed);
      dataMap[label] = 0;
      if (isYear) seed.setMonth(seed.getMonth() + 1);
      else seed.setDate(seed.getDate() + 1);
    }

    filteredOrders.forEach((o) => {
      const dateStr = (o.orderDate || o.createdAt);
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (d < start || d > now) return;
      const label = labelForDate(d);
      dataMap[label] = (dataMap[label] ?? 0) + getOrderTotal(o);
    });

    return Object.entries(dataMap).map(([label, total]) => ({ label, total }));
  }, [filteredOrders, filterByRange, range]);

  const statusPieData = useMemo(() => {
    const statusToCount: Record<string, number> = {};
    filteredOrders.forEach(o => {
      const key = (o.status || 'UNKNOWN').toString();
      statusToCount[key] = (statusToCount[key] ?? 0) + 1;
    });
    return Object.entries(statusToCount).map(([name, value]) => ({ name, value }));
  }, [filteredOrders]);

  const PIE_COLORS = ['#55AC8A', '#F59E0B', '#3B82F6', '#EF4444', '#10B981', '#8B5CF6'];

  // Show loader if any data is loading
  const isLoading = !shops.length && !tailors.length && !customers.length && !orders.length;

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
        {/* Role label and access message */}
        <div className="p-2">
          <span className="inline-block px-2 py-1 rounded-full bg-gray-200 text-gray-700 font-semibold text-xs mb-2">
            Role: {user?.role?.toUpperCase()}
          </span>
          {/* {user?.role?.toUpperCase() === 'SUPER_ADMIN' && (
            <div className="text-green-700 font-bold mb-2">You have full access to all shops, tailors, customers, and orders.</div>
          )}
          {user?.role?.toUpperCase() === 'SHOP_OWNER' && (
            <div className="text-blue-700 font-semibold mb-2">You can only view and manage your own shop, tailors, customers, and orders.</div>
          )} */}
        </div>
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-3 bg-white">
          <div className="w-full  px-4">
            {isLoading ? (
              <Loader message="Loading dashboard..." />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {cardConfigs.map((card) => {
                    const isActive = location.pathname === card.route || location.pathname.startsWith(card.route);
                    return (
                      <Link key={card.title} to={card.route} className="group">
                        <ReusableCard
                          className={`transition-colors duration-200 cursor-pointer k/.k/kk 
                            ${isActive ? 'bg-[#55AC8A] text-white' : 'bg-white'}
                            group-hover:bg-green-100 group-hover:text-[#55AC8A]
                            ${isActive ? '' : 'hover:bg-green-100 hover:text-[#55AC8A]'}
                          `}
                          header={
                            <div className="flex flex-row items-center justify-between pb-2">
                              <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-[#000000] group-hover:text-[#55AC8A]'}`}>{card.title}</span>
                              <card.icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-[#000000] group-hover:text-[#55AC8A]'}`} />
                            </div>
                          }
                          footer={<span className={`text-sm ${isActive ? 'text-white underline' : 'text-[#55AC8A] group-hover:text-[#55AC8A] hover:underline'}`}>View All →</span>}
                        >
                          <div className={`text-2xl font-bold ${isActive ? 'text-white' : 'text-[#000000] group-hover:text-[#55AC8A]'}`}>{counts[card.countKey]}</div>
                          <p className={`text-xs ${isActive ? 'text-white' : 'text-muted-foreground group-hover:text-[#55AC8A]'}`}>{card.desc}</p>
                        </ReusableCard>
                      </Link>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <ReusableCard
                    title={
                      <div className="flex items-center justify-between">
                        <span>Earnings</span>
                        <select
                          className="text-sm border rounded px-2 py-1"
                          value={range}
                          onChange={(e) => setRange(e.target.value as any)}
                        >
                          <option value="today">Today</option>
                          <option value="last3">Last 3 days</option>
                          <option value="last7">Last week</option>
                          <option value="last30">Last month</option>
                          <option value="last365">Last year</option>
                        </select>
                      </div>
                    }
                    className="lg:col-span-2"
                  >
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={earningsData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="label" />
                          <YAxis />
                          <ReTooltip formatter={(v: any) => `₹${v}`} />
                          <Bar dataKey="total" fill="#55AC8A" name="Earnings" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </ReusableCard>

                  <ReusableCard title="Orders by Status">
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie dataKey="value" data={statusPieData} outerRadius={90} label>
                            {statusPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Legend />
                          <ReTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </ReusableCard>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
