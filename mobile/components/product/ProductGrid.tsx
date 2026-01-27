import React from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { ProductCard } from './ProductCard';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import type { Product } from '@/lib/types';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  emptyMessage?: string;
  onEndReached?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function ProductGrid({
  products,
  loading = false,
  emptyMessage = 'No products found',
  onEndReached,
  onRefresh,
  refreshing = false,
}: ProductGridProps) {
  if (loading && products.length === 0) {
    return <LoadingSpinner fullScreen message="Loading products..." />;
  }

  if (!loading && products.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      renderItem={({ item }) => <ProductCard product={item} />}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.columnWrapper}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      onRefresh={onRefresh}
      refreshing={refreshing}
      ListFooterComponent={
        loading && products.length > 0 ? (
          <View style={styles.footer}>
            <LoadingSpinner size="small" />
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
  },
  columnWrapper: {
    gap: 16,
    paddingHorizontal: 16,
  },
  contentContainer: {
    paddingVertical: 16,
  },
  footer: {
    paddingVertical: 16,
  },
});
