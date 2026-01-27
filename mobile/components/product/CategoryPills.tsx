import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import type { Category } from '@/lib/types';

interface CategoryPillsProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelect: (categorySlug: string | null) => void;
}

export function CategoryPills({
  categories,
  selectedCategory,
  onSelect,
}: CategoryPillsProps) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
        style={styles.scrollView}
      >
        <TouchableOpacity
          onPress={() => onSelect(null)}
          style={[styles.pill, selectedCategory === null && styles.pillSelected]}
        >
          <Text style={[styles.pillText, selectedCategory === null && styles.pillTextSelected]}>
            All
          </Text>
        </TouchableOpacity>

        {categories.map((category) => {
          const isSelected = selectedCategory === category.slug;
          return (
            <TouchableOpacity
              key={category.id}
              onPress={() => onSelect(category.slug)}
              style={[styles.pill, isSelected && styles.pillSelected]}
            >
              <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  scrollView: {
    flexGrow: 0,
    flexShrink: 0,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillSelected: {
    backgroundColor: '#0891b2',
  },
  pillText: {
    fontWeight: '500',
    color: '#64748b',
    fontSize: 14,
  },
  pillTextSelected: {
    color: '#fff',
  },
});
