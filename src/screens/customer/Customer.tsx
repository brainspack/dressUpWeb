import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Import lucide-react icons
import {
  Menu,
  Search,
  ShoppingBag,
  FileText,
  Bell,
  Edit,
  Trash2,
  PlusCircle,
  BaggageClaim,
  Eye,
  X
} from 'lucide-react';

// Import Shadcn UI components
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Card, CardTitle } from "../../components/ui/card";

// Import Shadcn Dialog components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog";

import useAuthStore, { User } from '../../store/useAuthStore';
import { baseApi } from '../../api/baseApi';

// Import the NewCustomerForm component (NewOrderForm is not rendered here directly anymore)
import NewCustomerForm from './modules/NewCustomerForm';
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal';
import Tooltip from '../../components/ui/tooltip';
import ReusableCard from '../../components/ui/ReusableCard';
import Loader from '../../components/ui/Loader';
import ReusableTable from '../../components/ui/ReusableTable';
import ReusableDialog from '../../components/ui/ReusableDialog';
import { useCustomerStore, Customer as CustomerType } from '../../store/useCustomerStore';
import { useShopStore } from '../../store/useShopStore';

const Customer: React.FC = () => {
  const user: User = useAuthStore((state) => state.user);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerToEdit, setCustomerToEdit] = useState<CustomerType | null>(null);

  const { customers, loading, error, fetchAllCustomers } = useCustomerStore();
  const { shops } = useShopStore();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  // Fetch customers on component mount and when user changes
  useEffect(() => {
    if (user) {
      fetchAllCustomers();
    }
  }, [user, fetchAllCustomers]);

  // Add new handler for deleting customers inside the component
  const handleDeleteCustomer = async (customerId: string) => {
    setCustomerToDelete(customerId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;
    
    setIsDeleting(true);
    try {
      await baseApi(`/customers/${customerToDelete}`, { method: 'DELETE' });
   
      fetchAllCustomers(); // Refresh the customer list after successful deletion
    } catch (error: any) {
      console.error('Error soft-deleting customer:', error);
      alert(`Failed to delete customer: ${error.message || 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setCustomerToDelete(null);
    }
  };

  // New handler for editing customer
  const handleEditCustomer = (customer: CustomerType) => {
    setCustomerToEdit(customer);
    setIsAddModalOpen(true);
  };

  const handleCloseCustomerModal = () => {
    setIsAddModalOpen(false);
    setCustomerToEdit(null);
  };

  const handleCustomerCreated = async () => {
  
    setIsAddModalOpen(false);
    await fetchAllCustomers(); // Wait for the fetch to complete
  };

  // Helper function to truncate text by words
  const truncateByWords = (text: string, maxWords: number): string => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(' '); // Removed explicit dots, CSS will handle ellipsis
    }
    return text;
  };

  // Filter customers based on search query (by name)
  const filteredCustomers = (user?.role?.toLowerCase() === 'shop_owner'
    ? customers.filter(c => c.shopId === user.shopId)
    : customers
  ).filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (user?.role?.toLowerCase() === 'shop_owner' && shops.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg font-bold mb-4">Please create your shop to access customers.</p>
          <Button variant="mintGreen" onClick={() => navigate('/shop/new')}>Create Shop</Button>
        </div>
      </div>
    );
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
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Content Area */}
        <div
          className="flex-1 p-6 overflow-y-auto"
          style={{ backgroundColor: 'white' }}
        >
            <>
              {/* Search + Add Customer section */}
              <div
                className="relative mb-6 p-6 rounded-lg flex items-center gap-2"
                style={{ backgroundColor: '#E0F2FE', overflow: 'hidden' }}
              >
                <Input
                  type="text"
                  placeholder="Search Customer "
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-grow max-w-xs px-3 py-2 rounded-l-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white"
                />
                <Button
                  variant="mintGreen"
                  className="text-white px-6 py-2 rounded-r-md whitespace-nowrap"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  Add Customer
                </Button>
              </div>

              {/* Loading and Error States */}
              {loading && (
                <Loader message="Loading customers..." />
              )}

              {error && (
                <div className="text-center py-4">
                  <p className="text-red-500">Error: {error}</p>
                </div>
              )}

              {!loading && !error && filteredCustomers.length > 0 ? (
                <ReusableTable
                  columns={[
                    { header: 'Name', accessor: 'name', className: 'w-1/4' },
                    { header: 'Mobile Number', accessor: 'mobileNumber', className: 'w-1/4' },
                    { header: 'Address', accessor: 'address', className: 'w-1/4' },
                    { header: 'Actions', accessor: 'actions', className: 'w-1/4' },
                  ]}
                  data={filteredCustomers}
                  renderRow={(customer: CustomerType) => (
                    <tr key={customer.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle w-1/4 font-medium">{customer.name}</td>
                      <td className="p-4 align-middle w-1/4">{customer.mobileNumber}</td>
                      <td className="p-4 align-middle w-1/4 max-w-xs truncate" title={customer.address}>
                        {truncateByWords(customer.address, 10)}
                      </td>
                      <td className="p-4 align-middle w-1/4">
                        <div className="flex gap-5">
                          <Tooltip text="Add Order">
                            <BaggageClaim className="w-5 h-5 text-[#55AC9A] cursor-pointer" onClick={() => { navigate(`/orders/new-order?customerId=${customer.id}&shopId=${customer.shopId}`); }}/>
                          </Tooltip>
                          <Tooltip text="Edit Customer">
                            <Edit className="w-5 h-5 text-[#55AC9A] cursor-pointer" onClick={() => handleEditCustomer(customer)}/>
                          </Tooltip>
                          <Tooltip text="Delete Customer">
                            <Trash2 className="w-5 h-5 text-[#55AC9A] cursor-pointer" onClick={() => handleDeleteCustomer(customer.id)}/>
                          </Tooltip>
                          <Tooltip text="View Profile">
                            <Eye className="w-5 h-5 text-[#55AC9A] cursor-pointer" onClick={() => navigate(`/customer/profile/${customer.id}`)}/>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  )}
                  emptyMessage="No customers found."
                />
              ) : (
                !loading && !error && filteredCustomers.length === 0 && (
                  <div className="text-center py-4">
                    <p>No customers found.</p>
                  </div>
                )
              )}
            </>

            {/* Add New Customer Modal */}
            <ReusableDialog open={isAddModalOpen} onOpenChange={handleCloseCustomerModal} title={customerToEdit ? 'Update Customer' : 'Add New Customer'} description={customerToEdit ? 'Edit customer details here.' : 'Fill in the details to add a new customer.'}>
              <NewCustomerForm
                shopId={user?.shopId || null}
                customerToEdit={customerToEdit || undefined}
                onFormSubmitSuccess={handleCustomerCreated}
                onCancel={handleCloseCustomerModal}
              />
            </ReusableDialog>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
              isOpen={deleteModalOpen}
              onClose={() => {
                setDeleteModalOpen(false);
                setCustomerToDelete(null);
              }}
              onConfirm={handleConfirmDelete}
              title="Delete Customer"
              description="Are you sure you want to delete this customer? This action cannot be undone."
              isLoading={isDeleting}
            />
        </div>
      </main>
    </div>
  );
};

export default Customer;
