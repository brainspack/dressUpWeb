import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Home, ShoppingBag, Store, Users,UserPen, LogOut,Scissors
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore'; // Adjust path if needed
import { Button } from './ui/button';

interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, text: 'Dashboard', link: '/dashboard' },
    { icon: Store, text: 'Shops', link: '/shop' },
    { icon: Users, text: 'Customers', link: '/customer' },
    { icon: Scissors, text: 'Tailors', link: '/tailors' },
    { icon: ShoppingBag, text: 'Orders', link: '/orders' },
    { icon: UserPen, text: 'Users Profile', link: '/userprofile' },
  ];

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
      <div className={`flex items-center ${isCollapsed ? 'justify-center p-6' : 'justify-between p-6'} border-b border-gray-200`}>
        <img
          src={isCollapsed ? '/assets/Group 51.png' : '/assets/final-header-brainspack-logo.svg'}
          alt="brainspack logo"
          className="h-10"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul>
          {navItems.map((item) => {
            const isActive = location.pathname === item.link || 
                           (item.link !== '/dashboard' && location.pathname.startsWith(item.link));
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
      <div className="p-4 border-t border-gray-200 w-full">
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
        <div className="p-4 text-center text-xs text-gray-500 border-t border-gray-200">
          © Brainspack 2025
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
