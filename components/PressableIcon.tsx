import { Ionicons } from '@expo/vector-icons';
import { Pressable, PressableProps, View } from 'react-native';



interface PressableIconProps extends PressableProps {
  name: keyof typeof Ionicons.glyphMap; 
  size?: number;
  active?: boolean;
  onPress?: () => void;
  activeColor?: string;
  inactiveColor?: string;
  showDot?: boolean;
}

const PressableIcon = ({
  name,
  size = 24,
  active = false,
  onPress,
  activeColor = '#ff0000',
  inactiveColor = '#888888',
  showDot = false,
  ...props 
}: PressableIconProps) => {
  return (
    <Pressable onPress={onPress} {...props}>
      <View style={{ position: 'relative' }}>
        <Ionicons
          name={name}
          size={size}
          color={active ? activeColor : inactiveColor}
          style={{ padding: 4, margin: 0 }}
        />
        {showDot && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: '#ef4444',
              borderWidth: 1,
              borderColor: 'white',
            }}
          />
        )}
      </View>
    </Pressable>
  );
};

export default PressableIcon;