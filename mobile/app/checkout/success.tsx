import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';

export default function OrderSuccessScreen() {
  const { orderNumber } = useLocalSearchParams<{ orderNumber: string }>();
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Success Icon */}
      <View style={styles.iconContainer}>
        <Ionicons name="checkmark-circle" size={64} color="#22c55e" />
      </View>

      {/* Success Message */}
      <Text style={styles.title}>Order Confirmed!</Text>
      <Text style={styles.subtitle}>
        Thank you for your order. We've received your order and will begin
        processing it soon.
      </Text>

      {/* Order Number */}
      <View style={styles.orderNumberCard}>
        <Text style={styles.orderNumberLabel}>Order Number</Text>
        <Text style={styles.orderNumber}>{orderNumber}</Text>
      </View>

      {/* Info */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={24} color="#0891b2" />
          <Text style={styles.infoText}>
            A confirmation email will be sent to your email address with order
            details.
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttons}>
        <Button
          title="Track Order"
          onPress={() =>
            router.replace({
              pathname: '/track-order',
              params: { orderNumber },
            })
          }
        />
        <Button
          title="Continue Shopping"
          variant="outline"
          style={styles.secondaryButton}
          onPress={() => router.replace('/(tabs)/products')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 32,
  },
  iconContainer: {
    marginBottom: 24,
    borderRadius: 100,
    backgroundColor: '#dcfce7',
    padding: 24,
  },
  title: {
    marginBottom: 8,
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    marginBottom: 24,
    textAlign: 'center',
    color: '#6b7280',
  },
  orderNumberCard: {
    marginBottom: 32,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  orderNumberLabel: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6b7280',
  },
  orderNumber: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#0891b2',
  },
  infoCard: {
    marginBottom: 32,
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#ecfeff',
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 12,
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  secondaryButton: {
    marginTop: 0,
  },
});
