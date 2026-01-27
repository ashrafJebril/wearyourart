import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProducts } from '@/lib/hooks/useProducts';
import { useCategories } from '@/lib/hooks/useCategories';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatPrice } from '@/lib/utils/formatters';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

export default function HomeScreen() {
  const router = useRouter();
  const { data: productsData, isLoading: productsLoading } = useProducts({ limit: 4 });
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const products = productsData?.products || [];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <View style={styles.heroOverlay}>
          <Text style={styles.heroTagline}>CUSTOM APPAREL</Text>
          <Text style={styles.heroTitle}>Design Your{'\n'}Perfect Style</Text>
          <Text style={styles.heroSubtitle}>
            Premium hoodies & t-shirts with your unique artwork
          </Text>
          <TouchableOpacity
            style={styles.heroButton}
            onPress={() => router.push('/(tabs)/products')}
          >
            <Text style={styles.heroButtonText}>Explore Collection</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => router.push('/(tabs)/products')}
          >
            <Text style={styles.seeAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={16} color="#0891b2" />
          </TouchableOpacity>
        </View>

        {categoriesLoading ? (
          <LoadingSpinner size="small" />
        ) : (
          <View style={styles.categoriesGrid}>
            {categories?.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => router.push(`/(tabs)/products?category=${category.slug}`)}
                style={styles.categoryCard}
              >
                <View style={styles.categoryImageContainer}>
                  {category.image ? (
                    <Image
                      source={{ uri: category.image }}
                      style={styles.categoryImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.categoryPlaceholder}>
                      <Ionicons name="shirt-outline" size={28} color="#94a3b8" />
                    </View>
                  )}
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Ionicons name="arrow-forward-circle" size={20} color="#0891b2" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Featured Products Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured</Text>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => router.push('/(tabs)/products')}
          >
            <Text style={styles.seeAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={16} color="#0891b2" />
          </TouchableOpacity>
        </View>

        {productsLoading ? (
          <LoadingSpinner size="small" />
        ) : products.length === 0 ? (
          <View style={styles.emptyProducts}>
            <Ionicons name="cube-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>No products available</Text>
          </View>
        ) : (
          <View style={styles.productsGrid}>
            {products.map((product) => (
              <TouchableOpacity
                key={product.id}
                onPress={() => router.push(`/product/${product.id}`)}
                style={[styles.productCard, { width: cardWidth }]}
              >
                <View style={styles.productImageContainer}>
                  {product.images?.[0] ? (
                    <Image
                      source={{ uri: product.images[0] }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.productPlaceholder}>
                      <Ionicons name="image-outline" size={32} color="#cbd5e1" />
                    </View>
                  )}
                  {product.customizable && (
                    <View style={styles.customizeBadge}>
                      <Ionicons name="brush" size={12} color="#fff" />
                      <Text style={styles.customizeBadgeText}>Customize</Text>
                    </View>
                  )}
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text style={styles.productPrice}>
                    {formatPrice(product.basePrice)}
                  </Text>
                  {product.colors && product.colors.length > 0 && (
                    <View style={styles.productColors}>
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
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Customization CTA */}
      <View style={styles.ctaSection}>
        <View style={styles.ctaCard}>
          <View style={styles.ctaIconWrapper}>
            <Ionicons name="color-palette" size={32} color="#0891b2" />
          </View>
          <Text style={styles.ctaTitle}>Create Your Design</Text>
          <Text style={styles.ctaSubtitle}>
            Upload artwork, add text, and preview in 3D before ordering
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push('/(tabs)/products')}
          >
            <Text style={styles.ctaButtonText}>Start Designing</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Track Order Section */}
      <TouchableOpacity
        style={styles.trackOrderCard}
        onPress={() => router.push('/track-order')}
      >
        <View style={styles.trackOrderIcon}>
          <Ionicons name="locate" size={22} color="#0891b2" />
        </View>
        <View style={styles.trackOrderContent}>
          <Text style={styles.trackOrderTitle}>Track Your Order</Text>
          <Text style={styles.trackOrderSubtitle}>Check delivery status</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
      </TouchableOpacity>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  // Hero
  hero: {
    height: 280,
    backgroundColor: '#0f172a',
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(8, 145, 178, 0.15)',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  heroTagline: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22d3ee',
    letterSpacing: 2,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 40,
  },
  heroSubtitle: {
    marginTop: 12,
    fontSize: 15,
    color: '#94a3b8',
    lineHeight: 22,
  },
  heroButton: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#0891b2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  heroButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  // Section
  section: {
    paddingHorizontal: 16,
    paddingTop: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0891b2',
  },
  // Categories
  categoriesGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
    marginBottom: 12,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  // Products
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  productImageContainer: {
    aspectRatio: 1,
    backgroundColor: '#f1f5f9',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customizeBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0891b2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  customizeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  productInfo: {
    padding: 14,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  productPrice: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '700',
    color: '#0891b2',
  },
  productColors: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  emptyProducts: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 15,
  },
  // CTA
  ctaSection: {
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  ctaCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  ctaIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ecfeff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  ctaButton: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  // Track Order
  trackOrderCard: {
    marginHorizontal: 16,
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  trackOrderIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ecfeff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  trackOrderContent: {
    flex: 1,
  },
  trackOrderTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  trackOrderSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  footer: {
    height: 32,
  },
});
