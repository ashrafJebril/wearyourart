import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { ColorSwatch } from '@/components/ui/ColorSwatch';
import type { ProductColor } from '@/lib/types';

interface GarmentColorPickerProps {
  colors: ProductColor[];
  selectedColor: ProductColor;
  onSelect: (color: ProductColor) => void;
}

export function GarmentColorPicker({
  colors,
  selectedColor,
  onSelect,
}: GarmentColorPickerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Garment Color</Text>
        <View style={styles.selectedBadge}>
          <View style={[styles.selectedDot, { backgroundColor: selectedColor.hex }]} />
          <Text style={styles.selectedName}>{selectedColor.name}</Text>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {colors.map((color) => {
          const isSelected = selectedColor?.hex === color.hex;
          return (
            <ColorSwatch
              key={color.id || color.hex}
              color={color.hex}
              selected={isSelected}
              onPress={() => onSelect(color)}
              size="lg"
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  header: {
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  selectedDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  selectedName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#3c3c43',
  },
  scrollContent: {
    gap: 10,
  },
});
