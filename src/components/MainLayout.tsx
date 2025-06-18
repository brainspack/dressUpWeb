import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  return (
    <div className="flex w-screen h-screen bg-[#F2F7FE] overflow-hidden">
      <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'} h-full`}>
        <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header always full width */}
        <Header onToggleSidebar={toggleSidebar} />
        {/* Main content centered and constrained */}
        <div className="flex-1 w-full overflow-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;