import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProduct } from '@/lib/hooks/useProducts';
import { useCartStore } from '@/lib/stores/useCartStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { ColorSelector } from '@/components/product/ColorSelector';
import { SizeSelector } from '@/components/ui/SizeSelector';
import { formatPrice } from '@/lib/utils/formatters';
import type { ProductColor } from '@/lib/types';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: product, isLoading, error } = useProduct(id);
  const addItem = useCartStore((state) => state.addItem);

  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  React.useEffect(() => {
    if (product?.colors && product.colors.length > 0 && !selectedColor) {
      setSelectedColor(product.colors[0]);
    }
  }, [product]);

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading product..." />;
  }

  if (error || !product) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>Failed to load product</Text>
        <Button
          title="Go Back"
          variant="outline"
          style={styles.errorButton}
          onPress={() => router.back()}
        />
      </View>
    );
  }

  const handleAddToCart = () => {
    if (!selectedColor) return;

    addItem({
      productId: product.id,
      name: product.name,
      color: selectedColor,
      size: selectedSize,
      quantity: 1,
      price: product.basePrice,
      image: product.images?.[0] || '',
    });

    router.push('/(tabs)/cart');
  };

  const handleCustomize = () => {
    router.push(`/customize/${product.id}`);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Image Gallery */}
        <View style={styles.imageGallery}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
          >
            {product.images && product.images.length > 0 ? (
              product.images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={{ width, height: width }}
                  resizeMode="cover"
                />
              ))
            ) : (
              <View style={[styles.noImageContainer, { width, height: width }]}>
                <Ionicons name="image-outline" size={64} color="#9ca3af" />
              </View>
            )}
          </ScrollView>

          {product.images && product.images.length > 1 && (
            <View style={styles.imageIndicators}>
              {product.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    index === currentImageIndex && styles.indicatorActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(product.basePrice)}</Text>
            {product.customizable && (
              <View style={styles.customBadge}>
                <Text style={styles.customBadgeText}>
                  +{formatPrice(product.customizationPrice)} for custom
                </Text>
              </View>
            )}
          </View>

          {product.description && (
            <Text style={styles.description}>{product.description}</Text>
          )}

          {product.colors && product.colors.length > 0 && selectedColor && (
            <View style={styles.section}>
              <ColorSelector
                colors={product.colors}
                selectedColor={selectedColor}
                onSelect={setSelectedColor}
              />
            </View>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Size</Text>
              <SizeSelector
                sizes={product.sizes}
                selectedSize={selectedSize}
                onSelect={setSelectedSize}
              />
            </View>
          )}

          {product.features && product.features.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Features</Text>
              {product.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.stockRow}>
            <View
              style={[
                styles.stockDot,
                { backgroundColor: product.inStock ? '#22c55e' : '#ef4444' },
              ]}
            />
            <Text
              style={[
                styles.stockText,
                { color: product.inStock ? '#16a34a' : '#dc2626' },
              ]}
            >
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </Text>
          </View>

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.actionBar}>
        <Button
          title="Add to Cart"
          variant="secondary"
          style={styles.actionButton}
          onPress={handleAddToCart}
          disabled={!product.inStock}
        />
        {product.customizable && (
          <Button
            title="Customize"
            style={styles.actionButton}
            onPress={handleCustomize}
            disabled={!product.inStock}
            icon={<Ionicons name="color-palette" size={18} color="#fff" />}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#6b7280',
  },
  errorButton: {
    marginTop: 16,
  },
  imageGallery: {
    backgroundColor: '#f3f4f6',
  },
  noImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
  },
  indicatorActive: {
    backgroundColor: '#0891b2',
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  priceRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0891b2',
  },
  customBadge: {
    marginLeft: 12,
    borderRadius: 4,
    backgroundColor: '#ecfeff',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  customBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0891b2',
  },
  description: {
    marginTop: 16,
    color: '#6b7280',
  },
  section: {
    marginTop: 24,
  },
  sectionLabel: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  featureRow: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    marginLeft: 8,
    color: '#6b7280',
  },
  stockRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stockText: {
    marginLeft: 8,
    fontSize: 14,
  },
  bottomSpacer: {
    height: 128,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
    padding: 16,
  },
  actionButton: {
    flex: 1,
  },
});
