import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '@/lib/stores/useCartStore';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { Button } from '@/components/ui/Button';

export default function CartScreen() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();

  const subtotal = getTotalPrice();
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="cart-outline" size={48} color="#9ca3af" />
        </View>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>
          Browse our products and add items to your cart
        </Text>
        <Button
          title="Shop Now"
          onPress={() => router.push('/(tabs)/products')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onUpdateQuantity={(quantity) => updateQuantity(item.id, quantity)}
            onRemove={() => removeItem(item.id)}
          />
        ))}

        <TouchableOpacity onPress={clearCart} style={styles.clearCartButton}>
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
          <Text style={styles.clearCartText}>Clear Cart</Text>
        </TouchableOpacity>

        <CartSummary
          subtotal={subtotal}
          shipping={shipping}
          tax={tax}
          total={total}
        />

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.checkoutBar}>
        <Button
          title={`Checkout - $${total.toFixed(2)}`}
          size="lg"
          onPress={() => router.push('/checkout')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    padding: 32,
  },
  emptyIconContainer: {
    marginBottom: 16,
    borderRadius: 100,
    backgroundColor: '#e5e7eb',
    padding: 24,
  },
  emptyTitle: {
    marginBottom: 8,
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  emptySubtitle: {
    marginBottom: 24,
    textAlign: 'center',
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  clearCartButton: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  clearCartText: {
    marginLeft: 8,
    color: '#ef4444',
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
