import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string;
  onSelect: (size: string) => void;
}

export function SizeSelector({ sizes, selectedSize, onSelect }: SizeSelectorProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {sizes.map((size) => {
        const isSelected = selectedSize === size;
        return (
          <TouchableOpacity
            key={size}
            onPress={() => onSelect(size)}
            style={[styles.button, isSelected && styles.buttonSelected]}
            activeOpacity={0.7}
          >
            <Text style={[styles.text, isSelected && styles.textSelected]}>
              {size}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: 10,
  },
  button: {
    minWidth: 52,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e5e5ea',
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 16,
  },
  buttonSelected: {
    borderColor: '#0891b2',
    backgroundColor: '#0891b2',
    shadowColor: '#0891b2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3c3c43',
  },
  textSelected: {
    color: '#fff',
  },
});
