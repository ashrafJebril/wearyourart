import React from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils/formatters';

interface ProductCardProps {
  product: Product;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/product/${product.id}`)}
      style={[styles.container, { width: cardWidth }]}
    >
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          {product.images?.[0] ? (
            <Image
              source={{ uri: product.images[0] }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.noImage}>
              <Ionicons name="image-outline" size={32} color="#cbd5e1" />
            </View>
          )}
          {product.customizable && (
            <View style={styles.badge}>
              <Ionicons name="brush" size={10} color="#fff" />
              <Text style={styles.badgeText}>Customize</Text>
            </View>
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {product.name}
          </Text>

          <Text style={styles.price}>{formatPrice(product.basePrice)}</Text>

          {product.colors && product.colors.length > 0 && (
            <View style={styles.colorsRow}>
              {product.colors.slice(0, 4).map((color) => (
                <View
                  key={color.id}
                  style={[styles.colorDot, { backgroundColor: color.hex }]}
                />
              ))}
              {product.colors.length > 4 && (
                <Text style={styles.moreColors}>+{product.colors.length - 4}</Text>
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    aspectRatio: 1,
    backgroundColor: '#f1f5f9',
    position: 'relative',
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
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: '#0891b2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  price: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '700',
    color: '#0891b2',
  },
  colorsRow: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  moreColors: {
    fontSize: 11,
    color: '#64748b',
    marginLeft: 2,
  },
});
