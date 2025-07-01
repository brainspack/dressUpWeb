import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Breadcrumb from './Breadcrumb';
import useAuthStore from '../store/useAuthStore';
import { useShopStore } from '../store/useShopStore';
import NewShopForm from '../screens/shop/modules/NewShopForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useShopFormStore } from '../store/useShopFormStore';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAddShopModalOpen, setIsAddShopModalOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  const { fetchShops } = useShopStore();
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);

  const resetForm = useShopFormStore((state) => state.resetForm);

  const handleOpenAddShopModal = () => {
    resetForm();
    setIsAddShopModalOpen(true);
  };

  return (
    <div className="flex w-screen h-screen bg-[#F2F7FE] overflow-hidden">
      <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'} h-full`}>
        <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} onCreateShopClick={handleOpenAddShopModal} />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header always full width */}
        <Header onToggleSidebar={toggleSidebar} />
        {/* Breadcrumb navigation */}
        <div className="px-4 pt-2"><Breadcrumb /></div>
        {/* Main content centered and constrained */}
        <div className="flex-1 w-full overflow-auto ">
          {children}
        </div>
      </div>
      {/* Shop Create Modal */}
      <Dialog open={isAddShopModalOpen} onOpenChange={setIsAddShopModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white p-6 rounded-lg z-[1000]">
          <DialogHeader>
            <DialogTitle>Create New Shop</DialogTitle>
          </DialogHeader>
          <NewShopForm
            onFormSubmitSuccess={async () => {
              await fetchShops();
              const shops = useShopStore.getState().shops;
              if (shops.length > 0) {
                setUser({
                  phone: user?.phone || '',
                  role: user?.role || '',
                  shopId: shops[0].id,
                });
              }
              setIsAddShopModalOpen(false);
            }}
            editMode={false}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MainLayout;