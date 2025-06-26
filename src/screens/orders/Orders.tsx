import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderStore, Order, ClothingItem, CostItem, MeasurementItem } from '../../store/useOrderStore';
import { Edit, Trash2, AlertCircle } from 'lucide-react';
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import Tooltip from '../../components/ui/tooltip';

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

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleEditOrder = (order: Order) => {
   
    // Simply navigate to the edit route - the useOrderHook will fetch the data from API
    navigate(`/orders/edit/${order.id}`);
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
      // Optionally refresh the orders list
      await fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateOrder = (customerId: string, shopId: string) => {
    navigate(`/orders/new-order`, { state: { customerId, shopId } });
  };

  const activeOrders = orders.filter(order => !order.deletedAt);

  return (
    <div className="flex  bg-[#F2F7FE]">
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto">
          {activeOrders.length === 0 && !loading && !error ? (
            <Card className="flex-1 flex flex-col items-center justify-center p-6 text-center shadow-lg rounded-lg bg-white">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800">No Orders Yet</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600 mb-6">
                <p>It looks like you haven't created any orders yet. Start by adding a new order!</p>
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

              {!loading && !error && activeOrders.length > 0 && (
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-1/6">Customer Name</TableHead>
                          <TableHead className="w-1/6">Tailor Name</TableHead>
                          <TableHead className="w-1/6">Status</TableHead>
                          <TableHead className="w-1/6">Order Date</TableHead>
                          <TableHead className="w-1/6">Delivery Date</TableHead>
                          <TableHead className="w-1/6">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeOrders.map((order, index) => (
                          <TableRow key={order.id}>
                            <TableCell className="w-1/6 font-medium">{order.customer.name}</TableCell>
                            <TableCell className="w-1/6">{order.tailorName}</TableCell>
                            <TableCell className="w-1/6">{order.status}</TableCell>
                            <TableCell className="w-1/6">{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}</TableCell>
                            <TableCell className="w-1/6">{order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'N/A'}</TableCell>
                            <TableCell className="w-1/6">
                              <div className="flex gap-5">
                                <Tooltip text="Edit Order">
                                  <Edit className="w-5 h-5 text-[#55AC9A]" onClick={() => handleEditOrder(order)}/>
                                </Tooltip>
                                <Tooltip text="Delete Order">
                                  <Trash2 className="w-4 h-4 text-[#55AC9A]" onClick={() => handleDeleteOrder(order.id)}/>
                                </Tooltip>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
