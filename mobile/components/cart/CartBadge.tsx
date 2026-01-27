import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useCartStore } from '@/lib/stores/useCartStore';

export function CartBadge() {
  const totalItems = useCartStore((state) => state.getTotalItems());

  if (totalItems === 0) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>
        {totalItems > 99 ? '99+' : totalItems}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -8,
    top: -8,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#0891b2',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
});
