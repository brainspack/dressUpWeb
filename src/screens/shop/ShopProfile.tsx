import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Mail, Phone, MapPin, User, Mail as MailIcon, Shirt, Users, Package, Truck, Clock, Edit, Trash2, Eye, PlusCircle } from 'lucide-react';
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
      console.log(`${deleteType === 'customer' ? 'Customer' : 'Tailor'} with ID ${itemToDelete} soft-deleted.`);
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

  return (
    <div className="flex bg-[#F2F7FE]">
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 pt-4">
        </div>

        <div className="flex-1 p-5 overflow-y-auto">
          <div className="mb-6">
            <Button
              variant="blueGradient"
              onClick={() => navigate(-1)}
            >
              ← Back
            </Button>
          </div>
          {loading && <p>Loading shop data...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}

          {shopData && !showTailorForm && !showCustomerForm ? (
            <>
              {/* User Profile Card */}
              <div className="bg-purple-700 text-white p-6 rounded-lg shadow-md mb-6 flex items-center w-full">
                <div className="w-24 h-24 rounded-full mr-6 flex items-center justify-center bg-white text-purple-700">
                  <User size={48} />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{shopData.name}</h2>
                  <p className="text-purple-200">{shopData.address}</p>
                  <div className="flex items-center mt-4 text-purple-200">
                    <Mail size={16} className="mr-2" />
                    <span>{shopData.email || 'N/A'}</span>
                    <Phone size={16} className="ml-6 mr-2" />
                    <span>{shopData.phone || 'N/A'}</span>
                    <MapPin size={16} className="ml-6 mr-2" />
                    <span>{shopData.location || 'N/A'}</span>
                  </div>
                </div>
                <Button className="text-white hover:bg-gray-100">Follow</Button>
              </div>

              {/* Metrics Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* Total Orders Card */}
                <Card className="flex flex-col items-center justify-center p-4 bg-white">
                  <CardHeader className="p-0 pb-2">
                    <div className="rounded-full w-12 h-12 flex items-center justify-center bg-gray-200 text-gray-600">
                      <Package size={24} />
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 text-center">
                    <div className="text-2xl font-bold">{shopData.totalOrders || 0}</div>
                    <p className="text-gray-500">Total Orders</p>
                  </CardContent>
                </Card>

                {/* New: Total Tailors Card */}
                <Card className="flex flex-col items-center justify-center p-4 bg-white">
                  <CardHeader className="p-0 pb-2">
                    <div className="rounded-full w-12 h-12 flex items-center justify-center bg-gray-200 text-gray-600">
                      <Shirt size={24} />
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 text-center">
                    <div className="text-2xl font-bold">{shopData.totalActiveTailors || 0}</div>
                    <p className="text-gray-500">Total Tailors</p>
                  </CardContent>
                </Card>

                {/* New: Delivered Orders Card */}
                <Card className="flex flex-col items-center justify-center p-4 bg-white">
                  <CardHeader className="p-0 pb-2">
                    <div className="rounded-full w-12 h-12 flex items-center justify-center bg-gray-200 text-gray-600">
                      <Truck size={24} />
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 text-center">
                    <div className="text-2xl font-bold">{shopData.deliveredOrders || 0}</div>
                    <p className="text-gray-500">Delivered Orders</p>
                  </CardContent>
                </Card>

                {/* New: Pending Orders Card */}
                <Card className="flex flex-col items-center justify-center p-4 bg-white">
                  <CardHeader className="p-0 pb-2">
                    <div className="rounded-full w-12 h-12 flex items-center justify-center bg-gray-200 text-gray-600">
                      <Clock size={24} />
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 text-center">
                    <div className="text-2xl font-bold">{shopData.pendingOrders || 0}</div>
                    <p className="text-gray-500">Pending Orders</p>
                  </CardContent>
                </Card>
              </div>

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
                    <Button onClick={() => {
                      setSelectedTailor(null);
                      setShowTailorForm(true);
                    }}>
                      Add Tailor
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {loadingTailors && <p>Loading tailors...</p>}
                    {errorTailors && <p className="text-red-500">Error: {errorTailors}</p>}
                    {!loadingTailors && !errorTailors && tailors.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Mobile Number</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tailors.map((tailor) => (
                            <TableRow key={tailor.id}>
                              <TableCell className="font-medium">{tailor.name}</TableCell>
                              <TableCell>{tailor.mobileNumber}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button className="text-xs" onClick={() => handleEditTailor(tailor)}>
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button className="text-xs" onClick={() => handleDeleteTailor(tailor.id)}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    className="text-xs"
                                    onClick={() => {
                                      navigate(`/tailor/profile/${tailor.id}`);
                                    }}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      !loadingTailors && !errorTailors && <p>No tailors found for this shop.</p>
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
                    {loadingCustomers && <p>Loading customers...</p>}
                    {errorCustomers && <p className="text-red-500">Error: {errorCustomers}</p>}
                    {!loadingCustomers && !errorCustomers && customers.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Mobile Number</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customers.map((customer) => (
                            <TableRow key={customer.id}>
                              <TableCell className="font-medium">{customer.name}</TableCell>
                              <TableCell>{customer.mobileNumber}</TableCell>
                              <TableCell>{customer.address || 'N/A'}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button 
                                    className="text-xs bg-green-600 hover:bg-green-700" 
                                    onClick={() => handleAddOrder(customer)}
                                  >
                                    <PlusCircle className="w-4 h-4 mr-1" />
                                    Add Order
                                  </Button>
                                  <Button className="text-xs" onClick={() => handleEditCustomer(customer)}>
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button className="text-xs" onClick={() => handleDeleteCustomer(customer.id)}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    className="text-xs"
                                    onClick={() => {
                                      navigate(`/customer/profile/${customer.id}`);
                                    }}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      !loadingCustomers && !errorCustomers && <p>No customers found for this shop.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : null}

          {/* Tailor Form in Dialog */}
          <Dialog open={showTailorForm} onOpenChange={setShowTailorForm}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{selectedTailor ? 'Update Tailor' : 'Add New Tailor'}</DialogTitle>
                <DialogDescription>
                  {selectedTailor ? 'Edit tailor details here.' : 'Fill in the details to add a new tailor.'}
                </DialogDescription>
              </DialogHeader>
              <NewTailorForm
                shopId={id || null}
                tailorToEdit={selectedTailor}
                onFormSubmitSuccess={handleTailorFormSubmitSuccess}
                onCancel={() => setShowTailorForm(false)}
              />
            </DialogContent>
          </Dialog>

          {/* Customer Form in Dialog */}
          <Dialog open={showCustomerForm} onOpenChange={setShowCustomerForm}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{selectedCustomer ? 'Update Customer' : 'Add New Customer'}</DialogTitle>
                <DialogDescription>
                  {selectedCustomer ? 'Edit customer details here.' : 'Fill in the details to add a new customer.'}
                </DialogDescription>
              </DialogHeader>
              <NewCustomerForm
                shopId={id || null}
                customerToEdit={selectedCustomer || undefined}
                onFormSubmitSuccess={handleCustomerFormSubmitSuccess}
                onCancel={() => setShowCustomerForm(false)}
              />
            </DialogContent>
          </Dialog>
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
