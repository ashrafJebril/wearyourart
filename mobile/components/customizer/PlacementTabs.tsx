import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { PlacementArea } from '@/lib/stores/useCustomizerStore';

interface PlacementTabsProps {
  activePlacement: PlacementArea;
  onSelect: (placement: PlacementArea) => void;
}

const placements: { id: PlacementArea; label: string; icon: string }[] = [
  { id: 'front', label: 'Front', icon: 'shirt-outline' },
  { id: 'back', label: 'Back', icon: 'shirt' },
  { id: 'leftShoulder', label: 'Left Sleeve', icon: 'arrow-back-circle-outline' },
  { id: 'rightShoulder', label: 'Right Sleeve', icon: 'arrow-forward-circle-outline' },
];

export function PlacementTabs({ activePlacement, onSelect }: PlacementTabsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.tabsRow}>
        {placements.map((placement) => {
          const isActive = activePlacement === placement.id;
          return (
            <TouchableOpacity
              key={placement.id}
              onPress={() => onSelect(placement.id)}
              style={[styles.tab, isActive && styles.tabActive]}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
                <Ionicons
                  name={placement.icon as any}
                  size={20}
                  color={isActive ? '#0891b2' : '#9ca3af'}
                />
              </View>
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {placement.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
  },
  tabActive: {
    backgroundColor: '#ecfeff',
    borderWidth: 1,
    borderColor: '#a5f3fc',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  iconContainerActive: {
    backgroundColor: '#cffafe',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#0891b2',
    fontWeight: '600',
  },
});
