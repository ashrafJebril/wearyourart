'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useCartStore } from '@/lib/store/useCartStore'
import { createOrder, uploadOrderScreenshots } from '@/lib/api/client'
import { ShippingInfo, ScreenshotUrls } from '@/lib/types'

// Dynamically import the preview component to avoid SSR issues with Three.js
const CustomizationPreview = dynamic(
  () => import('@/components/checkout/CustomizationPreview').then((mod) => mod.CustomizationPreview),
  { ssr: false, loading: () => <div className="w-full aspect-square bg-neutral-100 rounded-lg animate-pulse" /> }
)

// Type for the preview ref
interface CustomizationPreviewRef {
  captureAllScreenshots: () => Promise<ScreenshotUrls>
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const [orderNumber, setOrderNumber] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [captureProgress, setCaptureProgress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  })
  const [errors, setErrors] = useState<Partial<ShippingInfo>>({})

  // Refs for customization preview components
  const previewRefs = useRef<Map<string, CustomizationPreviewRef>>(new Map())

  const subtotal = Math.round(getTotalPrice() * 100) / 100
  const shipping = subtotal > 100 ? 0 : 9.99
  const tax = Math.round(subtotal * 0.08 * 100) / 100
  const total = Math.round((subtotal + shipping + tax) * 100) / 100

  // Get customized items
  const customizedItems = items.filter((item) => {
    const c = item.customization
    return c && (
      c.decalImage ||
      c.textValue ||
      c.backImage ||
      c.backText ||
      c.leftShoulderImage ||
      c.leftShoulderText ||
      c.rightShoulderImage ||
      c.rightShoulderText
    )
  })

  useEffect(() => {
    if (items.length === 0 && !orderPlaced) {
      router.push('/cart')
    }
  }, [items.length, orderPlaced, router])

  const validateShipping = () => {
    const newErrors: Partial<ShippingInfo> = {}
    if (!shippingInfo.firstName) newErrors.firstName = 'First name is required'
    if (!shippingInfo.lastName) newErrors.lastName = 'Last name is required'
    if (!shippingInfo.email) newErrors.email = 'Email is required'
    if (!shippingInfo.address) newErrors.address = 'Address is required'
    if (!shippingInfo.city) newErrors.city = 'City is required'
    if (!shippingInfo.state) newErrors.state = 'State is required'
    if (!shippingInfo.zipCode) newErrors.zipCode = 'ZIP code is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const captureAllScreenshots = async (): Promise<Map<string, ScreenshotUrls>> => {
    const screenshotsMap = new Map<string, ScreenshotUrls>()

    for (const item of customizedItems) {
      const previewRef = previewRefs.current.get(item.id)
      if (previewRef) {
        setCaptureProgress(`Capturing ${item.name}...`)
        try {
          const screenshots = await previewRef.captureAllScreenshots()
          screenshotsMap.set(item.id, screenshots)
        } catch (err) {
          console.error(`Failed to capture screenshots for item ${item.id}:`, err)
        }
      }
    }

    return screenshotsMap
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateShipping()) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Step 1: Capture screenshots for customized items
      let screenshotsMap = new Map<string, ScreenshotUrls>()
      if (customizedItems.length > 0) {
        setIsCapturing(true)
        setCaptureProgress('Preparing to capture screenshots...')
        screenshotsMap = await captureAllScreenshots()
        setIsCapturing(false)
        setCaptureProgress('')
      }

      // Step 2: Create the order
      const order = await createOrder({
        customerName: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        customerEmail: shippingInfo.email,
        shippingAddress: {
          street: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          zipCode: shippingInfo.zipCode,
          country: shippingInfo.country,
        },
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          color: item.color.name,
          size: item.size,
          price: Math.round(item.price * 100) / 100,
          customization: item.customization || undefined,
        })),
        subtotal,
        shipping,
        tax,
        total,
      })

      // Step 3: Upload screenshots for customized items
      console.log('[Checkout] Screenshot upload - screenshotsMap size:', screenshotsMap.size)
      console.log('[Checkout] Order items count:', order.items?.length)

      if (screenshotsMap.size > 0 && order.items) {
        // Log all cart items and their IDs for debugging
        console.log('[Checkout] Cart items:', items.map(ci => ({
          id: ci.id,
          productId: ci.productId,
          color: ci.color.name,
          size: ci.size,
        })))

        // Log all order items for debugging
        console.log('[Checkout] Order items:', order.items.map((oi: any) => ({
          id: oi.id,
          productId: oi.productId,
          color: oi.color,
          size: oi.size,
        })))

        const screenshotData = {
          items: order.items
            .filter((orderItem: any) => {
              // Find the cart item that matches this order item
              const cartItem = items.find(
                (ci) =>
                  ci.productId === orderItem.productId &&
                  ci.color.name === orderItem.color &&
                  ci.size === orderItem.size
              )
              const hasScreenshots = cartItem && screenshotsMap.has(cartItem.id)
              console.log(`[Checkout] Order item ${orderItem.id} - cart match: ${!!cartItem}, has screenshots: ${hasScreenshots}`)
              return hasScreenshots
            })
            .map((orderItem: any) => {
              const cartItem = items.find(
                (ci) =>
                  ci.productId === orderItem.productId &&
                  ci.color.name === orderItem.color &&
                  ci.size === orderItem.size
              )
              const screenshots = screenshotsMap.get(cartItem!.id)!
              console.log(`[Checkout] Screenshots for item ${orderItem.id}:`, {
                hasFront: !!screenshots.front,
                hasBack: !!screenshots.back,
                hasLeft: !!screenshots.left,
                hasRight: !!screenshots.right,
                frontLength: screenshots.front?.length || 0,
              })
              return {
                itemId: orderItem.id,
                screenshots,
              }
            }),
        }

        console.log('[Checkout] Final screenshot data items count:', screenshotData.items.length)

        if (screenshotData.items.length > 0) {
          try {
            console.log('[Checkout] Uploading screenshots for order:', order.id)
            const uploadResult = await uploadOrderScreenshots(order.id, screenshotData)
            console.log('[Checkout] Screenshot upload successful:', uploadResult)
          } catch (uploadErr) {
            console.error('[Checkout] Failed to upload screenshots:', uploadErr)
            // Don't fail the order if screenshot upload fails
          }
        } else {
          console.warn('[Checkout] No screenshot items to upload after filtering')
        }
      } else {
        console.log('[Checkout] Skipping screenshot upload - no screenshots captured or no order items')
      }

      setOrderNumber(order.orderNumber)
      clearCart()
      setOrderPlaced(true)
    } catch (err) {
      console.error('Failed to create order:', err)
      setError('Failed to process your order. Please try again.')
    } finally {
      setIsSubmitting(false)
      setIsCapturing(false)
    }
  }

  if (orderPlaced) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">Order Confirmed!</h1>
        <p className="text-lg text-neutral-600 mb-2">Thank you for your order.</p>
        <p className="text-neutral-500 mb-4">
          Order #{orderNumber}
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
          <p className="text-amber-800 font-medium">Cash on Delivery</p>
          <p className="text-amber-700 text-sm">Please have ${total.toFixed(2)} ready when your order arrives.</p>
        </div>
        <Link href="/products" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <h1 className="text-3xl font-bold text-neutral-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handlePlaceOrder} className="space-y-6">
            {/* Customization Preview Section */}
            {customizedItems.length > 0 && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                <h2 className="text-lg font-semibold mb-4">Review Your Custom Designs</h2>
                <p className="text-sm text-neutral-500 mb-4">
                  Preview your customized items below. Screenshots will be captured when you place your order.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customizedItems.map((item) => (
                    <CustomizationPreview
                      key={item.id}
                      item={item}
                      ref={(ref: CustomizationPreviewRef | null) => {
                        if (ref) {
                          previewRefs.current.set(item.id, ref)
                        } else {
                          previewRefs.current.delete(item.id)
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold mb-6">Shipping Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={shippingInfo.firstName}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
                    className="input-field"
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={shippingInfo.lastName}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
                    className="input-field"
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={shippingInfo.email}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                    className="input-field"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                    className="input-field"
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">City</label>
                  <input
                    type="text"
                    value={shippingInfo.city}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                    className="input-field"
                  />
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">State</label>
                  <input
                    type="text"
                    value={shippingInfo.state}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                    className="input-field"
                  />
                  {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    value={shippingInfo.zipCode}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, zipCode: e.target.value })}
                    className="input-field"
                  />
                  {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-amber-900">Cash on Delivery</p>
                  <p className="text-sm text-amber-700">Pay when your order arrives</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button type="submit" className="btn-primary w-full" disabled={isSubmitting || isCapturing}>
              {isSubmitting || isCapturing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {isCapturing ? captureProgress || 'Capturing screenshots...' : 'Processing...'}
                </span>
              ) : (
                'Place Order'
              )}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-neutral-50 rounded-2xl p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-neutral-900 mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <span className="text-neutral-600">{item.name} x {item.quantity}</span>
                    {item.customization && (
                      <span className="ml-2 text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                        Custom
                      </span>
                    )}
                  </div>
                  <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-neutral-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t border-neutral-200 pt-4">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
