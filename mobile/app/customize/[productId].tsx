import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useProduct } from '@/lib/hooks/useProducts';
import { useCartStore } from '@/lib/stores/useCartStore';
import { useCustomizerStore, PlacementArea } from '@/lib/stores/useCustomizerStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { SizeSelector } from '@/components/ui/SizeSelector';
import {
  ProductCanvas3D,
  PlacementTabs,
  ImageUploader,
  TextCustomizer,
  PositionControls,
  GarmentColorPicker,
} from '@/components/customizer';
import { formatPrice } from '@/lib/utils/formatters';
import type { CustomizationData } from '@/lib/types';

export default function CustomizeScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const router = useRouter();
  const { data: product, isLoading } = useProduct(productId);
  const addItem = useCartStore((state) => state.addItem);

  const [isUploading, setIsUploading] = useState(false);

  const {
    selectedSize,
    selectedColor,
    activePlacement,
    setActivePlacement,
    setSelectedSize,
    setSelectedColor,
    resetCustomizer,
    decalImage,
    decalImageId,
    decalPosition,
    decalScale,
    decalRotation,
    textValue,
    textFont,
    textColor,
    textPosition,
    textScale,
    textRotation,
    setDecalImage,
    setDecalPosition,
    setDecalScale,
    setDecalRotation,
    setTextValue,
    setTextFont,
    setTextColor,
    setTextPosition,
    setTextScale,
    setTextRotation,
    backImage,
    backImageId,
    backText,
    backTextFont,
    backTextColor,
    backPosition,
    backScale,
    backRotation,
    setBackImage,
    setBackText,
    setBackTextFont,
    setBackTextColor,
    setBackPosition,
    setBackScale,
    setBackRotation,
    leftShoulderImage,
    leftShoulderImageId,
    leftShoulderText,
    leftShoulderTextFont,
    leftShoulderTextColor,
    leftShoulderPosition,
    leftShoulderScale,
    leftShoulderRotation,
    setLeftShoulderImage,
    setLeftShoulderText,
    setLeftShoulderTextFont,
    setLeftShoulderTextColor,
    setLeftShoulderPosition,
    setLeftShoulderScale,
    setLeftShoulderRotation,
    rightShoulderImage,
    rightShoulderImageId,
    rightShoulderText,
    rightShoulderTextFont,
    rightShoulderTextColor,
    rightShoulderPosition,
    rightShoulderScale,
    rightShoulderRotation,
    setRightShoulderImage,
    setRightShoulderText,
    setRightShoulderTextFont,
    setRightShoulderTextColor,
    setRightShoulderPosition,
    setRightShoulderScale,
    setRightShoulderRotation,
  } = useCustomizerStore();

  useEffect(() => {
    if (product?.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0]);
    }
  }, [product]);

  const hasAnyCustomization =
    !!decalImage ||
    !!textValue ||
    !!backImage ||
    !!backText ||
    !!leftShoulderImage ||
    !!leftShoulderText ||
    !!rightShoulderImage ||
    !!rightShoulderText;

  const basePrice = product?.basePrice || 0;
  const customizationPrice = hasAnyCustomization ? (product?.customizationPrice || 0) : 0;
  const totalPrice = basePrice + customizationPrice;

  const handleAddToCart = () => {
    if (!product) return;

    const customizationData: CustomizationData | undefined = hasAnyCustomization
      ? {
          decalImage,
          decalImageId: decalImageId || undefined,
          decalPosition,
          decalScale,
          decalRotation,
          textValue: textValue || undefined,
          textFont,
          textColor,
          textPosition,
          textScale,
          textRotation,
          backImage: backImage || undefined,
          backImageId: backImageId || undefined,
          backText: backText || undefined,
          backTextFont,
          backTextColor,
          backPosition,
          backScale,
          backRotation,
          leftShoulderImage: leftShoulderImage || undefined,
          leftShoulderImageId: leftShoulderImageId || undefined,
          leftShoulderText: leftShoulderText || undefined,
          leftShoulderTextFont,
          leftShoulderTextColor,
          leftShoulderPosition,
          leftShoulderScale,
          leftShoulderRotation,
          rightShoulderImage: rightShoulderImage || undefined,
          rightShoulderImageId: rightShoulderImageId || undefined,
          rightShoulderText: rightShoulderText || undefined,
          rightShoulderTextFont,
          rightShoulderTextColor,
          rightShoulderPosition,
          rightShoulderScale,
          rightShoulderRotation,
        }
      : undefined;

    addItem({
      productId: product.id,
      name: product.name,
      color: selectedColor,
      size: selectedSize,
      quantity: 1,
      price: totalPrice,
      image: product.images?.[0] || '',
      customization: customizationData,
    });

    resetCustomizer();
    router.push('/(tabs)/cart');
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading customizer..." />;
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found</Text>
        <Button
          title="Go Back"
          variant="outline"
          style={styles.errorButton}
          onPress={() => router.back()}
        />
      </View>
    );
  }

  const getCurrentPlacementControls = () => {
    switch (activePlacement) {
      case 'front':
        return {
          image: decalImage,
          setImage: setDecalImage,
          text: textValue,
          setText: setTextValue,
          textFont,
          setTextFont,
          textColor,
          setTextColor,
          position: { x: decalPosition.x, y: decalPosition.y },
          setPosition: (pos: Partial<{ x: number; y: number }>) => setDecalPosition(pos),
          scale: decalScale,
          setScale: setDecalScale,
          rotation: decalRotation,
          setRotation: setDecalRotation,
          maxTextLength: 30,
        };
      case 'back':
        return {
          image: backImage,
          setImage: setBackImage,
          text: backText,
          setText: setBackText,
          textFont: backTextFont,
          setTextFont: setBackTextFont,
          textColor: backTextColor,
          setTextColor: setBackTextColor,
          position: backPosition,
          setPosition: setBackPosition,
          scale: backScale,
          setScale: setBackScale,
          rotation: backRotation,
          setRotation: setBackRotation,
          maxTextLength: 30,
        };
      case 'leftShoulder':
        return {
          image: leftShoulderImage,
          setImage: setLeftShoulderImage,
          text: leftShoulderText,
          setText: setLeftShoulderText,
          textFont: leftShoulderTextFont,
          setTextFont: setLeftShoulderTextFont,
          textColor: leftShoulderTextColor,
          setTextColor: setLeftShoulderTextColor,
          position: leftShoulderPosition,
          setPosition: setLeftShoulderPosition,
          scale: leftShoulderScale,
          setScale: setLeftShoulderScale,
          rotation: leftShoulderRotation,
          setRotation: setLeftShoulderRotation,
          maxTextLength: 15,
        };
      case 'rightShoulder':
        return {
          image: rightShoulderImage,
          setImage: setRightShoulderImage,
          text: rightShoulderText,
          setText: setRightShoulderText,
          textFont: rightShoulderTextFont,
          setTextFont: setRightShoulderTextFont,
          textColor: rightShoulderTextColor,
          setTextColor: setRightShoulderTextColor,
          position: rightShoulderPosition,
          setPosition: setRightShoulderPosition,
          scale: rightShoulderScale,
          setScale: setRightShoulderScale,
          rotation: rightShoulderRotation,
          setRotation: setRightShoulderRotation,
          maxTextLength: 15,
        };
    }
  };

  const controls = getCurrentPlacementControls();

  return (
    <View style={styles.container}>
      {/* 3D Canvas - Top 45% */}
      <View style={styles.canvasContainer}>
        <ProductCanvas3D productType="hoodie" />
      </View>

      {/* Placement Tabs */}
      <PlacementTabs
        activePlacement={activePlacement}
        onSelect={setActivePlacement}
      />

      {/* Controls - Bottom scrollable area */}
      <ScrollView style={styles.controlsScroll} contentContainerStyle={styles.controlsContent}>
        {/* Garment Color */}
        {product.colors && product.colors.length > 0 && (
          <View style={styles.section}>
            <GarmentColorPicker
              colors={product.colors}
              selectedColor={selectedColor}
              onSelect={setSelectedColor}
            />
          </View>
        )}

        {/* Size Selector */}
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

        {/* Image Upload */}
        <View style={styles.section}>
          <ImageUploader
            currentImage={controls.image}
            placement={activePlacement}
            onImageChange={(url, id) => controls.setImage(url, id)}
            onLoading={setIsUploading}
          />
        </View>

        {/* Position Controls (only if image exists) */}
        {controls.image && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Image Position</Text>
            <PositionControls
              positionX={controls.position.x}
              positionY={controls.position.y}
              scale={controls.scale}
              rotation={controls.rotation}
              onPositionXChange={(v) => controls.setPosition({ x: v })}
              onPositionYChange={(v) => controls.setPosition({ y: v })}
              onScaleChange={controls.setScale}
              onRotationChange={controls.setRotation}
            />
          </View>
        )}

        {/* Text Customizer */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add Text</Text>
          <TextCustomizer
            textValue={controls.text}
            textFont={controls.textFont}
            textColor={controls.textColor}
            maxLength={controls.maxTextLength}
            onTextChange={controls.setText}
            onFontChange={controls.setTextFont}
            onColorChange={controls.setTextColor}
          />
        </View>

        {/* Price Summary */}
        <View style={styles.card}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Base Price</Text>
            <Text style={styles.priceValue}>{formatPrice(basePrice)}</Text>
          </View>
          {hasAnyCustomization && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Customization</Text>
              <Text style={styles.priceValue}>+{formatPrice(customizationPrice)}</Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(totalPrice)}</Text>
          </View>
        </View>

        {/* Spacer for button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Add to Cart Button */}
      <View style={styles.actionBar}>
        <Button
          title={`Add to Cart - ${formatPrice(totalPrice)}`}
          size="lg"
          onPress={handleAddToCart}
          disabled={isUploading}
          loading={isUploading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  canvasContainer: {
    height: '42%',
    backgroundColor: '#e8e8ed',
  },
  controlsScroll: {
    flex: 1,
  },
  controlsContent: {
    padding: 16,
    paddingTop: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    marginBottom: 10,
    fontSize: 15,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardTitle: {
    marginBottom: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  priceLabel: {
    fontSize: 15,
    color: '#8e8e93',
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1c1c1e',
  },
  divider: {
    marginVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f2f2f7',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1c1e',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0891b2',
  },
  bottomSpacer: {
    height: 100,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: '#f2f2f7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#8e8e93',
  },
  errorButton: {
    marginTop: 20,
  },
});
