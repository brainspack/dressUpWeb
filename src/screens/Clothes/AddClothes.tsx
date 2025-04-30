import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../../navigation/types';
import Button from '../../components/Button';
import Input from '../../components/Input';
import MediaUploader from '../../components/MediaUploader';

type AddClothesScreenNavigationProp = NativeStackNavigationProp<MainTabParamList, 'AddClothes'>;

interface ClothesForm {
  name: string;
  type: string;
  description: string;
  price: string;
  size: string;
  color: string;
  material: string;
  imageUri?: string;
  videoUri?: string;
  notes?: string;
}

const AddClothes = () => {
  const navigation = useNavigation<AddClothesScreenNavigationProp>();
  const [form, setForm] = useState<ClothesForm>({
    name: '',
    type: '',
    description: '',
    price: '',
    size: '',
    color: '',
    material: '',
  });
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!form.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return false;
    }
    if (!form.type.trim()) {
      Alert.alert('Error', 'Type is required');
      return false;
    }
    if (!form.price.trim()) {
      Alert.alert('Error', 'Price is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) {
          if (key === 'imageUri' || key === 'videoUri') {
            formData.append(key, {
              uri: value,
              type: key === 'imageUri' ? 'image/jpeg' : 'video/mp4',
              name: key === 'imageUri' ? 'photo.jpg' : 'video.mp4',
            });
          } else {
            formData.append(key, value);
          }
        }
      });

      const response = await fetch('/api/clothes', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to add clothes');

      Alert.alert('Success', 'Clothes added successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to add clothes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Input
          label="Name"
          value={form.name}
          onChangeText={(text) => setForm({ ...form, name: text })}
          placeholder="Enter clothes name"
        />
        <Input
          label="Type"
          value={form.type}
          onChangeText={(text) => setForm({ ...form, type: text })}
          placeholder="Enter clothes type"
        />
        <Input
          label="Description"
          value={form.description}
          onChangeText={(text) => setForm({ ...form, description: text })}
          placeholder="Enter description"
          multiline
        />
        <Input
          label="Price"
          value={form.price}
          onChangeText={(text) => setForm({ ...form, price: text })}
          placeholder="Enter price"
          keyboardType="numeric"
        />
        <Input
          label="Size"
          value={form.size}
          onChangeText={(text) => setForm({ ...form, size: text })}
          placeholder="Enter size"
        />
        <Input
          label="Color"
          value={form.color}
          onChangeText={(text) => setForm({ ...form, color: text })}
          placeholder="Enter color"
        />
        <Input
          label="Material"
          value={form.material}
          onChangeText={(text) => setForm({ ...form, material: text })}
          placeholder="Enter material"
        />

        <View style={styles.mediaSection}>
          <Text style={styles.sectionTitle}>Media</Text>
          <View style={styles.mediaButtons}>
            <MediaUploader
              label="Add Image"
              value={form.imageUri}
              onChange={uri => setForm({ ...form, imageUri: uri })}
              type="image"
            />
            <MediaUploader
              label="Add Video"
              value={form.videoUri}
              onChange={uri => setForm({ ...form, videoUri: uri })}
              type="video"
            />
          </View>
        </View>

        <Input
          label="Notes"
          value={form.notes}
          onChangeText={(text) => setForm({ ...form, notes: text })}
          placeholder="Enter any additional notes"
          multiline
        />

        <Button
          title="Add Clothes"
          onPress={handleSubmit}
          variant="primary"
          style={styles.submitButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    padding: 16,
    gap: 16,
  },
  mediaSection: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  submitButton: {
    marginTop: 8,
  },
});

export default AddClothes; 