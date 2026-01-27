import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatPrice } from '@/lib/utils/formatters';

interface CartSummaryProps {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export function CartSummary({ subtotal, shipping, tax, total }: CartSummaryProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Summary</Text>

      <View style={styles.rows}>
        <View style={styles.row}>
          <Text style={styles.label}>Subtotal</Text>
          <Text style={styles.value}>{formatPrice(subtotal)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Shipping</Text>
          <Text style={styles.value}>
            {shipping === 0 ? 'Free' : formatPrice(shipping)}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Tax</Text>
          <Text style={styles.value}>{formatPrice(tax)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(total)}</Text>
        </View>
      </View>

      {shipping === 0 && (
        <View style={styles.freeShippingBanner}>
          <Text style={styles.freeShippingText}>
            You qualify for free shipping!
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    marginBottom: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  rows: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: '#6b7280',
  },
  value: {
    color: '#111827',
  },
  divider: {
    marginVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0891b2',
  },
  freeShippingBanner: {
    marginTop: 12,
    borderRadius: 8,
    backgroundColor: '#f0fdf4',
    padding: 8,
  },
  freeShippingText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#15803d',
  },
});
