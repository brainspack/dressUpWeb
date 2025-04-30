import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../navigation/types';
import Button from '../components/Button';

type HomeScreenNavigationProp = NativeStackNavigationProp<MainTabParamList, 'Home'>;

const Home = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Welcome to DressUp</Text>
        <Text style={styles.subtitle}>Your Fashion Management App</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.buttonGrid}>
          <Button
            title="New Customer"
            onPress={() => navigation.navigate('Customers')}
            variant="primary"
          />
          <Button
            title="New Order"
            onPress={() => navigation.navigate('Orders')}
            variant="primary"
          />
          <Button
            title="Add Clothes"
            onPress={() => navigation.navigate('Clothes')}
            variant="primary"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityList}>
          {/* Add your activity list items here */}
          <Text style={styles.activityItem}>No recent activity</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  buttonGrid: {
    gap: 12,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    fontSize: 14,
    color: '#666',
  },
});

export default Home; 