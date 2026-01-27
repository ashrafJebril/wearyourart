import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { ColorSwatch } from '../ui/ColorSwatch';
import type { ProductColor } from '@/lib/types';

interface ColorSelectorProps {
  colors: ProductColor[];
  selectedColor: ProductColor;
  onSelect: (color: ProductColor) => void;
  label?: string;
}

export function ColorSelector({
  colors,
  selectedColor,
  onSelect,
  label = 'Color',
}: ColorSelectorProps) {
  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.selectedName}>{selectedColor.name}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.swatchContainer}>
          {colors.map((color) => {
            const isSelected = selectedColor?.hex === color.hex;
            return (
              <ColorSwatch
                key={color.id || color.hex}
                color={color.hex}
                selected={isSelected}
                onPress={() => onSelect(color)}
                size="md"
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  selectedName: {
    fontSize: 14,
    color: '#6b7280',
  },
  swatchContainer: {
    flexDirection: 'row',
    gap: 12,
  },
});
