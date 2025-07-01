import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import { useCustomerStore, Customer } from '../../store/useCustomerStore';
import { baseApi } from '../../api/baseApi';
import { Order } from '../../store/useOrderStore';
import { useShopStore } from '../../store/useShopStore';
import ReusableCard from '../../components/ui/ReusableCard';
import Loader from '../../components/ui/Loader';

const CustomerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { customers, loading, error } = useCustomerStore();
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const { shops, fetchShops } = useShopStore();
  const [shopName, setShopName] = useState<string>('');
  const [customerSerial, setCustomerSerial] = useState('');
  const [shopSerial, setShopSerial] = useState('');

  useEffect(() => {
    const found = customers.find(customer => customer.id === id);
    if (found) {
      setCustomerData(found);
      setLocalError(null);
      setLocalLoading(false);
    } else if (id) {
      setLocalLoading(true);
      setLocalError(null);
      baseApi(`/customers/${id}`, { method: 'GET' })
        .then((data) => {
          setCustomerData(data);
          setLocalError(null);
          if (data.serialNumber) {
            setCustomerSerial(`Cus-${data.serialNumber + 999}`);
          }
        })
        .catch((err) => {
          setLocalError(err.message || 'Failed to fetch customer');
          setCustomerData(null);
        })
        .finally(() => setLocalLoading(false));
    }
  }, [id, customers]);

  useEffect(() => {
    if (id) {
      setOrdersLoading(true);
      setOrdersError(null);
      baseApi(`/orders`, { method: 'GET' })
        .then((data) => {
          const filtered = (data as Order[]).filter(order => order.customer?.id === id && !order.deletedAt);
          setOrders(filtered);
        })
        .catch((err) => setOrdersError(err.message || 'Failed to fetch orders'))
        .finally(() => setOrdersLoading(false));
    }
  }, [id]);

  useEffect(() => {
    if (customerData && customerData.shopId) {
      let shop = shops.find(s => s.id === customerData.shopId);
      if (shop) {
        setShopName(shop.name);
        if (shop.serialNumber) {
          setShopSerial(`Shp-${shop.serialNumber + 999}`);
        }
      } else {
        fetchShops().then(() => {
          const updatedShop = shops.find(s => s.id === customerData.shopId);
          setShopName(updatedShop ? updatedShop.name : '');
          if (updatedShop && updatedShop.serialNumber) {
            setShopSerial(`Shp-${updatedShop.serialNumber + 999}`);
          }
        });
      }
    }
  }, [customerData, shops, fetchShops]);

  if (loading || localLoading) {
    return (
      <div className="flex  bg-[#F2F7FE]">
        <main className="flex-1 flex flex-col overflow-hidden">
          <Loader message="Loading customer data..." />
        </main>
      </div>
    );
  }

  if (error || localError) {
    return (
      <div className="flex  bg-[#F2F7FE]">
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center">
            <p className="text-red-500">Error: {error || localError}</p>
            <Button onClick={() => navigate(-1)} className="ml-4">Go Back</Button>
          </div>
        </main>
      </div>
    );
  }

  if (!customerData) {
    return (
      <div className="flex bg-[#F2F7FE]">
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center">
            <p>Customer not found.</p>
            <Button onClick={() => navigate(-1)} className="ml-4">Go Back</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex  bg-[#F2F7FE]">
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto">
          <Button onClick={() => navigate(-1)} className="mb-6">← Back</Button>

          {/* Customer Profile Card */}
          <ReusableCard className="bg-[#55AC8A] text-white p-6 rounded-lg shadow-md mb-6 flex items-center w-full">
            <div className="w-24 h-24 rounded-full mr-6 flex items-center justify-center bg-white text-[#55AC8A]">
              <User size={48} />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{customerData.name}</h2>
              <p className="text-white">{customerData.address || 'N/A'}</p>
              <div className="flex items-center mt-4 text-white">
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
          </ReusableCard>

          {/* Additional Customer Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ReusableCard title="Contact Information">
              <p><strong>Mobile Number:</strong> {customerData.mobileNumber}</p>
              {customerData.address && <p><strong>Address:</strong> {customerData.address}</p>}
            </ReusableCard>
            <ReusableCard title="Other Details">
              <p><strong>Customer:</strong> {customerData.name} {customerSerial && `(${customerSerial})`}</p>
              <p><strong>Shop:</strong> {shopName} {shopSerial && `(${shopSerial})`}</p>
            </ReusableCard>
          </div>

          {/* Customer Orders Section */}
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Orders</h3>
            {ordersLoading && <p>Loading orders...</p>}
            {ordersError && <p className="text-red-500">Error: {ordersError}</p>}
            {!ordersLoading && !ordersError && orders.length === 0 && (
              <p>No orders found for this customer.</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map(order => (
                <Card key={order.id} className="bg-white">
                  <CardHeader>
                    <CardTitle>Order #{order.id.slice(-6)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p><strong>Status:</strong> {order.status}</p>
                    <p><strong>Order Date:</strong> {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Delivery Date:</strong> {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Tailor:</strong> {order.tailorName || 'N/A'}</p>
                    <p><strong>Product:</strong> {order.productName || (order.clothes && order.clothes[0]?.type) || 'N/A'}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerProfile; 