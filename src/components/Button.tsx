// components/Button.tsx
import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary';
}

const Button = ({ title, onPress, variant = "primary" }: ButtonProps) => (
  <TouchableOpacity
    style={{
      backgroundColor: variant === 'primary' ? '#4A90E2' : '#ccc',
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
    }}
    onPress={onPress}
  >
    <Text style={{ color: '#fff', fontWeight: 'bold' }}>{title}</Text>
  </TouchableOpacity>
);

export default Button; 