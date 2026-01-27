import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useProducts } from '@/lib/hooks/useProducts';
import { useCategories } from '@/lib/hooks/useCategories';
import { ProductGrid } from '@/components/product/ProductGrid';
import { CategoryPills } from '@/components/product/CategoryPills';

export default function ProductsScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    params.category || null
  );

  const { data: categoriesData } = useCategories();
  const {
    data: productsData,
    isLoading,
    refetch,
    isRefetching,
  } = useProducts({
    category: selectedCategory || undefined,
  });

  const categories = categoriesData || [];
  const products = productsData?.products || [];

  const handleCategorySelect = useCallback((categorySlug: string | null) => {
    setSelectedCategory(categorySlug);
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <View style={styles.container}>
      <CategoryPills
        categories={categories}
        selectedCategory={selectedCategory}
        onSelect={handleCategorySelect}
      />
      <ProductGrid
        products={products}
        loading={isLoading}
        onRefresh={handleRefresh}
        refreshing={isRefetching}
        emptyMessage={
          selectedCategory
            ? 'No products in this category'
            : 'No products available'
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
});
