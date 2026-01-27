import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ColorSwatch } from '@/components/ui/ColorSwatch';
import { AVAILABLE_FONTS } from '@/lib/constants/fonts';
import { TEXT_COLORS } from '@/lib/constants/colors';

interface TextCustomizerProps {
  textValue: string;
  textFont: string;
  textColor: string;
  maxLength?: number;
  onTextChange: (text: string) => void;
  onFontChange: (font: string) => void;
  onColorChange: (color: string) => void;
}

export function TextCustomizer({
  textValue,
  textFont,
  textColor,
  maxLength = 30,
  onTextChange,
  onFontChange,
  onColorChange,
}: TextCustomizerProps) {
  return (
    <View style={styles.container}>
      {/* Text Input */}
      <View style={styles.section}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Custom Text</Text>
          <Text style={styles.counter}>
            {textValue.length}/{maxLength}
          </Text>
        </View>
        <TextInput
          value={textValue}
          onChangeText={(text) => onTextChange(text.slice(0, maxLength))}
          placeholder="Enter your text..."
          maxLength={maxLength}
          style={styles.input}
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* Font Selector */}
      <View style={styles.section}>
        <Text style={styles.label}>Font</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
        >
          <View style={styles.fontsRow}>
            {AVAILABLE_FONTS.map((font) => (
              <TouchableOpacity
                key={font.value}
                onPress={() => onFontChange(font.value)}
                style={[
                  styles.fontButton,
                  textFont === font.value && styles.fontButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.fontText,
                    textFont === font.value && styles.fontTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {font.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Color Selector */}
      <View style={styles.section}>
        <Text style={styles.label}>Text Color</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.colorsRow}>
            {TEXT_COLORS.map((color) => (
              <ColorSwatch
                key={color.hex}
                color={color.hex}
                selected={textColor === color.hex}
                onPress={() => onColorChange(color.hex)}
                size="md"
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  section: {},
  labelRow: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    marginBottom: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#3c3c43',
  },
  counter: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8e8e93',
    backgroundColor: '#f5f5f7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1c1c1e',
  },
  horizontalScroll: {
    marginHorizontal: -18,
    paddingHorizontal: 18,
  },
  fontsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  fontButton: {
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e5e5ea',
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  fontButtonActive: {
    borderColor: '#0891b2',
    backgroundColor: '#ecfeff',
  },
  fontText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3c3c43',
  },
  fontTextActive: {
    color: '#0891b2',
    fontWeight: '600',
  },
  colorsRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
