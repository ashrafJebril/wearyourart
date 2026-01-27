// Measurement conversion utilities for printer-friendly specifications
// Converts 3D model coordinates to real-world measurements (cm/inches)

// Standard hoodie print area dimensions (in cm)
export const PRINT_AREAS = {
  front: { width: 30, height: 35 },
  back: { width: 35, height: 40 },
  leftShoulder: { width: 12, height: 10 },
  rightShoulder: { width: 12, height: 10 },
};

// Base design sizes at scale 1.0 (in cm)
// These represent the maximum design size at 100% scale
export const BASE_SIZES = {
  front: 20,
  back: 22,
  leftShoulder: 8,
  rightShoulder: 8,
};

// Conversion factor from model units to cm
// This may need calibration based on actual hoodie measurements
const CM_PER_MODEL_UNIT = 0.5;

export type PlacementArea = 'front' | 'back' | 'leftShoulder' | 'rightShoulder';

export interface PrintMeasurements {
  designSizeCm: number;
  designSizeInches: number;
  positionFromCenterCm: number;
  positionFromCenterInches: number;
  positionFromNecklineCm: number;
  positionFromNecklineInches: number;
  rotationDegrees: number;
}

export interface TextMeasurements {
  heightCm: number;
  heightInches: number;
}

export interface PlacementSpecification {
  area: PlacementArea;
  label: string;
  hasImage: boolean;
  imageUrl?: string;
  hasText: boolean;
  textValue?: string;
  textFont?: string;
  textColor?: string;
  textMeasurements?: TextMeasurements;
  measurements: PrintMeasurements;
  printArea: { width: number; height: number };
}

/**
 * Convert cm to inches
 */
export function cmToInches(cm: number): number {
  return Math.round((cm / 2.54) * 10) / 10;
}

/**
 * Format measurement with both cm and inches
 */
export function formatMeasurement(cm: number): string {
  const inches = cmToInches(cm);
  return `${cm.toFixed(1)} cm (${inches.toFixed(1)} in)`;
}

/**
 * Get the design size in cm based on placement and scale
 */
export function getDesignSizeCm(placement: PlacementArea, scale: number): number {
  const baseSize = BASE_SIZES[placement] || BASE_SIZES.front;
  return Math.round(baseSize * scale * 10) / 10;
}

/**
 * Get text height in cm based on scale
 * Text at scale 1.0 is approximately 5cm tall
 */
export function getTextHeightCm(scale: number): number {
  const baseTextHeight = 5; // cm at scale 1.0
  return Math.round(baseTextHeight * scale * 10) / 10;
}

/**
 * Convert model position to cm offset from center
 */
export function getPositionFromCenterCm(positionX: number): number {
  return Math.round(positionX * CM_PER_MODEL_UNIT * 10) / 10;
}

/**
 * Convert model position to cm offset from neckline
 * Positive Y in model typically means lower on the garment
 */
export function getPositionFromNecklineCm(
  placement: PlacementArea,
  positionY: number
): number {
  // Model Y of 0 is roughly at the chest center
  // Negative Y moves up, positive Y moves down
  const verticalOffsetCm = positionY * CM_PER_MODEL_UNIT;
  // Base position is roughly 15cm from neckline for front/back, 5cm for shoulders
  const basePosition = placement.includes('Shoulder') ? 5 : 15;
  return Math.round((basePosition - verticalOffsetCm) * 10) / 10;
}

/**
 * Get human-readable placement label
 */
export function getPlacementLabel(placement: PlacementArea): string {
  const labels: Record<PlacementArea, string> = {
    front: 'Front (Chest)',
    back: 'Back',
    leftShoulder: 'Left Shoulder',
    rightShoulder: 'Right Shoulder',
  };
  return labels[placement] || placement;
}

/**
 * Convert full customization data to print measurements
 */
export function convertToRealMeasurements(
  placement: PlacementArea,
  scale: number,
  position: { x: number; y: number },
  rotation: number
): PrintMeasurements {
  const designSizeCm = getDesignSizeCm(placement, scale);
  const positionFromCenterCm = getPositionFromCenterCm(position.x);
  const positionFromNecklineCm = getPositionFromNecklineCm(placement, position.y);

  return {
    designSizeCm,
    designSizeInches: cmToInches(designSizeCm),
    positionFromCenterCm,
    positionFromCenterInches: cmToInches(Math.abs(positionFromCenterCm)),
    positionFromNecklineCm,
    positionFromNecklineInches: cmToInches(positionFromNecklineCm),
    rotationDegrees: Math.round(rotation),
  };
}

/**
 * Extract placement specifications from order item customization
 */
export function extractPlacementSpecifications(
  customization: any
): PlacementSpecification[] {
  if (!customization) return [];

  const placements: PlacementSpecification[] = [];

  // Front placement
  if (customization.decalImage || customization.textValue) {
    placements.push({
      area: 'front',
      label: getPlacementLabel('front'),
      hasImage: !!customization.decalImage,
      imageUrl: customization.decalImage,
      hasText: !!customization.textValue,
      textValue: customization.textValue,
      textFont: customization.textFont,
      textColor: customization.textColor,
      textMeasurements: customization.textScale
        ? {
            heightCm: getTextHeightCm(customization.textScale),
            heightInches: cmToInches(getTextHeightCm(customization.textScale)),
          }
        : undefined,
      measurements: convertToRealMeasurements(
        'front',
        customization.decalScale || 0.6,
        customization.decalPosition || { x: 0, y: 0 },
        customization.decalRotation || 0
      ),
      printArea: PRINT_AREAS.front,
    });
  }

  // Back placement
  if (customization.backImage || customization.backText) {
    placements.push({
      area: 'back',
      label: getPlacementLabel('back'),
      hasImage: !!customization.backImage,
      imageUrl: customization.backImage,
      hasText: !!customization.backText,
      textValue: customization.backText,
      textFont: customization.backTextFont,
      textColor: customization.backTextColor,
      textMeasurements: customization.backScale
        ? {
            heightCm: getTextHeightCm(customization.backScale),
            heightInches: cmToInches(getTextHeightCm(customization.backScale)),
          }
        : undefined,
      measurements: convertToRealMeasurements(
        'back',
        customization.backScale || 0.5,
        customization.backPosition || { x: 0, y: 0 },
        customization.backRotation || 0
      ),
      printArea: PRINT_AREAS.back,
    });
  }

  // Left shoulder placement
  if (customization.leftShoulderImage || customization.leftShoulderText) {
    placements.push({
      area: 'leftShoulder',
      label: getPlacementLabel('leftShoulder'),
      hasImage: !!customization.leftShoulderImage,
      imageUrl: customization.leftShoulderImage,
      hasText: !!customization.leftShoulderText,
      textValue: customization.leftShoulderText,
      textFont: customization.leftShoulderTextFont,
      textColor: customization.leftShoulderTextColor,
      textMeasurements: customization.leftShoulderScale
        ? {
            heightCm: getTextHeightCm(customization.leftShoulderScale),
            heightInches: cmToInches(
              getTextHeightCm(customization.leftShoulderScale)
            ),
          }
        : undefined,
      measurements: convertToRealMeasurements(
        'leftShoulder',
        customization.leftShoulderScale || 0.5,
        customization.leftShoulderPosition || { x: 0, y: 0 },
        customization.leftShoulderRotation || 0
      ),
      printArea: PRINT_AREAS.leftShoulder,
    });
  }

  // Right shoulder placement
  if (customization.rightShoulderImage || customization.rightShoulderText) {
    placements.push({
      area: 'rightShoulder',
      label: getPlacementLabel('rightShoulder'),
      hasImage: !!customization.rightShoulderImage,
      imageUrl: customization.rightShoulderImage,
      hasText: !!customization.rightShoulderText,
      textValue: customization.rightShoulderText,
      textFont: customization.rightShoulderTextFont,
      textColor: customization.rightShoulderTextColor,
      textMeasurements: customization.rightShoulderScale
        ? {
            heightCm: getTextHeightCm(customization.rightShoulderScale),
            heightInches: cmToInches(
              getTextHeightCm(customization.rightShoulderScale)
            ),
          }
        : undefined,
      measurements: convertToRealMeasurements(
        'rightShoulder',
        customization.rightShoulderScale || 0.5,
        customization.rightShoulderPosition || { x: 0, y: 0 },
        customization.rightShoulderRotation || 0
      ),
      printArea: PRINT_AREAS.rightShoulder,
    });
  }

  return placements;
}

/**
 * Format position description for display
 */
export function formatPositionDescription(measurements: PrintMeasurements): string {
  const horizontal =
    measurements.positionFromCenterCm === 0
      ? 'Center'
      : measurements.positionFromCenterCm > 0
      ? `${Math.abs(measurements.positionFromCenterCm)} cm right of center`
      : `${Math.abs(measurements.positionFromCenterCm)} cm left of center`;

  const vertical = `${measurements.positionFromNecklineCm} cm from neckline`;

  return `${horizontal}, ${vertical}`;
}
