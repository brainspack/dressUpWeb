import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderStore, Order as OrderType } from '../../store/useOrderStore';
import { Edit, Trash2, AlertCircle, Eye } from 'lucide-react';
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import Tooltip from '../../components/ui/tooltip';
import ReusableTable from '../../components/ui/CustomTable';
import useAuthStore from '../../store/useAuthStore';
import { useShopStore } from '../../store/useShopStore';

const Orders = () => {
  const navigate = useNavigate();
  const {
    orders,
    loading,
    error,
    fetchOrders,
    updateOrder,
    deleteOrder,
  } = useOrderStore();
  const user = useAuthStore((state) => state.user);
  const { shops } = useShopStore();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleEditOrder = (order: OrderType) => {
    navigate(`/orders/edit/${order.id}`, {
      state: {
        customerId: order.customer?.id,
        shopId: order.shopId,
        order: order,
      }
    });
  };

  const handleViewOrder = (order: OrderType) => {
    navigate(`/orders/view/${order.id}`);
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrderToDelete(orderId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    try {
      await deleteOrder(orderToDelete);
      setDeleteModalOpen(false);
      setOrderToDelete(null);
      await fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateOrder = (customerId: string, shopId: string) => {
    navigate(`/orders/new-order`, { state: { customerId, shopId } });
  };

  const activeOrders = orders.filter(order => !order.deletedAt);
  const filteredOrders = user?.role?.toLowerCase() === 'shop_owner'
    ? activeOrders.filter(o => o.shopId === user.shopId)
    : activeOrders;

  if (user?.role?.toLowerCase() === 'shop_owner' && shops.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg font-bold mb-4">Please create your shop to access orders.</p>
          <Button variant="mintGreen" onClick={() => navigate('/shop/new')}>Create Shop</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex  bg-[#F2F7FE]">
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto">
          {filteredOrders.length === 0 && !loading && !error ? (
            <Card className="flex-1 flex flex-col items-center justify-center p-6 text-center shadow-lg rounded-lg bg-white">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800">No Orders Found</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600 mb-6">
                <p>No orders found for the selected shop.</p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="mintGreen"
                  onClick={() => navigate('/customer')}
                >
                  Add New Order
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <Button
                  variant="mintGreen"
                  onClick={() => navigate('/customer')}
                >
                  Add New Order
                </Button>
              </div>

              {loading && <p className="text-center">Loading orders...</p>}
              {error && <p className="text-red-500 text-center">Error: {error}</p>}

              {!loading && !error && filteredOrders.length > 0 && (
                <Card>
                  <CardContent className="p-0">
                    <ReusableTable
                      columns={[
                        { header: 'Customer Name', accessor: 'customerName', className: 'w-1/6' },
                        { header: 'Tailor Name', accessor: 'tailorName', className: 'w-1/6' },
                        { header: 'Status', accessor: 'status', className: 'w-1/6' },
                        { header: 'Order Date', accessor: 'orderDate', className: 'w-1/6' },
                        { header: 'Delivery Date', accessor: 'deliveryDate', className: 'w-1/6' },
                        { header: 'Actions', accessor: 'actions', className: 'w-1/6' },
                      ]}
                      data={filteredOrders}
                      renderRow={(order: OrderType) => (
                        <tr key={order.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                          <td className="p-4 align-middle w-1/6 font-medium">{order.customer.name}</td>
                          <td className="p-4 align-middle w-1/6">{order.tailorName}</td>
                          <td className="p-4 align-middle w-1/6">{order.status}</td>
                          <td className="p-4 align-middle w-1/6">{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}</td>
                          <td className="p-4 align-middle w-1/6">{order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'N/A'}</td>
                          <td className="p-4 align-middle w-1/6">
                              <div className="flex gap-5">
                                <Tooltip text="View Details">
                                  <Eye className="w-5 h-5 text-[#55AC9A] cursor-pointer" onClick={() => handleViewOrder(order)} />
                                </Tooltip>
                                <Tooltip text="Edit Order">
                                  <Edit className="w-5 h-5 text-[#55AC9A] cursor-pointer" onClick={() => handleEditOrder(order)}/>
                                </Tooltip>
                                <Tooltip text="Delete Order">
                                  <Trash2 className="w-4 h-4 text-[#55AC9A] cursor-pointer" onClick={() => handleDeleteOrder(order.id)}/>
                                </Tooltip>
                              </div>
                          </td>
                        </tr>
                      )}
                      emptyMessage="No orders found."
                    />
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setOrderToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Order"
        description="Are you sure you want to delete this order? This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Orders;
