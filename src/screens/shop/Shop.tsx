import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog';

import NewShopForm from './modules/NewShopForm';
import NewCustomerForm from '../customer/modules/NewCustomerForm'; // 👈 Import the form
import { baseApi } from '../../api/baseApi';
import NewTailorForm from './modules/NewTailorForm'; // Import the new tailor form
import { useOrderStore } from '../../store/useOrderStore'; // Import useOrderStore
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal';

interface ShopData {
  id: string;
  name: string;
  phone: string;
  address: string;
  isActive: boolean;
  createdAt?: string; // Add createdAt field to the interface
}

const Shop: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAddShopModalOpen, setIsAddShopModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false); // 👈 New modal state
  const navigate = useNavigate();
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null); // State to store selected shop ID
  const [isAddTailorModalOpen, setIsAddTailorModalOpen] = useState(false); // New modal state for Add Tailor
  const [shopToEdit, setShopToEdit] = useState<ShopData | null>(null);

  const [shops, setShops] = useState<ShopData[]>([]);
  const [loadingShops, setLoadingShops] = useState(true);
  const [errorFetchingShops, setErrorFetchingShops] = useState<string | null>(null);

  const { fetchOrders } = useOrderStore(); // Access fetchOrders from the order store

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [shopToDelete, setShopToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const fetchShops = async () => {
    setLoadingShops(true);
    setErrorFetchingShops(null);
    try {
      const response = await baseApi('/shops/my-shops', {
        method: 'GET',
      });
      // Sort shops by createdAt timestamp in descending order (newest first)
      const sortedShops = (response as ShopData[]).sort((a, b) => {
        // Convert createdAt strings to timestamps and compare
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA; // Descending order (newest first)
      });
      setShops(sortedShops);
    } catch (error: any) {
      console.error('Error fetching shops:', error);
      setErrorFetchingShops(error.message || 'Failed to fetch shops');
    } finally {
      setLoadingShops(false);
    }
  };

  const handleDeleteShop = async (shopId: string) => {
    setShopToDelete(shopId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!shopToDelete) return;
    
    setIsDeleting(true);
    try {
      await baseApi(`/shops/${shopToDelete}`, { method: 'DELETE' });
      console.log(`Shop with ID ${shopToDelete} soft-deleted.`);
      await fetchShops(); // Refresh the shops list after successful deletion
      await fetchOrders(); // Refresh the orders list to reflect cascading deletes
    } catch (error: any) {
      console.error('Error soft-deleting shop:', error);
      alert(`Failed to delete shop: ${error.message || 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setShopToDelete(null);
    }
  };

  const handleEditShop = (shop: ShopData) => {
    setShopToEdit(shop);
    setIsAddShopModalOpen(true);
  };

  const handleCloseShopModal = () => {
    setIsAddShopModalOpen(false);
    setShopToEdit(null); // Reset shopToEdit when modal is closed
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const shopMetrics = [
    { title: 'Total Shops', value: '150', description: '20 new this month', color: 'bg-blue-500' },
    { title: 'Active Shops', value: '120', description: '10 activated this week', color: 'bg-green-500' },
    { title: 'Tailor', value: '20', description: '30 higher than last month.', color: 'bg-orange-500' },
    { title: 'Customers', value: '250', description: '20 higher than last month.', color: 'bg-lime-600' },
  ];

  return (
    <div
      className="flex h-screen w-screen"
      style={{
        backgroundImage: `url('/assets/sidebar-bg.svg')`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'left',
        backgroundColor: '#F2F7FE',
      }}
    >
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title="Shops" onToggleSidebar={toggleSidebar} />

        <div className="flex-1 p-6 overflow-y-auto bg-white">
          {/* Metrics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="w-full h-auto flex justify-center items-center">
              <img src="/assets/login2.svg" alt="Illustration" className="max-w-full h-auto" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {shopMetrics.map((metric, index) => (
                <Card key={index} className={`text-white ${metric.color}`}>
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">{metric.value}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{metric.title}</p>
                    <p className="text-xs opacity-90">{metric.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Table + Search */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-end mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search shops..."
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  onClick={() => setIsAddShopModalOpen(true)}
                  className="px-4 py-2 text-sm"
                >
                  Add Shop
                </Button>
              </div>
            </div>

            {loadingShops && <p>Loading shops...</p>}
            {errorFetchingShops && <p className="text-red-500">Error: {errorFetchingShops}</p>}

            {!loadingShops && !errorFetchingShops && shops.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone No.</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shops.map((shop) => (
                    <TableRow key={shop.id}>
                      <TableCell className="font-medium">{shop.name}</TableCell>
                      <TableCell>{shop.phone}</TableCell>
                      <TableCell>{shop.address}</TableCell>
                      <TableCell>{shop.isActive ? 'Active' : 'Inactive'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            className="text-xs"
                            onClick={() => {
                              console.log('Add Customer to', shop.name);
                              setSelectedShopId(shop.id);
                              setIsCustomerModalOpen(true);
                            }}
                          >
                            Add Customer
                          </Button>
                          <Button
                            className="text-xs"
                            onClick={() => {
                              console.log('Add Tailor to', shop.name);
                              setSelectedShopId(shop.id);
                              setIsAddTailorModalOpen(true);
                            }}
                          >
                            Add Tailor
                          </Button>
                          <Button
                            className="text-xs"
                            onClick={() => {
                              console.log('View Profile of', shop.name);
                              navigate(`/shop/shopprofile/${shop.id}`);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="blueGradient" size="sm" onClick={() => handleEditShop(shop)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="blueGradient" size="sm" onClick={() => handleDeleteShop(shop.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {!loadingShops && !errorFetchingShops && shops.length === 0 && (
              <p>No shops found.</p>
            )}
          </div>
        </div>
      </main>

      {/* Add/Edit Shop Modal */}
      <Dialog open={isAddShopModalOpen} onOpenChange={handleCloseShopModal}>
        <DialogContent className="sm:max-w-[500px] bg-white p-6 rounded-lg z-[1000]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {shopToEdit ? 'Edit Shop' : 'Create New Shop'}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {shopToEdit ? 'Update the shop details below.' : 'Fill in the details for the new shop.'}
            </DialogDescription>
          </DialogHeader>

          <NewShopForm
            onFormSubmitSuccess={() => {
              console.log('✅ Shop form submitted successfully');
              handleCloseShopModal();
              fetchShops();
            }}
            editMode={!!shopToEdit}
            shopToEdit={shopToEdit || undefined}
          />
        </DialogContent>
      </Dialog>

      {/* Add Customer Modal */}
      <Dialog open={isCustomerModalOpen} onOpenChange={(open) => { 
        if (!open) {
          setIsCustomerModalOpen(false);
          setSelectedShopId(null);
        }
      }}>
        <DialogContent className="sm:max-w-[500px] bg-white p-6 rounded-lg z-[1000]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Create New Customer</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Enter details to add a new customer.
            </DialogDescription>
          </DialogHeader>

          <NewCustomerForm
            onFormSubmitSuccess={() => {
              console.log('✅ Customer created successfully');
              setIsCustomerModalOpen(false);
              setSelectedShopId(null);
            }}
            shopId={selectedShopId}
            onCancel={() => {
              setIsCustomerModalOpen(false);
              setSelectedShopId(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Add Tailor Modal */}
      <Dialog open={isAddTailorModalOpen} onOpenChange={(open) => { 
        if (!open) {
          setIsAddTailorModalOpen(false);
          setSelectedShopId(null);
        }
      }}>
        <DialogContent className="sm:max-w-[500px] bg-white p-6 rounded-lg z-[1000]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Add New Tailor</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Enter details for the new tailor.
            </DialogDescription>
          </DialogHeader>

          <NewTailorForm
            onFormSubmitSuccess={() => {
              console.log('✅ Tailor created successfully');
              setIsAddTailorModalOpen(false);
              setSelectedShopId(null);
            }}
            shopId={selectedShopId}
            onCancel={() => {
              setIsAddTailorModalOpen(false);
              setSelectedShopId(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Add the DeleteConfirmationModal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setShopToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Shop"
        description="Are you sure you want to delete this shop? This will also delete all associated customers and their orders. This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Shop;
