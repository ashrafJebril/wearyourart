'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'

interface SizeSelectorProps {
  sizes: string[]
  selectedSize: string
  onSelect: (size: string) => void
  productType?: 'hoodie' | 'tshirt'
}

// Size measurements in cm (standard for Jordan/Middle East)
const HOODIE_SIZE_CHART = {
  XS: { chest: 96, length: 64, shoulder: 42, sleeve: 60 },
  S: { chest: 102, length: 66, shoulder: 44, sleeve: 62 },
  M: { chest: 108, length: 68, shoulder: 46, sleeve: 64 },
  L: { chest: 114, length: 70, shoulder: 48, sleeve: 66 },
  XL: { chest: 120, length: 72, shoulder: 50, sleeve: 68 },
  '2XL': { chest: 126, length: 74, shoulder: 52, sleeve: 70 },
}

const TSHIRT_SIZE_CHART = {
  XS: { chest: 92, length: 66, shoulder: 40, sleeve: 20 },
  S: { chest: 98, length: 68, shoulder: 42, sleeve: 21 },
  M: { chest: 104, length: 70, shoulder: 44, sleeve: 22 },
  L: { chest: 110, length: 72, shoulder: 46, sleeve: 23 },
  XL: { chest: 116, length: 74, shoulder: 48, sleeve: 24 },
  '2XL': { chest: 122, length: 76, shoulder: 50, sleeve: 25 },
}

// Body measurements for finding the right size
const BODY_SIZE_CHART = {
  XS: { chest: '84-88', waist: '70-74', height: '160-165' },
  S: { chest: '88-92', waist: '74-78', height: '165-170' },
  M: { chest: '92-96', waist: '78-82', height: '170-175' },
  L: { chest: '96-100', waist: '82-86', height: '175-180' },
  XL: { chest: '100-104', waist: '86-90', height: '180-185' },
  '2XL': { chest: '104-108', waist: '90-94', height: '185-190' },
}

function cmToInches(cm: number): string {
  return (cm / 2.54).toFixed(1)
}

export function SizeSelector({ sizes, selectedSize, onSelect, productType = 'hoodie' }: SizeSelectorProps) {
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  const [unit, setUnit] = useState<'cm' | 'in'>('cm')

  const sizeChart = productType === 'tshirt' ? TSHIRT_SIZE_CHART : HOODIE_SIZE_CHART
  const productName = productType === 'tshirt' ? 'T-Shirt' : 'Hoodie'

  const formatMeasurement = (cm: number) => {
    return unit === 'cm' ? `${cm}` : cmToInches(cm)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-neutral-900">Size</span>
        <button
          onClick={() => setShowSizeGuide(true)}
          className="text-sm text-neutral-500 hover:text-neutral-900 underline"
        >
          Size Guide
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => onSelect(size)}
            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
              selectedSize === size
                ? 'border-neutral-900 bg-neutral-900 text-white'
                : 'border-neutral-200 text-neutral-700 hover:border-neutral-900'
            }`}
          >
            {size}
          </button>
        ))}
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowSizeGuide(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Modal */}
          <div
            className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-neutral-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-neutral-900">{productName} Size Guide</h2>
              <button
                onClick={() => setShowSizeGuide(false)}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Unit Toggle */}
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-neutral-600">Unit:</span>
                <div className="inline-flex rounded-lg border border-neutral-200 p-1">
                  <button
                    onClick={() => setUnit('cm')}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      unit === 'cm'
                        ? 'bg-neutral-900 text-white'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    CM
                  </button>
                  <button
                    onClick={() => setUnit('in')}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      unit === 'in'
                        ? 'bg-neutral-900 text-white'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    Inches
                  </button>
                </div>
              </div>

              {/* Garment Measurements */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-3 uppercase tracking-wider">
                  {productName} Measurements
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-neutral-50">
                        <th className="px-4 py-3 text-left font-semibold text-neutral-900 rounded-tl-lg">Size</th>
                        <th className="px-4 py-3 text-center font-semibold text-neutral-900">Chest</th>
                        <th className="px-4 py-3 text-center font-semibold text-neutral-900">Length</th>
                        <th className="px-4 py-3 text-center font-semibold text-neutral-900">Shoulder</th>
                        <th className="px-4 py-3 text-center font-semibold text-neutral-900 rounded-tr-lg">Sleeve</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(sizeChart).map(([size, measurements], index) => (
                        <tr
                          key={size}
                          className={`border-b border-neutral-100 ${
                            selectedSize === size ? 'bg-primary-50' : index % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'
                          }`}
                        >
                          <td className={`px-4 py-3 font-medium ${selectedSize === size ? 'text-primary-700' : 'text-neutral-900'}`}>
                            {size}
                            {selectedSize === size && (
                              <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                                Selected
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center text-neutral-600">{formatMeasurement(measurements.chest)}</td>
                          <td className="px-4 py-3 text-center text-neutral-600">{formatMeasurement(measurements.length)}</td>
                          <td className="px-4 py-3 text-center text-neutral-600">{formatMeasurement(measurements.shoulder)}</td>
                          <td className="px-4 py-3 text-center text-neutral-600">{formatMeasurement(measurements.sleeve)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Body Measurements Guide */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-3 uppercase tracking-wider">
                  Find Your Size (Body Measurements in CM)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-neutral-50">
                        <th className="px-4 py-3 text-left font-semibold text-neutral-900 rounded-tl-lg">Size</th>
                        <th className="px-4 py-3 text-center font-semibold text-neutral-900">Chest</th>
                        <th className="px-4 py-3 text-center font-semibold text-neutral-900">Waist</th>
                        <th className="px-4 py-3 text-center font-semibold text-neutral-900 rounded-tr-lg">Height</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(BODY_SIZE_CHART).map(([size, measurements], index) => (
                        <tr
                          key={size}
                          className={`border-b border-neutral-100 ${
                            selectedSize === size ? 'bg-primary-50' : index % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'
                          }`}
                        >
                          <td className={`px-4 py-3 font-medium ${selectedSize === size ? 'text-primary-700' : 'text-neutral-900'}`}>
                            {size}
                          </td>
                          <td className="px-4 py-3 text-center text-neutral-600">{measurements.chest}</td>
                          <td className="px-4 py-3 text-center text-neutral-600">{measurements.waist}</td>
                          <td className="px-4 py-3 text-center text-neutral-600">{measurements.height}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* How to Measure */}
              <div className="bg-neutral-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-neutral-900 mb-3">How to Measure</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-neutral-600">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-medium text-neutral-700 flex-shrink-0">1</span>
                    <div>
                      <span className="font-medium text-neutral-900">Chest:</span> Measure around the fullest part of your chest
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-medium text-neutral-700 flex-shrink-0">2</span>
                    <div>
                      <span className="font-medium text-neutral-900">Waist:</span> Measure around your natural waistline
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-medium text-neutral-700 flex-shrink-0">3</span>
                    <div>
                      <span className="font-medium text-neutral-900">Length:</span> From top of shoulder to bottom hem
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-medium text-neutral-700 flex-shrink-0">4</span>
                    <div>
                      <span className="font-medium text-neutral-900">Sleeve:</span> From shoulder seam to cuff
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="text-sm text-neutral-500 space-y-1">
                <p>• For a relaxed fit, choose one size up from your regular size</p>
                <p>• If you're between sizes, we recommend going with the larger size</p>
                <p>• All measurements have a tolerance of ±2cm</p>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
