import { create } from 'zustand'
import type { ProductColor } from '../types'

export type PlacementArea = 'front' | 'back' | 'leftShoulder' | 'rightShoulder'

interface CustomizerStore {
  hoodieColor: string
  selectedSize: string
  selectedColor: ProductColor
  isLoading: boolean
  activePlacement: PlacementArea
  targetRotation: number

  // Front customization (image + text)
  decalImage: string | null
  decalImageId: string | null
  decalPosition: { x: number; y: number; z: number }
  decalScale: number
  decalRotation: number
  textValue: string
  textFont: string
  textColor: string
  textPosition: { x: number; y: number }
  textScale: number
  textRotation: number

  // Back customization
  backImage: string | null
  backImageId: string | null
  backText: string
  backTextFont: string
  backTextColor: string
  backPosition: { x: number; y: number }
  backScale: number
  backRotation: number
  backTextPosition: { x: number; y: number }
  backTextScale: number
  backTextRotation: number

  // Left shoulder customization
  leftShoulderImage: string | null
  leftShoulderImageId: string | null
  leftShoulderText: string
  leftShoulderTextFont: string
  leftShoulderTextColor: string
  leftShoulderPosition: { x: number; y: number }
  leftShoulderScale: number
  leftShoulderRotation: number

  // Right shoulder customization
  rightShoulderImage: string | null
  rightShoulderImageId: string | null
  rightShoulderText: string
  rightShoulderTextFont: string
  rightShoulderTextColor: string
  rightShoulderPosition: { x: number; y: number }
  rightShoulderScale: number
  rightShoulderRotation: number

  // Actions
  setHoodieColor: (color: string) => void
  setSelectedSize: (size: string) => void
  setSelectedColor: (color: ProductColor) => void
  setIsLoading: (loading: boolean) => void
  setActivePlacement: (placement: PlacementArea) => void

  // Front actions
  setDecalImage: (image: string | null, imageId?: string | null) => void
  setDecalPosition: (position: Partial<{ x: number; y: number; z: number }>) => void
  setDecalScale: (scale: number) => void
  setDecalRotation: (rotation: number) => void
  setTextValue: (value: string) => void
  setTextFont: (font: string) => void
  setTextColor: (color: string) => void
  setTextPosition: (position: Partial<{ x: number; y: number }>) => void
  setTextScale: (scale: number) => void
  setTextRotation: (rotation: number) => void

  // Back actions
  setBackImage: (image: string | null, imageId?: string | null) => void
  setBackText: (text: string) => void
  setBackTextFont: (font: string) => void
  setBackTextColor: (color: string) => void
  setBackPosition: (position: Partial<{ x: number; y: number }>) => void
  setBackScale: (scale: number) => void
  setBackRotation: (rotation: number) => void
  setBackTextPosition: (position: Partial<{ x: number; y: number }>) => void
  setBackTextScale: (scale: number) => void
  setBackTextRotation: (rotation: number) => void

  // Left shoulder actions
  setLeftShoulderImage: (image: string | null, imageId?: string | null) => void
  setLeftShoulderText: (text: string) => void
  setLeftShoulderTextFont: (font: string) => void
  setLeftShoulderTextColor: (color: string) => void
  setLeftShoulderPosition: (position: Partial<{ x: number; y: number }>) => void
  setLeftShoulderScale: (scale: number) => void
  setLeftShoulderRotation: (rotation: number) => void

  // Right shoulder actions
  setRightShoulderImage: (image: string | null, imageId?: string | null) => void
  setRightShoulderText: (text: string) => void
  setRightShoulderTextFont: (font: string) => void
  setRightShoulderTextColor: (color: string) => void
  setRightShoulderPosition: (position: Partial<{ x: number; y: number }>) => void
  setRightShoulderScale: (scale: number) => void
  setRightShoulderRotation: (rotation: number) => void

  resetCustomizer: () => void
}

const defaultColor: ProductColor = {
  id: 'black',
  name: 'Black',
  hex: '#1a1a1a',
}

const initialState = {
  hoodieColor: '#1a1a1a',
  selectedSize: 'M',
  selectedColor: defaultColor,
  isLoading: false,
  activePlacement: 'front' as PlacementArea,
  targetRotation: 0,

  // Front customization defaults
  decalImage: null as string | null,
  decalImageId: null as string | null,
  decalPosition: { x: 0, y: -10, z: 0 },
  decalScale: 0.6,
  decalRotation: 0,
  textValue: '',
  textFont: 'Roboto',
  textColor: '#ffffff',
  textPosition: { x: 0, y: -5 },
  textScale: 0.5,
  textRotation: 0,

  // Back customization defaults
  backImage: null as string | null,
  backImageId: null as string | null,
  backText: '',
  backTextFont: 'Roboto',
  backTextColor: '#ffffff',
  backPosition: { x: 0, y: 0 },
  backScale: 0.5,
  backRotation: 0,
  backTextPosition: { x: 0, y: -5 },
  backTextScale: 0.5,
  backTextRotation: 0,

  // Left shoulder defaults
  leftShoulderImage: null as string | null,
  leftShoulderImageId: null as string | null,
  leftShoulderText: '',
  leftShoulderTextFont: 'Roboto',
  leftShoulderTextColor: '#ffffff',
  leftShoulderPosition: { x: 0, y: 0 },
  leftShoulderScale: 0.5,
  leftShoulderRotation: 0,

  // Right shoulder defaults
  rightShoulderImage: null as string | null,
  rightShoulderImageId: null as string | null,
  rightShoulderText: '',
  rightShoulderTextFont: 'Roboto',
  rightShoulderTextColor: '#ffffff',
  rightShoulderPosition: { x: 0, y: 0 },
  rightShoulderScale: 0.5,
  rightShoulderRotation: 0,
}

export const useCustomizerStore = create<CustomizerStore>((set) => ({
  ...initialState,

  setHoodieColor: (color) => set({ hoodieColor: color }),
  setSelectedSize: (size) => set({ selectedSize: size }),
  setSelectedColor: (color) =>
    set({
      selectedColor: color,
      hoodieColor: color.hex,
    }),
  setIsLoading: (loading) => set({ isLoading: loading }),

  setActivePlacement: (placement) => {
    const rotations: Record<PlacementArea, number> = {
      front: 0,
      back: Math.PI,
      leftShoulder: -Math.PI / 2,
      rightShoulder: Math.PI / 2,
    }
    set({ activePlacement: placement, targetRotation: rotations[placement] })
  },

  // Front actions
  setDecalImage: (image, imageId) => set({ decalImage: image, decalImageId: imageId ?? null }),
  setDecalPosition: (position) =>
    set((state) => ({
      decalPosition: { ...state.decalPosition, ...position },
    })),
  setDecalScale: (scale) => set({ decalScale: scale }),
  setDecalRotation: (rotation) => set({ decalRotation: rotation }),
  setTextValue: (value) => set({ textValue: value }),
  setTextFont: (font) => set({ textFont: font }),
  setTextColor: (color) => set({ textColor: color }),
  setTextPosition: (position) =>
    set((state) => ({
      textPosition: { ...state.textPosition, ...position },
    })),
  setTextScale: (scale) => set({ textScale: scale }),
  setTextRotation: (rotation) => set({ textRotation: rotation }),

  // Back actions
  setBackImage: (image, imageId) => set({ backImage: image, backImageId: imageId ?? null }),
  setBackText: (text) => set({ backText: text }),
  setBackTextFont: (font) => set({ backTextFont: font }),
  setBackTextColor: (color) => set({ backTextColor: color }),
  setBackPosition: (position) =>
    set((state) => ({
      backPosition: { ...state.backPosition, ...position },
    })),
  setBackScale: (scale) => set({ backScale: scale }),
  setBackRotation: (rotation) => set({ backRotation: rotation }),
  setBackTextPosition: (position) =>
    set((state) => ({
      backTextPosition: { ...state.backTextPosition, ...position },
    })),
  setBackTextScale: (scale) => set({ backTextScale: scale }),
  setBackTextRotation: (rotation) => set({ backTextRotation: rotation }),

  // Left shoulder actions
  setLeftShoulderImage: (image, imageId) => set({ leftShoulderImage: image, leftShoulderImageId: imageId ?? null }),
  setLeftShoulderText: (text) => set({ leftShoulderText: text }),
  setLeftShoulderTextFont: (font) => set({ leftShoulderTextFont: font }),
  setLeftShoulderTextColor: (color) => set({ leftShoulderTextColor: color }),
  setLeftShoulderPosition: (position) =>
    set((state) => ({
      leftShoulderPosition: { ...state.leftShoulderPosition, ...position },
    })),
  setLeftShoulderScale: (scale) => set({ leftShoulderScale: scale }),
  setLeftShoulderRotation: (rotation) => set({ leftShoulderRotation: rotation }),

  // Right shoulder actions
  setRightShoulderImage: (image, imageId) => set({ rightShoulderImage: image, rightShoulderImageId: imageId ?? null }),
  setRightShoulderText: (text) => set({ rightShoulderText: text }),
  setRightShoulderTextFont: (font) => set({ rightShoulderTextFont: font }),
  setRightShoulderTextColor: (color) => set({ rightShoulderTextColor: color }),
  setRightShoulderPosition: (position) =>
    set((state) => ({
      rightShoulderPosition: { ...state.rightShoulderPosition, ...position },
    })),
  setRightShoulderScale: (scale) => set({ rightShoulderScale: scale }),
  setRightShoulderRotation: (rotation) => set({ rightShoulderRotation: rotation }),

  resetCustomizer: () => set(initialState),
}))
