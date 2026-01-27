import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useOrderByNumber } from '@/lib/hooks/useOrders';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatPrice, formatDate, formatOrderStatus, getStatusColor } from '@/lib/utils/formatters';

export default function TrackOrderScreen() {
  const params = useLocalSearchParams<{ orderNumber?: string }>();
  const [orderNumber, setOrderNumber] = useState(params.orderNumber || '');
  const [searchNumber, setSearchNumber] = useState(params.orderNumber || '');

  const { data: order, isLoading, error } = useOrderByNumber(searchNumber);

  useEffect(() => {
    if (params.orderNumber) {
      setOrderNumber(params.orderNumber);
      setSearchNumber(params.orderNumber);
    }
  }, [params.orderNumber]);

  const handleSearch = () => {
    if (orderNumber.trim()) {
      setSearchNumber(orderNumber.trim());
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Search Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Track Your Order</Text>
          <Input
            placeholder="Enter order number (e.g., ORD-XXXX-XXXX)"
            value={orderNumber}
            onChangeText={setOrderNumber}
            autoCapitalize="characters"
          />
          <Button
            title="Track Order"
            onPress={handleSearch}
            loading={isLoading}
            style={styles.searchButton}
          />
        </View>

        {/* Loading State */}
        {isLoading && searchNumber && (
          <LoadingSpinner message="Finding your order..." />
        )}

        {/* Error State */}
        {error && searchNumber && !isLoading && (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
            <Text style={styles.errorTitle}>Order not found</Text>
            <Text style={styles.errorSubtitle}>
              Please check the order number and try again
            </Text>
          </View>
        )}

        {/* Order Details */}
        {order && !isLoading && (
          <View>
            {/* Status Card */}
            <View style={styles.card}>
              <View style={styles.orderNumberRow}>
                <Text style={styles.label}>Order Number</Text>
                <Text style={styles.value}>{order.orderNumber}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(order.status) + '20' },
                  ]}
                >
                  <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                    {formatOrderStatus(order.status)}
                  </Text>
                </View>
                <Text style={styles.dateText}>
                  Ordered on {formatDate(order.createdAt)}
                </Text>
              </View>
            </View>

            {/* Customer Info */}
            <View style={styles.card}>
              <Text style={styles.cardSubtitle}>Shipping Details</Text>
              <View style={styles.addressContainer}>
                <Text style={styles.customerName}>{order.customerName}</Text>
                <Text style={styles.customerEmail}>{order.customerEmail}</Text>
                <Text style={styles.addressLine}>{order.shippingAddress.street}</Text>
                <Text style={styles.addressLine}>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.zipCode}
                </Text>
                {order.shippingAddress.country && (
                  <Text style={styles.addressLine}>{order.shippingAddress.country}</Text>
                )}
              </View>
            </View>

            {/* Order Items */}
            <View style={styles.card}>
              <Text style={styles.cardSubtitle}>
                Order Items ({order.items.length})
              </Text>
              {order.items.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.orderItem,
                    index < order.items.length - 1 && styles.orderItemBorder,
                  ]}
                >
                  <View style={styles.orderItemInfo}>
                    <Text style={styles.itemName}>
                      {item.product?.name || `Product #${item.productId.slice(0, 8)}`}
                    </Text>
                    <Text style={styles.itemDetails}>
                      {item.color} • {item.size} • Qty: {item.quantity}
                    </Text>
                    {item.isCustomized && (
                      <View style={styles.customBadge}>
                        <Text style={styles.customBadgeText}>Custom Design</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.itemPrice}>
                    {formatPrice(item.price * item.quantity)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Order Total */}
            <View style={styles.card}>
              <Text style={styles.cardSubtitle}>Order Summary</Text>
              <View style={styles.summaryRows}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>{formatPrice(order.subtotal)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Shipping</Text>
                  <Text style={styles.summaryValue}>
                    {order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tax</Text>
                  <Text style={styles.summaryValue}>{formatPrice(order.tax)}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>{formatPrice(order.total)}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 16,
  },
  cardTitle: {
    marginBottom: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  cardSubtitle: {
    marginBottom: 12,
    fontWeight: '600',
    color: '#111827',
  },
  searchButton: {
    marginTop: 8,
  },
  errorCard: {
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#fef2f2',
    padding: 24,
  },
  errorTitle: {
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '500',
    color: '#dc2626',
  },
  errorSubtitle: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    color: '#6b7280',
  },
  orderNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
  },
  value: {
    fontWeight: '600',
    color: '#111827',
  },
  divider: {
    marginVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusBadge: {
    marginBottom: 8,
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statusText: {
    fontWeight: '600',
  },
  dateText: {
    fontSize: 14,
    color: '#6b7280',
  },
  addressContainer: {
    gap: 4,
  },
  customerName: {
    color: '#374151',
  },
  customerEmail: {
    color: '#6b7280',
  },
  addressLine: {
    marginTop: 8,
    color: '#374151',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  orderItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  orderItemInfo: {
    flex: 1,
  },
  itemName: {
    color: '#111827',
  },
  itemDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  customBadge: {
    marginTop: 4,
    alignSelf: 'flex-start',
    borderRadius: 4,
    backgroundColor: '#ecfeff',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  customBadgeText: {
    fontSize: 12,
    color: '#0891b2',
  },
  itemPrice: {
    fontWeight: '500',
    color: '#111827',
  },
  summaryRows: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: '#6b7280',
  },
  summaryValue: {
    color: '#111827',
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
});
