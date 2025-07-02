import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Eye, Edit, Trash2, ShoppingBag, UserPlus, X } from 'lucide-react';
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
import Tooltip from '../../components/ui/tooltip';
import ReusableCard from '../../components/ui/CustomCard';
import Loader from '../../components/ui/Loader';
import ReusableTable from '../../components/ui/CustomTable';
import ReusableDialog from '../../components/ui/CustomDialog';
import { useShopStore } from '../../store/useShopStore';
import type { Shop } from '../../store/useShopStore';
import useAuthStore from '../../store/useAuthStore';
import { useCustomerStore } from '../../store/useCustomerStore';
import { useTailorStore } from '../../store/useTailorStore';

const Shop: React.FC = () => {
  const [isAddShopModalOpen, setIsAddShopModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false); // 👈 New modal state
  const navigate = useNavigate();
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null); // State to store selected shop ID
  const [isAddTailorModalOpen, setIsAddTailorModalOpen] = useState(false); // New modal state for Add Tailor
  const [shopToEdit, setShopToEdit] = useState<Shop | null>(null);

  const { shops, loading, error, fetchShops } = useShopStore();
  const { orders, fetchOrders } = useOrderStore(); // Access orders and fetchOrders from the order store

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [shopToDelete, setShopToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);

  const { customers, fetchAllCustomers } = useCustomerStore();
  const { tailors, fetchAllTailors } = useTailorStore();

  // Filter shops based on search query (by name)
  const [searchQuery, setSearchQuery] = useState('');
  const filteredShops = shops.filter(shop =>
    shop.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteShop = async (shopId: string) => {
    setShopToDelete(shopId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!shopToDelete) return;

    setIsDeleting(true);
    try {
      await baseApi(`/shops/${shopToDelete}`, { method: 'DELETE' });
   
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

  const handleEditShop = (shop: Shop) => {
    setShopToEdit(shop);
    setIsAddShopModalOpen(true);
  };

  const handleCloseShopModal = () => {
    setIsAddShopModalOpen(false);
    setShopToEdit(null); // Reset shopToEdit when modal is closed
  };

  console.log({
    shops, customers, tailors, orders,
    loading, error,
    user
  });

  useEffect(() => {
    (async () => {
      try {
        await fetchShops();
        await fetchAllCustomers();
        await fetchAllTailors();
        await fetchOrders();
      } catch (e) {
        console.error('Error in Shop data fetch:', e);
      }
    })();
  }, [fetchShops, fetchAllCustomers, fetchAllTailors, fetchOrders]);

  useEffect(() => {
    if (
      user?.role?.toLowerCase() === 'shop_owner' &&
      user?.shopId &&
      shops.length > 0
    ) {
      navigate(`/shop/shopprofile/${user.shopId}`, { replace: true });
    }
  }, [user, shops, navigate]);

  const isAdmin = user?.role?.toLowerCase() === 'super_admin';
  const totalShops = shops.length;
  const totalActiveShops = shops.filter(s => s.ownerId).length;
  const totalTailors = isAdmin ? tailors.length : tailors.filter(t => t.shopId === user?.shopId).length;
  const totalCustomers = isAdmin ? customers.length : customers.filter(c => c.shopId === user?.shopId).length;
  const totalOrders = isAdmin ? orders.length : orders.filter(o => o.shopId === user?.shopId).length;

  const shopMetrics = [
    { title: 'Total Shops', value: totalShops, description: `${totalShops} shops in database`, color: 'bg-blue-500' },
    { title: 'Active Shops', value: totalActiveShops, description: `${totalActiveShops} active shops`, color: 'bg-green-500' },
    { title: 'Tailor', value: totalTailors, description: `${totalTailors} tailors`, color: 'bg-orange-500' },
    { title: 'Customers', value: totalCustomers, description: `${totalCustomers} customers`, color: 'bg-lime-600' },
  ];

  if (loading) {
    return <Loader message="Loading shops..." />;
  }
  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }
  if (!loading && !error && shops.length === 0) {
    return <div className="text-center py-8">No shops found.</div>;
  }

  return (
    <div
      className="flex "
      style={{
        backgroundImage: `url('/assets/sidebar-bg.svg')`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'left',
        backgroundColor: '#F2F7FE',
      }}
    >
      <main className="flex-1 flex flex-col overflow-hidden">
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
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
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

            {!loading && !error && filteredShops.length > 0 && (
              <ReusableTable
                columns={[
                  { header: 'Name', accessor: 'name', className: 'w-1/5' },
                  { header: 'Phone', accessor: 'phone', className: 'w-1/5' },
                  { header: 'Address', accessor: 'address', className: 'w-1/5' },
                  { header: 'Serial Number', accessor: 'serialNumber', className: 'w-1/5' },
                  { header: 'Actions', accessor: 'actions', className: 'w-1/5' },
                ]}
                data={[...filteredShops].sort((a, b) => b.serialNumber - a.serialNumber)}
                renderRow={(shop) => (
                  <tr key={shop.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle w-1/5 font-medium">{shop.name}</td>
                    <td className="p-4 align-middle w-1/5">{shop.phone || 'N/A'}</td>
                    <td className="p-4 align-middle w-1/5">{shop.address}</td>
                    <td className="p-4 align-middle w-1/5">Shp-{(shop.serialNumber || 0) + 999}</td>
                    <td className="p-4 align-middle w-1/5">
                      <div className="flex gap-5">
                        <Tooltip text="Add Customer">
                          <UserPlus className="w-5 h-5 text-[#55AC9A] cursor-pointer" onClick={() => {
                            setSelectedShopId(shop.id);
                            setIsCustomerModalOpen(true);
                          }}/>
                        </Tooltip>
                        <Tooltip text="Add Tailor">
                          <img src="/assets/scissor-01-stroke-rounded.svg" alt="Add Tailor" className="w-5 h-5 text-[#55AC9A] cursor-pointer" onClick={() => {
                            setSelectedShopId(shop.id);
                            setIsAddTailorModalOpen(true);
                          }}/>
                        </Tooltip>
                        <Tooltip text="View Shop Profile">
                          <Eye className="w-5 h-5 text-[#55AC9A] cursor-pointer" onClick={() => {
                            navigate(`/shop/shopprofile/${shop.id}`);
                          }}/>
                        </Tooltip>
                        <Tooltip text="Edit Shop">
                          <Edit className="w-5 h-5 text-[#55AC9A] cursor-pointer" onClick={() => handleEditShop(shop)}/>
                        </Tooltip>
                        <Tooltip text="Delete Shop">
                          <Trash2 className="w-5 h-5 text-[#55AC9A] cursor-pointer" onClick={() => handleDeleteShop(shop.id)} />
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                )}
                emptyMessage="No shops found."
              />
            )}
          </div>
        </div>
      </main>

      {/* Add/Edit Shop Modal */}
      <Dialog open={isAddShopModalOpen} onOpenChange={handleCloseShopModal}>
        <DialogContent className="sm:max-w-[500px] bg-white p-6 rounded-lg z-[1000]">
          <DialogHeader>
            <div className="flex justify-between items-center">
            <DialogTitle className="text-lg font-semibold">
              {shopToEdit ? 'Edit Shop' : 'Create New Shop'}
            </DialogTitle>        
                <X size={24} onClick={() => {
                  setIsAddShopModalOpen(false);
                  setSelectedShopId(null);
                }} 
                className="text-gray-400 hover:text-gray-700 focus:outline-none"/>
              {/* </button> */}
            </div>
            <DialogDescription className="text-sm text-gray-500">
              {shopToEdit ? 'Update the shop details below.' : 'Fill in the details for the new shop.'}
            </DialogDescription>
          </DialogHeader>

          <NewShopForm
            onFormSubmitSuccess={async () => {
              handleCloseShopModal();
              await fetchShops();
              const shops = useShopStore.getState().shops;
              if (shops.length > 0) {
                setUser({
                  phone: user?.phone || '',
                  role: user?.role || '',
                  shopId: shops[0].id,
                });
                navigate(`/shop/shopprofile/${shops[0].id}`);
              }
            }}
            editMode={!!shopToEdit}
            shopToEdit={shopToEdit ? {
              id: shopToEdit.id,
              name: shopToEdit.name,
              phone: shopToEdit.phone,
              address: shopToEdit.address
            } : undefined}
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
            <div className="flex justify-between items-center">
              <DialogTitle>Create New Customer</DialogTitle>
                <X size={24} onClick={() => {
                  setIsCustomerModalOpen(false);
                  setSelectedShopId(null);
                }} 
                className="text-gray-400 hover:text-gray-700 focus:outline-none"/>
            </div>
            <DialogDescription className="text-sm text-gray-500">
              Enter details to add a new customer.
            </DialogDescription>
          </DialogHeader>

          <NewCustomerForm
            onFormSubmitSuccess={() => {
             
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
            <div className="flex justify-between items-center">
              <DialogTitle>Add New Tailor</DialogTitle>
                <X size={24}  onClick={() => {
                  setIsAddTailorModalOpen(false);
                  setSelectedShopId(null);
                }}
                className="text-gray-400 hover:text-gray-700 focus:outline-none"/>
            </div>
            <DialogDescription className="text-sm text-gray-500">
              Enter details for the new tailor.
            </DialogDescription>
          </DialogHeader>

          <NewTailorForm
            onFormSubmitSuccess={() => {
             
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
