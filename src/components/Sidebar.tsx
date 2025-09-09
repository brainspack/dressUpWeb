import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Home, ShoppingBag, Store, Users,UserPen, LogOut,Scissors
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore'; // Adjust path if needed
import { Button } from './ui/button';
import { useShopStore } from '../store/useShopStore'; // Add this import

interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  onCreateShopClick?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleCollapse, onCreateShopClick }) => {
  const { logout } = useAuthStore();
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const { shops } = useShopStore(); // Add this inside the component

  let navItems = [
    { icon: Home, text: 'Dashboard', link: '/dashboard' },
    { icon: Store, text: 'Shops', link: '/shop' },
    { icon: Users, text: 'Customers', link: '/customer' },
    { icon: Scissors, text: 'Tailors', link: '/tailors' },
    { icon: ShoppingBag, text: 'Orders', link: '/orders' },
    { icon: UserPen, text: 'Users Profile', link: '/userprofile' },
  ];

  if (user?.role?.toLowerCase() === 'shop_owner') {
    if (shops.length === 0) {
      navItems = [{ icon: Store, text: 'Create Shop', link: '/shop/new' }];
    } else {
      const shopId = shops[0].id;
      navItems = [
        { icon: Store, text: 'My Shop', link: `/shop/shopprofile/${shopId}` },
        { icon: ShoppingBag, text: 'Orders', link: '/orders' },
        { icon: Users, text: 'Customers', link: '/customer' },
        { icon: Scissors, text: 'Tailors', link: '/tailors' },
      ];
    }
  }

  const handleLogout = () => {
    logout();
    navigate('/'); // or navigate('/login') if you have a login page
  };

  return (
    <aside
      className={`bg-white text-gray-800 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20 items-center' : 'w-64'}`}
      style={{ height: '100vh', overflowY: 'auto' }}
    >
      {/* Logo */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center px-6 py-4.5' : 'justify-between px-6 py-4.5'} border-b border-gray-200`}>
        <img
          src={isCollapsed ? '/assets/Group 51.png' : '/assets/final-header-brainspack-logo.svg'}
          alt="brainspack logo"
          className="h-10"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4">
        <ul>
          {navItems.map((item) => {
            const isActive = location.pathname === item.link || 
                           (item.link !== '/dashboard' && location.pathname.startsWith(item.link));
            if (item.text === 'Create Shop' && onCreateShopClick) {
              return (
                <li key={item.text} className="mb-2">
                <div
                  className={`flex items-center p-2 rounded-md transition-colors hover:bg-green-100 ${isCollapsed ? 'justify-center' : 'justify-start'}`}
                  title={isCollapsed ? item.text : ''}
                  onClick={onCreateShopClick}
                >
                  <item.icon
                    className={`text-[#55AC8A] ${isCollapsed ? 'mr-0' : 'mr-3'}`}
                    size={20}
                  />
                  {!isCollapsed && (
                    <span className="text-[#55AC8A] whitespace-nowrap">{item.text}</span>
                  )}
                </div>
              </li>
              
              );
            }
            return (
              <li key={item.text} className="mb-2">
                <Link
                  to={item.link}
                  className={`flex items-center p-2 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-green-100 bg-[#55AC8A] hover:bg-blue-100' 
                      : 'hover:bg-green-100'
                  } ${isCollapsed ? 'justify-center' : 'justify-start'}`}
                  title={isCollapsed ? item.text : ''}
                >
                  <item.icon 
                    className={`${isCollapsed  ? 'mr-0 text-[#55AC8A]' : 'mr-3 text-[#55AC8A]'} ${isActive ? 'text-[#56B299]' : ''}`} 
                    size={20} 
                  />
                  {!isCollapsed && (
                    <span className={` text-[#55AC8A] whitespace-nowrap ${isActive ? 'font-medium' : ''}`}>
                      {item.text}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="px-4 py-4 border-t border-gray-200 w-full">
        <Button
           variant= "mintGreen"
          onClick={handleLogout}
          className={`w-full flex items-center text-sm text-white  ${isCollapsed ? 'justify-center' : 'justify-start gap-2'
            }`}
          title="Logout"
        >
          <LogOut size={20} className="min-w-[20px] min-h-[20px]" />
          {!isCollapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="px-4 py-4 text-center text-xs text-gray-500 border-t border-gray-200">
          © Brainspack 2025
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
