import { Pressable, PressableProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';



interface PressableIconProps extends PressableProps {
  name: keyof typeof Ionicons.glyphMap; 
  size?: number;
  active?: boolean;
  onPress?: () => void;
  activeColor?: string;
  inactiveColor?: string;
}

const PressableIcon = ({
  name,
  size = 24,
  active = false,
  onPress,
  activeColor = '#ff0000',
  inactiveColor = '#888888',
  ...props 
}: PressableIconProps) => {
  return (
    <Pressable onPress={onPress} {...props}>
      <Ionicons
        name={name}
        size={size}
        color={active ? activeColor : inactiveColor}
        style={{padding: 4, margin: 0}}
      />
    </Pressable>
  );
};

export default PressableIcon;