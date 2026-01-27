import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';

interface PositionControlsProps {
  positionX: number;
  positionY: number;
  scale: number;
  rotation: number;
  onPositionXChange: (value: number) => void;
  onPositionYChange: (value: number) => void;
  onScaleChange: (value: number) => void;
  onRotationChange: (value: number) => void;
  onReset?: () => void;
  positionRange?: { min: number; max: number };
  scaleRange?: { min: number; max: number };
}

interface SliderRowProps {
  label: string;
  value: number;
  displayValue: string;
  icon: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}

function SliderRow({ label, value, displayValue, icon, min, max, step, onChange }: SliderRowProps) {
  return (
    <View style={styles.sliderSection}>
      <View style={styles.sliderHeader}>
        <View style={styles.labelRow}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon as any} size={14} color="#8e8e93" />
          </View>
          <Text style={styles.sliderLabel}>{label}</Text>
        </View>
        <View style={styles.valueContainer}>
          <Text style={styles.sliderValue}>{displayValue}</Text>
        </View>
      </View>
      <View style={styles.sliderContainer}>
        <Slider
          value={value}
          onValueChange={onChange}
          minimumValue={min}
          maximumValue={max}
          step={step}
          minimumTrackTintColor="#0891b2"
          maximumTrackTintColor="#e5e5ea"
          thumbTintColor="#0891b2"
          style={styles.slider}
        />
      </View>
    </View>
  );
}

export function PositionControls({
  positionX,
  positionY,
  scale,
  rotation,
  onPositionXChange,
  onPositionYChange,
  onScaleChange,
  onRotationChange,
  onReset,
  positionRange = { min: -50, max: 50 },
  scaleRange = { min: 0.1, max: 2 },
}: PositionControlsProps) {
  return (
    <View style={styles.container}>
      <SliderRow
        label="Horizontal"
        value={positionX}
        displayValue={positionX.toFixed(0)}
        icon="swap-horizontal"
        min={positionRange.min}
        max={positionRange.max}
        step={1}
        onChange={onPositionXChange}
      />

      <SliderRow
        label="Vertical"
        value={positionY}
        displayValue={positionY.toFixed(0)}
        icon="swap-vertical"
        min={positionRange.min}
        max={positionRange.max}
        step={1}
        onChange={onPositionYChange}
      />

      <SliderRow
        label="Scale"
        value={scale}
        displayValue={`${(scale * 100).toFixed(0)}%`}
        icon="resize"
        min={scaleRange.min}
        max={scaleRange.max}
        step={0.05}
        onChange={onScaleChange}
      />

      <SliderRow
        label="Rotation"
        value={rotation}
        displayValue={`${rotation.toFixed(0)}°`}
        icon="refresh"
        min={-180}
        max={180}
        step={5}
        onChange={onRotationChange}
      />

      {onReset && (
        <View style={styles.resetContainer}>
          <Button
            title="Reset Position"
            variant="outline"
            size="sm"
            onPress={onReset}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
  },
  sliderSection: {},
  sliderHeader: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#f5f5f7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3c3c43',
  },
  valueContainer: {
    backgroundColor: '#f5f5f7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  sliderValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0891b2',
  },
  sliderContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  slider: {
    height: 36,
  },
  resetContainer: {
    marginTop: 4,
  },
});
