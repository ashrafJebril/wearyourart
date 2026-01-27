import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ColorSwatchProps {
  color: string;
  selected?: boolean;
  onPress?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: { outer: 32, inner: 26, icon: 12 },
  md: { outer: 40, inner: 34, icon: 16 },
  lg: { outer: 48, inner: 42, icon: 20 },
};

export function ColorSwatch({
  color,
  selected = false,
  onPress,
  size = 'md',
}: ColorSwatchProps) {
  const dimensions = SIZES[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.outer,
        {
          width: dimensions.outer,
          height: dimensions.outer,
          borderColor: selected ? '#0891b2' : 'transparent',
          borderWidth: selected ? 2.5 : 0,
        },
        selected && styles.outerSelected,
      ]}
    >
      <View
        style={[
          styles.inner,
          {
            width: dimensions.inner,
            height: dimensions.inner,
            backgroundColor: color,
          },
          isLightColor(color) && styles.innerLight,
        ]}
      >
        {selected && (
          <View style={styles.checkContainer}>
            <Ionicons
              name="checkmark"
              size={dimensions.icon}
              color={isLightColor(color) ? '#000' : '#fff'}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

function isLightColor(color: string): boolean {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
}

const styles = StyleSheet.create({
  outer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    padding: 2,
  },
  outerSelected: {
    shadowColor: '#0891b2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  inner: {
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  innerLight: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  checkContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
