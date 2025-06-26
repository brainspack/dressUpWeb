import React from 'react';
import { Menu, Search, ShoppingBag, FileText, Bell } from 'lucide-react';
import { Input } from "./ui/input";
import useAuthStore, { User } from '../store/useAuthStore';

interface HeaderProps {
  title?: string;
  onToggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onToggleSidebar }) => {
  const user: User = useAuthStore((state) => state.user);

  return (
    <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      <div className="flex items-center">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="bg-transparent text-black p-2 rounded-md mr-4 md:block"
            style={{
              backgroundColor: 'transparent',
              outline: 'none',
              boxShadow: 'none',
              border: 'none',
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <Menu size={24} className="text-black" />
          </button>
        )}

        {title && <h1 className="text-xl font-semibold">{title}</h1>}
      </div>

      <div className="flex items-center">
        {/* Search Bar */}
        <div className="relative mr-4">
          <Search
            className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <Input
            type="text"
            placeholder="Search"
            className="pl-10 pr-3 py-1"
          />
        </div>

        {/* Icons with Badges */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <ShoppingBag
              className="text-gray-600 cursor-pointer"
              size={20}
            />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full ring-2 ring-white bg-red-500 text-[8px] text-white flex items-center justify-center">
              3
            </span>
          </div>
          <div className="relative">
            <FileText
              className="text-gray-600 cursor-pointer"
              size={20}
            />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full ring-2 ring-white bg-red-500 text-[8px] text-white flex items-center justify-center">
              6
            </span>
          </div>
          <div className="relative">
            <Bell className="text-gray-600 cursor-pointer" size={20} />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full ring-2 ring-white bg-red-500 text-[8px] text-white flex items-center justify-center">
              9
            </span>
          </div>
        </div>

        {/* User Profile */}
        <div className="flex items-center ml-6">
          <span className="mr-2 text-sm font-medium">
            {user?.role ? user.role : 'User'}
          </span>
          <span className="mr-2 text-xs text-gray-500">
            {user?.mobileNumber ? user.mobileNumber : ''}
          </span>
          <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-semibold">
            {user?.mobileNumber ? (user.mobileNumber.slice(0, 2).toUpperCase() || 'SE') : 'SE'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 