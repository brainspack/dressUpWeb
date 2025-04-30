import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OrderItem } from '../../types/order';

interface OrderForm {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: OrderItem[];
  notes: string;
}

const AddOrder = () => {
  const navigation = useNavigation();
  const [form, setForm] = useState<OrderForm>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    items: [],
    notes: '',
  });

  const handleSubmit = () => {
    // TODO: Implement order creation logic
    console.log('Creating order:', form);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Information</Text>
        <TextInput
          style={styles.input}
          placeholder="Customer Name"
          value={form.customerName}
          onChangeText={(text) => setForm({ ...form, customerName: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={form.customerPhone}
          onChangeText={(text) => setForm({ ...form, customerPhone: text })}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={form.customerEmail}
          onChangeText={(text) => setForm({ ...form, customerEmail: text })}
          keyboardType="email-address"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        <TouchableOpacity style={styles.addItemButton}>
          <Text style={styles.addItemButtonText}>+ Add Item</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="Add any special instructions or notes"
          value={form.notes}
          onChangeText={(text) => setForm({ ...form, notes: text })}
          multiline
          numberOfLines={4}
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Create Order</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  addItemButton: {
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  addItemButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    margin: 16,
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddOrder; 