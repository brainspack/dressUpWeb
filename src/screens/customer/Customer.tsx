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

interface CustomerData {
  id: string;
  name: string;
  mobileNumber: string;
  address: string;
  shopId: string;
  // Add other properties as per your backend response if needed
}

const Customer: React.FC = () => {
  const user: User = useAuthStore((state) => state.user);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerToEdit, setCustomerToEdit] = useState<CustomerData | null>(null);

  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [errorFetchingCustomers, setErrorFetchingCustomers] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  // Use useCallback to memoize the fetch function
  const fetchCustomers = useCallback(async () => {
    setLoadingCustomers(true);
    setErrorFetchingCustomers(null);
    try {
   
      const response = await baseApi('/customers/my-customers', { 
        method: 'GET',
        onError: (error) => {
          console.error('❌ Error in API call:', error);
          setErrorFetchingCustomers(error);
        },
        onStart: () => {
          console.log('🚀 Starting API request...');
        },
        onFinish: () => {
          console.log('✅ API request finished');
        }
      });
      
   
      
      if (Array.isArray(response)) {
      
        setCustomers(response as CustomerData[]);
      } else {
       
        setErrorFetchingCustomers('Invalid response format from server');
      }
    } catch (error: any) {
     
       
      setErrorFetchingCustomers(error.message || 'Failed to fetch customers');
    } finally {
      setLoadingCustomers(false);
    }
  }, [user]);

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
   
      fetchCustomers(); // Refresh the customer list after successful deletion
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
  const handleEditCustomer = (customer: CustomerData) => {
    setCustomerToEdit(customer);
    setIsAddModalOpen(true);
  };

  const handleCloseCustomerModal = () => {
    setIsAddModalOpen(false);
    setCustomerToEdit(null);
  };

  // Fetch customers on component mount and when user changes
  useEffect(() => {
    if (user) {
    
      fetchCustomers();
    }
  }, [user, fetchCustomers]);

  const handleCustomerCreated = async () => {
  
    setIsAddModalOpen(false);
    await fetchCustomers(); // Wait for the fetch to complete
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

  // Filter customers based on search query
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.mobileNumber.includes(searchQuery) ||
    customer.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                  placeholder="Search Contact"
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
              {loadingCustomers && (
                <div className="text-center py-4">
                  <p>Loading customers...</p>
                </div>
              )}

              {errorFetchingCustomers && (
                <div className="text-center py-4">
                  <p className="text-red-500">Error: {errorFetchingCustomers}</p>
                </div>
              )}

              {!loadingCustomers && !errorFetchingCustomers && filteredCustomers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg shadow-md">
                    <thead className="bg-blue-100">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 w-1/4">Name</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 w-1/4">Mobile Number</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 w-1/4">Address</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 w-1/4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map((customer) => (
                        <tr key={customer.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-800 w-1/4">{customer.name}</td>
                          <td className="py-3 px-4 text-sm text-gray-800 w-1/4">{customer.mobileNumber}</td>
                          <td className="py-3 px-4 text-sm text-gray-800 max-w-xs truncate w-1/4" title={customer.address}>
                            {truncateByWords(customer.address, 10)}
                          </td>
                          <td className="py-3 px-4 text-sm w-1/4">
                            <div className="flex gap-5">
                              <Tooltip text="Add Order">
                                <BaggageClaim className="w-5 h-5 text-[#55AC9A] mr-1"  onClick={() => { navigate(`/orders/new-order?customerId=${customer.id}&shopId=${customer.shopId}`); }}/>
                              </Tooltip>
                              <Tooltip text="Edit Customer">
                                <Edit className="w-5 h-5 text-[#55AC9A]"  onClick={() => handleEditCustomer(customer)}/>
                              </Tooltip>
                              <Tooltip text="Delete Customer">
                                <Trash2 className="w-5 h-5 text-[#55AC9A]" onClick={() => handleDeleteCustomer(customer.id)}/>
                              </Tooltip>
                              <Tooltip text="View Profile">
                                <Eye className="w-5 h-5 text-[#55AC9A]"  onClick={() => navigate(`/customer/profile/${customer.id}`)}/>
                              </Tooltip>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                !loadingCustomers && !errorFetchingCustomers && filteredCustomers.length === 0 && (
                  <div className="text-center py-4">
                    <p>No customers found.</p>
                  </div>
                )
              )}
            </>

            {/* Add New Customer Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={handleCloseCustomerModal}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <div className="flex justify-between items-center">
                    <DialogTitle>{customerToEdit ? 'Update Customer' : 'Add New Customer'}</DialogTitle>
                    <X
                      size={24}
                      onClick={() => handleCloseCustomerModal()}
                      className="text-gray-400 hover:text-gray-700 focus:outline-none cursor-pointer"
                    />
                  </div>
                  <DialogDescription>
                    {customerToEdit ? 'Edit customer details here.' : 'Fill in the details to add a new customer.'}
                  </DialogDescription>
                </DialogHeader>
                <NewCustomerForm
                  shopId={user?.shopId || null}
                  customerToEdit={customerToEdit || undefined}
                  onFormSubmitSuccess={handleCustomerCreated}
                  onCancel={handleCloseCustomerModal}
                />
              </DialogContent>
            </Dialog>

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
