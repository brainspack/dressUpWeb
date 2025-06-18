import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import { useCustomerStore, Customer } from '../../store/useCustomerStore'; // Import Customer interface

const CustomerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { customers, loading, error } = useCustomerStore();
  const customerData = customers.find(customer => customer.id === id);

  useEffect(() => {
    // No explicit fetchCustomers() call needed here, assuming data is pre-populated by ShopProfile.tsx
    // If customerData is not found, it means either: customer doesn't exist, or it wasn't fetched yet.
    // A more robust solution for direct access would involve a backend endpoint to fetch a single customer by ID.
  }, [id, customers]); // Depend on `customers` array to re-evaluate `customerData` if store updates

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen bg-[#F2F7FE]">
        <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Header title="Customer Profile" onToggleSidebar={toggleSidebar} />
          <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center">
            <p>Loading customer data...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen bg-[#F2F7FE]">
        <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Header title="Customer Profile" onToggleSidebar={toggleSidebar} />
          <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center">
            <p className="text-red-500">Error: {error}</p>
            <Button onClick={() => navigate(-1)} className="ml-4">Go Back</Button>
          </div>
        </main>
      </div>
    );
  }

  if (!customerData) {
    return (
      <div className="flex h-screen w-screen bg-[#F2F7FE]">
        <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Header title="Customer Profile" onToggleSidebar={toggleSidebar} />
          <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center">
            <p>Customer not found.</p>
            <Button onClick={() => navigate(-1)} className="ml-4">Go Back</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-[#F2F7FE]">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header title={`${customerData.name} Profile`} onToggleSidebar={toggleSidebar} />

        <div className="flex-1 p-6 overflow-y-auto">
          <Button onClick={() => navigate(-1)} className="mb-6">← Back</Button>

          {/* Customer Profile Card */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 rounded-lg shadow-md mb-6 flex items-center w-full">
            <div className="w-24 h-24 rounded-full mr-6 flex items-center justify-center bg-white text-blue-700">
              <User size={48} />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{customerData.name}</h2>
              <p className="text-blue-200">{customerData.address || 'N/A'}</p>
              <div className="flex items-center mt-4 text-blue-200">
                <Phone size={16} className="mr-2" />
                <span>{customerData.mobileNumber || 'N/A'}</span>
                {customerData.address && (
                  <>
                    <MapPin size={16} className="ml-6 mr-2" />
                    <span>{customerData.address}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Additional Customer Details (Example - you can add more as needed) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Mobile Number:</strong> {customerData.mobileNumber}</p>
                {customerData.address && <p><strong>Address:</strong> {customerData.address}</p>}
              </CardContent>
            </Card>

            {/* You can add more cards here for other customer-related information like orders, measurements, etc. */}
            <Card>
              <CardHeader>
                <CardTitle>Other Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Customer ID: {customerData.id}</p>
                <p>Shop ID: {customerData.shopId}</p>
                {/* Add other fields as needed */}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerProfile; 