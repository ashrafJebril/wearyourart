import React from 'react';
import {
  PlacementSpecification,
  formatMeasurement,
  formatPositionDescription,
} from '../utils/measurementConversion';

interface PrintSpecificationsProps {
  placement: PlacementSpecification;
  onDownloadImage?: (url: string, filename: string) => void;
}

export const PrintSpecifications: React.FC<PrintSpecificationsProps> = ({
  placement,
  onDownloadImage,
}) => {
  const handleDownload = () => {
    if (placement.imageUrl && onDownloadImage) {
      const filename = `${placement.area}-design.png`;
      onDownloadImage(placement.imageUrl, filename);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 print:border-black print:border">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{placement.label}</h3>
        <div className="flex gap-2">
          {placement.hasImage && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
              Image
            </span>
          )}
          {placement.hasText && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
              Text
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left column: Measurements */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
            Measurements
          </h4>

          {/* Design Size */}
          <div className="flex justify-between items-center py-1 border-b border-gray-100">
            <span className="text-sm text-gray-600">Design Size:</span>
            <span className="text-sm font-medium text-gray-900">
              {formatMeasurement(placement.measurements.designSizeCm)}
            </span>
          </div>

          {/* Position from Center */}
          <div className="flex justify-between items-center py-1 border-b border-gray-100">
            <span className="text-sm text-gray-600">Horizontal Position:</span>
            <span className="text-sm font-medium text-gray-900">
              {placement.measurements.positionFromCenterCm === 0
                ? 'Center'
                : placement.measurements.positionFromCenterCm > 0
                ? `${Math.abs(placement.measurements.positionFromCenterCm)} cm right`
                : `${Math.abs(placement.measurements.positionFromCenterCm)} cm left`}
            </span>
          </div>

          {/* Position from Neckline */}
          <div className="flex justify-between items-center py-1 border-b border-gray-100">
            <span className="text-sm text-gray-600">From Neckline:</span>
            <span className="text-sm font-medium text-gray-900">
              {formatMeasurement(placement.measurements.positionFromNecklineCm)}
            </span>
          </div>

          {/* Rotation */}
          <div className="flex justify-between items-center py-1 border-b border-gray-100">
            <span className="text-sm text-gray-600">Rotation:</span>
            <span className="text-sm font-medium text-gray-900">
              {placement.measurements.rotationDegrees}°
            </span>
          </div>

          {/* Print Area */}
          <div className="flex justify-between items-center py-1 border-b border-gray-100">
            <span className="text-sm text-gray-600">Print Area:</span>
            <span className="text-sm font-medium text-gray-900">
              {placement.printArea.width} × {placement.printArea.height} cm
            </span>
          </div>
        </div>

        {/* Right column: Design details */}
        <div className="space-y-3">
          {/* Image section */}
          {placement.hasImage && placement.imageUrl && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide mb-2">
                Design Image
              </h4>
              <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                <img
                  src={placement.imageUrl}
                  alt={`${placement.label} design`}
                  className="max-w-full h-auto max-h-32 mx-auto object-contain"
                />
              </div>
              <button
                onClick={handleDownload}
                className="mt-2 w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors no-print"
              >
                Download High-Res Image
              </button>
            </div>
          )}

          {/* Text section */}
          {placement.hasText && placement.textValue && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide mb-2">
                Text Design
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Text:</span>
                  <span
                    className="text-sm font-medium text-gray-900"
                    style={{ fontFamily: placement.textFont || 'inherit' }}
                  >
                    "{placement.textValue}"
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Font:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {placement.textFont || 'Roboto'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Color:</span>
                  <span className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded border border-gray-300"
                      style={{ backgroundColor: placement.textColor || '#000' }}
                    />
                    {placement.textColor || '#000000'}
                  </span>
                </div>
                {placement.textMeasurements && (
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Text Height:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatMeasurement(placement.textMeasurements.heightCm)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Position summary */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          <strong>Position Summary:</strong>{' '}
          {formatPositionDescription(placement.measurements)}
        </p>
      </div>
    </div>
  );
};

export default PrintSpecifications;
