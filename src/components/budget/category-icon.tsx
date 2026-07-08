import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

type CategoryIconProps = {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  size?: number;
  iconSize?: number;
  selected?: boolean;
};

export function CategoryIcon({ icon: Icon, color, bgColor, size = 42, iconSize, selected }: CategoryIconProps) {
  return (
    <View
      style={[
        styles.bubble,
        {
          width: size,
          height: size,
          borderRadius: size * 0.31,
          backgroundColor: bgColor,
          borderWidth: selected ? 2 : 0,
          borderColor: color,
        },
      ]}>
      <Icon size={iconSize ?? size * 0.5} color={color} strokeWidth={1.9} />
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
