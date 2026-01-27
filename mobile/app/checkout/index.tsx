import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '@/lib/stores/useCartStore';
import { useCreateOrder } from '@/lib/hooks/useOrders';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CartSummary } from '@/components/cart/CartSummary';
import type { ShippingInfo } from '@/lib/types';

const initialShippingInfo: ShippingInfo = {
  firstName: '',
  lastName: '',
  email: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'United States',
};

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const createOrder = useCreateOrder();

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>(initialShippingInfo);
  const [errors, setErrors] = useState<Partial<ShippingInfo>>({});

  const subtotal = Number(getTotalPrice()) || 0;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = Number((subtotal * 0.08).toFixed(2));
  const total = Number((subtotal + shipping + tax).toFixed(2));

  const updateField = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ShippingInfo> = {};

    if (!shippingInfo.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!shippingInfo.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!shippingInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(shippingInfo.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!shippingInfo.address.trim()) newErrors.address = 'Address is required';
    if (!shippingInfo.city.trim()) newErrors.city = 'City is required';
    if (!shippingInfo.state.trim()) newErrors.state = 'State is required';
    if (!shippingInfo.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    try {
      const orderData = {
        customerName: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        customerEmail: shippingInfo.email,
        shippingAddress: {
          street: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          zipCode: shippingInfo.zipCode,
          country: shippingInfo.country,
        },
        items: items.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity) || 1,
          color: item.color.name,
          size: item.size,
          price: Number(item.price) || 0,
          customization: item.customization,
          isCustomized: !!item.customization,
        })),
        subtotal,
        shipping,
        tax,
        total,
      };

      const order = await createOrder.mutateAsync(orderData);

      clearCart();
      router.replace({
        pathname: '/checkout/success',
        params: { orderNumber: order.orderNumber },
      });
    } catch (error) {
      Alert.alert(
        'Order Failed',
        'There was a problem placing your order. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  if (items.length === 0) {
    router.replace('/(tabs)/cart');
    return null;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Shipping Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Shipping Information</Text>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="First Name"
                value={shippingInfo.firstName}
                onChangeText={(v) => updateField('firstName', v)}
                error={errors.firstName}
                autoCapitalize="words"
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="Last Name"
                value={shippingInfo.lastName}
                onChangeText={(v) => updateField('lastName', v)}
                error={errors.lastName}
                autoCapitalize="words"
              />
            </View>
          </View>

          <Input
            label="Email"
            value={shippingInfo.email}
            onChangeText={(v) => updateField('email', v)}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Street Address"
            value={shippingInfo.address}
            onChangeText={(v) => updateField('address', v)}
            error={errors.address}
          />

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="City"
                value={shippingInfo.city}
                onChangeText={(v) => updateField('city', v)}
                error={errors.city}
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="State"
                value={shippingInfo.state}
                onChangeText={(v) => updateField('state', v)}
                error={errors.state}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="ZIP Code"
                value={shippingInfo.zipCode}
                onChangeText={(v) => updateField('zipCode', v)}
                error={errors.zipCode}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="Country"
                value={shippingInfo.country}
                onChangeText={(v) => updateField('country', v)}
              />
            </View>
          </View>
        </View>

        {/* Order Items Preview */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Items ({items.length})</Text>
          {items.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <View style={styles.orderItemInfo}>
                <Text style={styles.orderItemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.orderItemDetails}>
                  {item.color.name} • {item.size} • Qty: {item.quantity}
                </Text>
              </View>
              <Text style={styles.orderItemPrice}>
                ${(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Order Summary */}
        <CartSummary
          subtotal={subtotal}
          shipping={shipping}
          tax={tax}
          total={total}
        />

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.checkoutBar}>
        <Button
          title="Place Order"
          size="lg"
          onPress={handlePlaceOrder}
          loading={createOrder.isPending}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    marginBottom: 24,
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
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfInput: {
    flex: 1,
  },
  orderItem: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 8,
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    color: '#111827',
  },
  orderItemDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  orderItemPrice: {
    fontWeight: '500',
    color: '#111827',
  },
  bottomSpacer: {
    height: 96,
  },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
    padding: 16,
  },
});
