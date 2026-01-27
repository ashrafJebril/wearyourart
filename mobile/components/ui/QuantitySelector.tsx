import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
}

export function QuantitySelector({
  quantity,
  onIncrease,
  onDecrease,
  min = 1,
  max = 99,
}: QuantitySelectorProps) {
  const canDecrease = quantity > min;
  const canIncrease = quantity < max;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onDecrease}
        disabled={!canDecrease}
        style={[styles.button, !canDecrease && styles.disabled]}
      >
        <Ionicons name="remove" size={20} color="#6b7280" />
      </TouchableOpacity>

      <View style={styles.quantityContainer}>
        <Text style={styles.quantityText}>{quantity}</Text>
      </View>

      <TouchableOpacity
        onPress={onIncrease}
        disabled={!canIncrease}
        style={[styles.button, !canIncrease && styles.disabled]}
      >
        <Ionicons name="add" size={20} color="#6b7280" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  button: {
    padding: 8,
  },
  disabled: {
    opacity: 0.3,
  },
  quantityContainer: {
    minWidth: 40,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
});
