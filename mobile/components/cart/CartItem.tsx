import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QuantitySelector } from '../ui/QuantitySelector';
import { formatPrice } from '@/lib/utils/formatters';
import type { CartItem as CartItemType } from '@/lib/types';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const hasCustomization = !!item.customization;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.imageContainer}>
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.noImage}>
              <Ionicons name="image-outline" size={24} color="#9ca3af" />
            </View>
          )}
        </View>

        <View style={styles.info}>
          <View style={styles.header}>
            <Text style={styles.name} numberOfLines={2}>
              {item.name}
            </Text>
            <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
              <Ionicons name="close" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <View style={styles.details}>
            <View style={[styles.colorDot, { backgroundColor: item.color.hex }]} />
            <Text style={styles.detailsText}>
              {item.color.name} • {item.size}
            </Text>
          </View>

          {hasCustomization && (
            <View style={styles.badgeContainer}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Custom Design</Text>
              </View>
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.price}>
              {formatPrice(item.price * item.quantity)}
            </Text>
            <QuantitySelector
              quantity={item.quantity}
              onIncrease={() => onUpdateQuantity(item.quantity + 1)}
              onDecrease={() => onUpdateQuantity(item.quantity - 1)}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
  },
  imageContainer: {
    width: 96,
    height: 96,
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  removeButton: {
    padding: 4,
  },
  details: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  detailsText: {
    fontSize: 14,
    color: '#6b7280',
  },
  badgeContainer: {
    marginTop: 4,
    flexDirection: 'row',
  },
  badge: {
    borderRadius: 4,
    backgroundColor: '#ecfeff',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 12,
    color: '#0891b2',
  },
  footer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0891b2',
  },
});
