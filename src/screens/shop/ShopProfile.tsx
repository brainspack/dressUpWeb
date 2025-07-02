import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Mail, Phone, MapPin, User, Mail as MailIcon, Shirt,X, Package, Truck, Clock, Edit, Trash2, Eye, PlusCircle, BaggageClaim } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { baseApi } from '../../api/baseApi'; // your custom fetch wrapper or API util
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { useTailorStore } from '../../store/useTailorStore';
import { useCustomerStore } from '../../store/useCustomerStore'; // Import the customer store
import NewTailorForm from './modules/NewTailorForm'; // Import the NewTailorForm component
import NewCustomerForm from '../../screens/customer/modules/NewCustomerForm'; // Import the NewCustomerForm component from the correct path
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog'; // Import Dialog components
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal';
import Tooltip from '../../components/ui/tooltip';
import ReusableCard from '../../components/ui/CustomCard';
import Loader from '../../components/ui/Loader';
import ReusableTable from '../../components/ui/CustomTable';
import ReusableDialog from '../../components/ui/CustomDialog';
import useAuthStore from '../../store/useAuthStore';
import { useShopStore } from '../../store/useShopStore';

// Added this comment to try and force linter refresh

interface TailorData {
  id: string;
  name: string;
  mobileNumber: string;
  shopId: string;
}

interface CustomerData {
  id: string;
  name: string;
  mobileNumber: string;
  address?: string | null;
  shopId: string;
}

const ShopProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const { shops } = useShopStore();

  const [shopData, setShopData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { tailors, loading: loadingTailors, error: errorTailors, fetchTailors } = useTailorStore();
  const { customers, loading: loadingCustomers, error: errorCustomers, fetchCustomers } = useCustomerStore();

  const [showTailorForm, setShowTailorForm] = useState(false);
  const [selectedTailor, setSelectedTailor] = useState<TailorData | null>(null);

  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'customer' | 'tailor' | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteCustomer = async (customerId: string) => {
    setDeleteType('customer');
    setItemToDelete(customerId);
    setDeleteModalOpen(true);
  };

  const handleDeleteTailor = async (tailorId: string) => {
    setDeleteType('tailor');
    setItemToDelete(tailorId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete || !deleteType) return;
    
    setIsDeleting(true);
    try {
      const endpoint = deleteType === 'customer' ? 'customers' : 'tailors';
      await baseApi(`/${endpoint}/${itemToDelete}`, { method: 'DELETE' });
     
      if (id) {
        if (deleteType === 'customer') {
          fetchCustomers(id);
        } else {
          fetchTailors(id);
        }
      }
    } catch (error: any) {
      console.error(`Error soft-deleting ${deleteType}:`, error);
      alert(`Failed to delete ${deleteType}: ${error.message || 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setItemToDelete(null);
      setDeleteType(null);
    }
  };

  const handleEditTailor = (tailor: TailorData) => {
    setSelectedTailor(tailor);
    setShowTailorForm(true);
  };

  const handleTailorFormSubmitSuccess = () => {
    setShowTailorForm(false);
    setSelectedTailor(null);
    if (id) {
      fetchTailors(id);
    }
  };

  const handleEditCustomer = (customer: CustomerData) => {
    setSelectedCustomer(customer);
    setShowCustomerForm(true);
  };

  const handleCustomerFormSubmitSuccess = () => {
    setShowCustomerForm(false);
    setSelectedCustomer(null);
    if (id) {
      fetchCustomers(id);
    }
  };

  const handleAddOrder = (customer: CustomerData) => {
    navigate(`/orders/new-order?customerId=${customer.id}&shopId=${shopData.id}`);
  };

  useEffect(() => {
    const fetchShopData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (id) {
          const response = await baseApi(`/shops/${id}`, { method: 'GET' });
          setShopData(response);
          fetchTailors(id);
          fetchCustomers(id);
        } else {
          setError('Shop ID not provided in URL');
        }
      } catch (err: any) {
        console.error('Error fetching shop data:', err);
        setError(err.message || 'Failed to fetch shop data');
        setShopData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, [id, fetchTailors, fetchCustomers]);

  useEffect(() => {
    if (user?.role?.toLowerCase() === 'shop_owner' && !user?.shopId && shops.length > 0) {
      setUser({ ...user, shopId: shops[0].id });
    }
  }, [user, shops, setUser]);

  // Restrict shop_owner to only their own shop profile
  if (user?.role?.toLowerCase() === 'shop_owner' && user?.shopId !== id) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500 text-xl font-bold">You are not authorized to view this shop profile.</div>
      </div>
    );
  }

  return (
    <div className="flex bg-[#F2F7FE]">
      <main className="flex-1 flex flex-col overflow-hidden">
       
        <div className="flex-1 p-5 overflow-y-auto">
          <Button
            variant="mintGreen"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            ← Back
          </Button>
          {loading && <Loader message="Loading shop data..." />}
          {error && <p className="text-red-500">Error: {error}</p>}

          {shopData && !showTailorForm && !showCustomerForm ? (
            <>
              {/* User Profile Card */}
              <div className="bg-[#55AC8A] text-white p-6 rounded-lg shadow-md mb-6 flex items-center w-full">
                <div className="w-24 h-24 rounded-full mr-6 flex items-center justify-center bg-white text-[#55AC8A]">
                  <User size={48} />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white">{shopData.name}</h2>
                  <p className="text-white">{shopData.address}</p>
                  <div className="flex items-center mt-4 text-white">
                    <Phone size={16} className="mr-2" />
                    <span>{shopData.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Metrics Section (admin only) */}
              {(user?.role?.toLowerCase() !== 'shop_owner') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  {/* Total Orders Card */}
                  <ReusableCard>
                    <div className="rounded-full w-12 h-12 flex items-center justify-center bg-gray-200 text-gray-600 mb-2">
                      <Package size={24} />
                    </div>
                    <div className="text-2xl font-bold">{shopData.totalOrders || 0}</div>
                    <p className="text-gray-500">Total Orders</p>
                  </ReusableCard>
                  {/* Total Tailors Card */}
                  <ReusableCard>
                    <div className="rounded-full w-12 h-12 flex items-center justify-center bg-gray-200 text-gray-600 mb-2">
                      <Shirt size={24} />
                    </div>
                    <div className="text-2xl font-bold">{shopData.totalActiveTailors || 0}</div>
                    <p className="text-gray-500">Total Tailors</p>
                  </ReusableCard>
                  {/* Delivered Orders Card */}
                  <ReusableCard>
                    <div className="rounded-full w-12 h-12 flex items-center justify-center bg-gray-200 text-gray-600 mb-2">
                      <Truck size={24} />
                    </div>
                    <div className="text-2xl font-bold">{shopData.deliveredOrders || 0}</div>
                    <p className="text-gray-500">Delivered Orders</p>
                  </ReusableCard>
                  {/* Pending Orders Card */}
                  <ReusableCard>
                    <div className="rounded-full w-12 h-12 flex items-center justify-center bg-gray-200 text-gray-600 mb-2">
                      <Clock size={24} />
                    </div>
                    <div className="text-2xl font-bold">{shopData.pendingOrders || 0}</div>
                    <p className="text-gray-500">Pending Orders</p>
                  </ReusableCard>
                </div>
              )}

              {/* Shop Details Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="col-span-full">
                  <CardHeader>
                    <CardTitle>Shop Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p><strong>Mobile:</strong> {shopData?.phone}</p>
                    <p><strong>Address:</strong> {shopData.address || 'N/A'}</p>
                    {/* Add more details here if needed */}
                  </CardContent>
                </Card>
              </div>

              {/* Tailors Table Section */}
              <div className="mt-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between px-6 py-6">
                    <CardTitle>Tailors</CardTitle>
                    <Button 
                      variant="mintGreen"
                      onClick={() => {
                        setSelectedTailor(null);
                        setShowTailorForm(true);
                      }}>
                      Add Tailor
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {loadingTailors && <Loader message="Loading tailors..." />}
                    {errorTailors && <p className="text-red-500">Error: {errorTailors}</p>}
                    {!loadingTailors && !errorTailors && (
                      <ReusableTable
                        columns={[
                          { header: 'Name', accessor: 'name', className: 'w-1/3' },
                          { header: 'Mobile Number', accessor: 'mobileNumber', className: 'w-1/3' },
                          { header: 'Actions', accessor: 'actions', className: 'w-1/3' },
                        ]}
                        data={[...tailors].sort((a, b) => (b.serialNumber || 0) - (a.serialNumber || 0))}
                        renderRow={(tailor) => (
                          <tr key={tailor.id}>
                            <td className="w-1/3 p-4 font-medium ">{tailor.name}</td>
                            <td className="w-1/3  p-4">{tailor.mobileNumber}</td>
                            <td className="w-1/3 p-4">
                              <div className="flex gap-5 ">
                                <Tooltip text="Edit Tailor">
                                  <Edit className="w-5 h-5 text-[#55AC9A]"  onClick={() => handleEditTailor(tailor)} />
                                </Tooltip>
                                <Tooltip text="Delete Tailor">
                                  <Trash2 className="w-5 h-5 text-[#55AC9A]" onClick={() => handleDeleteTailor(tailor.id)} />
                                </Tooltip>
                                <Tooltip text="View Tailor Profile">
                                  <Eye className="w-5 h-5 text-[#55AC9A]" onClick={() => { navigate(`/tailor/profile/${tailor.id}`); }}/>
                                </Tooltip>
                              </div>
                            </td>
                          </tr>
                        )}
                        emptyMessage="No tailors found for this shop."
                      />
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Customers Table Section */}
              <div className="mt-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between px-6 py-6">
                    <CardTitle>Customers</CardTitle>
                    <Button onClick={() => {
                      setSelectedCustomer(null);
                      setShowCustomerForm(true);
                    }}>
                      Add Customer
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {loadingCustomers && <Loader message="Loading customers..." />}
                    {errorCustomers && <p className="text-red-500">Error: {errorCustomers}</p>}
                    {!loadingCustomers && !errorCustomers && (
                      <ReusableTable
                        columns={[
                          { header: 'Name', accessor: 'name', className: 'w-1/4' },
                          { header: 'Mobile Number', accessor: 'mobileNumber', className: 'w-1/4' },
                          { header: 'Address', accessor: 'address', className: 'w-1/4' },
                          { header: 'Actions', accessor: 'actions', className: 'w-1/4' },
                        ]}
                        data={[...customers].sort((a, b) => (b.serialNumber || 0) - (a.serialNumber || 0))}
                        renderRow={(customer) => (
                          <tr key={customer.id}>
                            <td className="w-1/4 p-4 font-medium">{customer.name}</td>
                            <td className="w-1/4 p-4">{customer.mobileNumber}</td>
                            <td className="w-1/4 p-4">{customer.address || 'N/A'}</td>
                            <td className="w-1/4 p-4">
                              <div className="flex gap-5">
                                <Tooltip text="Add Order">
                                  <BaggageClaim className="w-5 h-5 mr-1 text-[#55AC9A]"  onClick={() => handleAddOrder(customer)} />
                                </Tooltip>
                                <Tooltip text="Edit Customer">
                                  <Edit className="w-5 h-5 text-[#55AC9A]" onClick={() => handleEditCustomer(customer)} />
                                </Tooltip>
                                <Tooltip text="Delete Customer">
                                  <Trash2 className="w-5 h-5 text-[#55AC9A]" onClick={() => handleDeleteCustomer(customer.id)}/>
                                </Tooltip>
                                <Tooltip text="View Customer Profile">
                                  <Eye className="w-5 h-5 text-[#55AC9A]"  onClick={() => { navigate(`/customer/profile/${customer.id}`); }} />
                                </Tooltip>
                              </div>
                            </td>
                          </tr>
                        )}
                        emptyMessage="No customers found for this shop."
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : null}

          {/* Tailor Form in Dialog */}
          <ReusableDialog
            open={showTailorForm}
            onOpenChange={setShowTailorForm}
            title={selectedTailor ? 'Update Tailor' : 'Add New Tailor'}
            description={selectedTailor ? 'Edit tailor details here.' : 'Fill in the details to add a new tailor.'}
          >
            {/* Cross icon for closing the modal */}
            <div className="absolute top-4 right-4 z-10">
              <X size={24} className="text-gray-400 hover:text-gray-700 cursor-pointer" onClick={() => setShowTailorForm(false)} />
            </div>
            <NewTailorForm
              shopId={id || null}
              tailorToEdit={selectedTailor}
              onFormSubmitSuccess={handleTailorFormSubmitSuccess}
              onCancel={() => setShowTailorForm(false)}
            />
          </ReusableDialog>

          {/* Customer Form in Dialog */}
          <ReusableDialog
            open={showCustomerForm}
            onOpenChange={setShowCustomerForm}
            title={selectedCustomer ? 'Update Customer' : 'Add New Customer'}
            description={selectedCustomer ? 'Edit customer details here.' : 'Fill in the details to add a new customer.'}
          >
            {/* Cross icon for closing the modal */}
            <div className="absolute top-4 right-4 z-10">
              <X size={24} className="text-gray-400 hover:text-gray-700 cursor-pointer" onClick={() => setShowCustomerForm(false)} />
            </div>
            <NewCustomerForm
              shopId={id || null}
              customerToEdit={selectedCustomer || undefined}
              onFormSubmitSuccess={handleCustomerFormSubmitSuccess}
              onCancel={() => setShowCustomerForm(false)}
            />
          </ReusableDialog>
        </div>
      </main>

      {/* Add the DeleteConfirmationModal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
          setDeleteType(null);
        }}
        onConfirm={handleConfirmDelete}
        title={`Delete ${deleteType === 'customer' ? 'Customer' : 'Tailor'}`}
        description={`Are you sure you want to delete this ${deleteType}? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ShopProfile;
