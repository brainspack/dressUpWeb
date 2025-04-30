import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OrderStackParamList } from '../../navigation/types';
import Button from '../../components/Button';

type OrderListScreenNavigationProp = NativeStackNavigationProp<OrderStackParamList, 'OrderList'>;

type OrderStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  deliveryDate?: string;
}

const OrderList = () => {
  const navigation = useNavigation<OrderListScreenNavigationProp>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return '#f57c00';
      case 'in_progress':
        return '#1976d2';
      case 'completed':
        return '#2e7d32';
      case 'cancelled':
        return '#d32f2f';
      default:
        return '#666';
    }
  };

  const filteredOrders = selectedStatus === 'all'
    ? orders
    : orders.filter(order => order.status === selectedStatus);

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderItem}
      onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>
            {item.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>
      <Text style={styles.customerName}>{item.customerName}</Text>
      <Text style={styles.orderDate}>
        Ordered: {new Date(item.createdAt).toLocaleDateString()}
      </Text>
      {item.deliveryDate && (
        <Text style={styles.deliveryDate}>
          Delivery: {new Date(item.deliveryDate).toLocaleDateString()}
        </Text>
      )}
      <Text style={styles.totalAmount}>Total: ₹{item.totalAmount}</Text>
    </TouchableOpacity>
  );

  const StatusFilter = () => (
    <View style={styles.filterContainer}>
      <Button
        title="All"
        onPress={() => setSelectedStatus('all')}
        variant={selectedStatus === 'all' ? 'primary' : 'secondary'}
      />
      <Button
        title="Pending"
        onPress={() => setSelectedStatus('pending')}
        variant={selectedStatus === 'pending' ? 'primary' : 'secondary'}
      />
      <Button
        title="In Progress"
        onPress={() => setSelectedStatus('in_progress')}
        variant={selectedStatus === 'in_progress' ? 'primary' : 'secondary'}
      />
      <Button
        title="Completed"
        onPress={() => setSelectedStatus('completed')}
        variant={selectedStatus === 'completed' ? 'primary' : 'secondary'}
      />
      <Button
        title="Cancelled"
        onPress={() => setSelectedStatus('cancelled')}
        variant={selectedStatus === 'cancelled' ? 'primary' : 'secondary'}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Button
        title="Create New Order"
        onPress={() => navigation.navigate('AddOrder')}
        variant="primary"
        style={styles.addButton}
      />

      <StatusFilter />

      {loading ? (
        <Text style={styles.loading}>Loading orders...</Text>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No orders found</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  addButton: {
    margin: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  list: {
    padding: 16,
  },
  orderItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  customerName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  deliveryDate: {
    fontSize: 14,
    color: '#666',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
    marginTop: 8,
  },
  loading: {
    textAlign: 'center',
    marginTop: 24,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    color: '#666',
  },
});

export default OrderList; 