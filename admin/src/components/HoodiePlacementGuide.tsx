import React from 'react';
import { PlacementSpecification } from '../utils/measurementConversion';

interface HoodiePlacementGuideProps {
  placements: PlacementSpecification[];
  view: 'front' | 'back';
  width?: number;
  height?: number;
}

// SVG viewBox dimensions
const SVG_WIDTH = 300;
const SVG_HEIGHT = 400;

// Hoodie outline coordinates (simplified)
const HOODIE_PATHS = {
  front: {
    // Main body outline
    body: 'M75,100 Q75,80 100,70 L120,60 Q150,50 180,60 L200,70 Q225,80 225,100 L230,350 Q230,370 210,370 L90,370 Q70,370 70,350 Z',
    // Hood
    hood: 'M100,70 Q100,30 150,20 Q200,30 200,70',
    // Sleeves
    leftSleeve: 'M75,100 Q50,110 30,150 L40,160 Q55,130 75,120',
    rightSleeve: 'M225,100 Q250,110 270,150 L260,160 Q245,130 225,120',
    // Zipper line
    zipper: 'M150,70 L150,370',
    // Print area (chest)
    printArea: { x: 90, y: 120, width: 120, height: 140 },
    // Shoulder areas
    leftShoulderArea: { x: 55, y: 95, width: 40, height: 35 },
    rightShoulderArea: { x: 205, y: 95, width: 40, height: 35 },
  },
  back: {
    // Main body outline (same as front)
    body: 'M75,100 Q75,80 100,70 L120,60 Q150,50 180,60 L200,70 Q225,80 225,100 L230,350 Q230,370 210,370 L90,370 Q70,370 70,350 Z',
    // Hood
    hood: 'M100,70 Q100,30 150,20 Q200,30 200,70',
    // Sleeves
    leftSleeve: 'M75,100 Q50,110 30,150 L40,160 Q55,130 75,120',
    rightSleeve: 'M225,100 Q250,110 270,150 L260,160 Q245,130 225,120',
    // Center seam
    seam: 'M150,70 L150,370',
    // Print area (back)
    printArea: { x: 80, y: 110, width: 140, height: 160 },
    // Shoulder areas
    leftShoulderArea: { x: 55, y: 95, width: 40, height: 35 },
    rightShoulderArea: { x: 205, y: 95, width: 40, height: 35 },
  },
};

export const HoodiePlacementGuide: React.FC<HoodiePlacementGuideProps> = ({
  placements,
  view,
  width = 300,
  height = 400,
}) => {
  const paths = HOODIE_PATHS[view];
  const mainPlacement = placements.find(
    (p) => p.area === (view === 'front' ? 'front' : 'back')
  );
  const leftShoulder = placements.find((p) => p.area === 'leftShoulder');
  const rightShoulder = placements.find((p) => p.area === 'rightShoulder');

  // Calculate design marker position based on measurements
  const getDesignMarker = (
    placement: PlacementSpecification,
    area: 'main' | 'leftShoulder' | 'rightShoulder'
  ) => {
    const printArea =
      area === 'main'
        ? paths.printArea
        : area === 'leftShoulder'
        ? paths.leftShoulderArea
        : paths.rightShoulderArea;

    // Center of print area
    const centerX = printArea.x + printArea.width / 2;
    const centerY = printArea.y + printArea.height / 2;

    // Calculate offset based on position measurements
    // Positive x = right, negative x = left
    const offsetX =
      (placement.measurements.positionFromCenterCm / 30) * printArea.width;
    // Negative y = up (towards neckline)
    const offsetY =
      ((15 - placement.measurements.positionFromNecklineCm) / 35) *
      printArea.height;

    // Calculate design size in SVG units
    const designSizeRatio =
      placement.measurements.designSizeCm /
      (area === 'main' ? 20 : 8);
    const markerSize = Math.min(
      printArea.width * 0.6 * designSizeRatio,
      printArea.width * 0.9
    );

    return {
      x: centerX + offsetX,
      y: centerY + offsetY,
      size: markerSize,
      rotation: placement.measurements.rotationDegrees,
    };
  };

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      className="hoodie-placement-guide"
    >
      {/* Background */}
      <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="#f5f5f5" />

      {/* Grid lines */}
      <defs>
        <pattern
          id={`grid-${view}`}
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 20 0 L 0 0 0 20"
            fill="none"
            stroke="#e0e0e0"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill={`url(#grid-${view})`} />

      {/* Hoodie outline */}
      <g fill="white" stroke="#333" strokeWidth="2">
        {/* Hood */}
        <path d={paths.hood} fill="white" />
        {/* Body */}
        <path d={paths.body} />
        {/* Sleeves */}
        <path d={paths.leftSleeve} fill="white" />
        <path d={paths.rightSleeve} fill="white" />
      </g>

      {/* Zipper/Seam line */}
      <path
        d={view === 'front' ? HOODIE_PATHS.front.zipper : HOODIE_PATHS.back.seam}
        stroke="#999"
        strokeWidth="1"
        strokeDasharray="5,5"
        fill="none"
      />

      {/* Main print area outline */}
      <rect
        x={paths.printArea.x}
        y={paths.printArea.y}
        width={paths.printArea.width}
        height={paths.printArea.height}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="1"
        strokeDasharray="4,4"
        opacity="0.5"
      />

      {/* Shoulder print areas */}
      {view === 'front' && (
        <>
          <rect
            x={paths.leftShoulderArea.x}
            y={paths.leftShoulderArea.y}
            width={paths.leftShoulderArea.width}
            height={paths.leftShoulderArea.height}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1"
            strokeDasharray="4,4"
            opacity="0.5"
          />
          <rect
            x={paths.rightShoulderArea.x}
            y={paths.rightShoulderArea.y}
            width={paths.rightShoulderArea.width}
            height={paths.rightShoulderArea.height}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1"
            strokeDasharray="4,4"
            opacity="0.5"
          />
        </>
      )}

      {/* Design markers */}
      {mainPlacement && (
        <g>
          {(() => {
            const marker = getDesignMarker(mainPlacement, 'main');
            return (
              <g
                transform={`translate(${marker.x}, ${marker.y}) rotate(${marker.rotation})`}
              >
                {/* Design area rectangle */}
                <rect
                  x={-marker.size / 2}
                  y={-marker.size / 2}
                  width={marker.size}
                  height={marker.size}
                  fill={mainPlacement.hasImage ? '#10b981' : '#8b5cf6'}
                  fillOpacity="0.3"
                  stroke={mainPlacement.hasImage ? '#10b981' : '#8b5cf6'}
                  strokeWidth="2"
                />
                {/* Center crosshair */}
                <line
                  x1="-10"
                  y1="0"
                  x2="10"
                  y2="0"
                  stroke="#333"
                  strokeWidth="1"
                />
                <line
                  x1="0"
                  y1="-10"
                  x2="0"
                  y2="10"
                  stroke="#333"
                  strokeWidth="1"
                />
                {/* Size label */}
                <text
                  x="0"
                  y={marker.size / 2 + 15}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#333"
                >
                  {mainPlacement.measurements.designSizeCm} cm
                </text>
              </g>
            );
          })()}
        </g>
      )}

      {/* Left shoulder marker */}
      {leftShoulder && view === 'front' && (
        <g>
          {(() => {
            const marker = getDesignMarker(leftShoulder, 'leftShoulder');
            return (
              <g
                transform={`translate(${marker.x}, ${marker.y}) rotate(${marker.rotation})`}
              >
                <rect
                  x={-marker.size / 2}
                  y={-marker.size / 2}
                  width={marker.size}
                  height={marker.size}
                  fill={leftShoulder.hasImage ? '#10b981' : '#8b5cf6'}
                  fillOpacity="0.3"
                  stroke={leftShoulder.hasImage ? '#10b981' : '#8b5cf6'}
                  strokeWidth="2"
                />
                <text
                  x="0"
                  y={marker.size / 2 + 12}
                  textAnchor="middle"
                  fontSize="8"
                  fill="#333"
                >
                  {leftShoulder.measurements.designSizeCm} cm
                </text>
              </g>
            );
          })()}
        </g>
      )}

      {/* Right shoulder marker */}
      {rightShoulder && view === 'front' && (
        <g>
          {(() => {
            const marker = getDesignMarker(rightShoulder, 'rightShoulder');
            return (
              <g
                transform={`translate(${marker.x}, ${marker.y}) rotate(${marker.rotation})`}
              >
                <rect
                  x={-marker.size / 2}
                  y={-marker.size / 2}
                  width={marker.size}
                  height={marker.size}
                  fill={rightShoulder.hasImage ? '#10b981' : '#8b5cf6'}
                  fillOpacity="0.3"
                  stroke={rightShoulder.hasImage ? '#10b981' : '#8b5cf6'}
                  strokeWidth="2"
                />
                <text
                  x="0"
                  y={marker.size / 2 + 12}
                  textAnchor="middle"
                  fontSize="8"
                  fill="#333"
                >
                  {rightShoulder.measurements.designSizeCm} cm
                </text>
              </g>
            );
          })()}
        </g>
      )}

      {/* View label */}
      <text
        x={SVG_WIDTH / 2}
        y={SVG_HEIGHT - 10}
        textAnchor="middle"
        fontSize="14"
        fontWeight="bold"
        fill="#666"
      >
        {view === 'front' ? 'FRONT VIEW' : 'BACK VIEW'}
      </text>

      {/* Legend */}
      <g transform="translate(10, 360)">
        <rect x="0" y="0" width="12" height="12" fill="#10b981" fillOpacity="0.3" stroke="#10b981" strokeWidth="1" />
        <text x="18" y="10" fontSize="9" fill="#666">Image</text>
        <rect x="60" y="0" width="12" height="12" fill="#8b5cf6" fillOpacity="0.3" stroke="#8b5cf6" strokeWidth="1" />
        <text x="78" y="10" fontSize="9" fill="#666">Text</text>
      </g>
    </svg>
  );
};

export default HoodiePlacementGuide;
