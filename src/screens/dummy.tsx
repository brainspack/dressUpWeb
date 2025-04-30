import { View } from 'react-native';
import Input from '../components/Input';
import Dropdown from '../components/Dropdown';
import DatePicker from '../components/DatePicker';
import ImageUploader from '../components/ImageUploader';
import StatusBadge from '../components/StatusBadge';
import { useState } from 'react';

// Example usage:
const DummyScreen = () => {
    const [emailError, setEmailError] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [imageUri, setImageUri] = useState('');
  
  return (
    <View>
      <Input 
        label="Email"
        placeholder="Enter your email"
        error={emailError}
      />
      <Dropdown
        label="Category"
        value={selectedCategory}
        options={[
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2' },
        ]}
        onChange={setSelectedCategory}
      />
      <DatePicker
        label="Date"
        value={selectedDate}
        onChange={setSelectedDate}
      />
      <ImageUploader
        label="Profile Picture"
        value={imageUri}
        onChange={setImageUri}
      />
      <StatusBadge
        status="success"
        label="Completed"
        size="medium"
      />
    </View>
  );
};

export default DummyScreen;