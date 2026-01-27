import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ordersApi } from '../api/orders';
import { uploadApi } from '../api/upload';
import { Order, OrderStatus, OrderItem } from '../types';
import { ArrowLeft, Package, MapPin, Mail, User, Palette, X, ChevronLeft, ChevronRight, Printer } from 'lucide-react';

const statusOptions: OrderStatus[] = [
  'PENDING',
  'DELIVERED',
  'CANCELLED',
];

// Screenshot view labels
const screenshotViews = ['front', 'back', 'left', 'right'] as const;
type ScreenshotView = (typeof screenshotViews)[number];

// Screenshot lightbox component
interface ScreenshotLightboxProps {
  item: OrderItem;
  initialView: ScreenshotView;
  onClose: () => void;
}

function ScreenshotLightbox({ item, initialView, onClose }: ScreenshotLightboxProps) {
  const [currentView, setCurrentView] = useState<ScreenshotView>(initialView);
  const currentIndex = screenshotViews.indexOf(currentView);

  const goToPrev = () => {
    const newIndex = (currentIndex - 1 + screenshotViews.length) % screenshotViews.length;
    setCurrentView(screenshotViews[newIndex]);
  };

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % screenshotViews.length;
    setCurrentView(screenshotViews[newIndex]);
  };

  const currentUrl = item.screenshots?.[currentView];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div className="relative max-w-4xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
        >
          <X size={32} />
        </button>

        <div className="relative bg-white rounded-xl overflow-hidden">
          <div className="aspect-square bg-gray-100 flex items-center justify-center">
            {currentUrl ? (
              <img
                src={currentUrl}
                alt={`${currentView} view`}
                className="w-full h-full object-contain"
              />
            ) : (
              <p className="text-gray-400">No screenshot available</p>
            )}
          </div>

          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
          >
            <ChevronRight size={24} />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {screenshotViews.map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  view === currentView
                    ? 'bg-primary-600 text-white'
                    : 'bg-white/90 text-gray-700 hover:bg-white'
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 text-center text-white">
          <p className="font-medium">{item.product.name}</p>
          <p className="text-sm text-gray-300">
            {currentView.charAt(0).toUpperCase() + currentView.slice(1)} View
          </p>
        </div>
      </div>
    </div>
  );
}

const getStatusColor = (status: OrderStatus) => {
  const colors: Record<OrderStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };
  return colors[status];
};

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [lightboxItem, setLightboxItem] = useState<{
    item: OrderItem;
    initialView: ScreenshotView;
  } | null>(null);

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      const data = await ordersApi.getOne(id!);
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Failed to load order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (status: OrderStatus) => {
    if (!order) return;

    setIsUpdating(true);
    try {
      const updated = await ordersApi.updateStatus(order.id, status);
      setOrder(updated);
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Order not found</p>
        <button
          onClick={() => navigate('/orders')}
          className="mt-4 text-primary-600 hover:text-primary-700"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={20} />
        Back to Orders
      </button>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Order header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Order {order.orderNumber}
            </h1>
            <p className="text-sm text-gray-500">
              Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
              {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                order.status
              )}`}
            >
              {order.status}
            </span>
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
              disabled={isUpdating}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Customer
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-gray-900">{order.customerName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <a
                  href={`mailto:${order.customerEmail}`}
                  className="text-primary-600 hover:text-primary-700"
                >
                  {order.customerEmail}
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Shipping Address
            </h2>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="text-gray-900">
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.zipCode}
                </p>
                {order.shippingAddress.country && (
                  <p>{order.shippingAddress.country}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>${Number(order.shipping).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>${Number(order.tax).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2 border-t">
                <span>Total</span>
                <span>${Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Order Items ({order.items.length})
              </h2>
              {order.items.some((item) => item.isCustomized) && (
                <Link
                  to={`/orders/${order.id}/print`}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Printer size={16} />
                  Print Specifications
                </Link>
              )}
            </div>
            <div className="space-y-6">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg ${
                    item.isCustomized ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex gap-4">
                    {item.product.images.length > 0 ? (
                      <img
                        src={uploadApi.getFullUrl(item.product.images[0])}
                        alt={item.product.name}
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-lg bg-gray-200 flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">
                          {item.product.name}
                        </h3>
                        {item.isCustomized && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                            <Palette size={10} />
                            Custom
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-gray-500 space-y-1">
                        <p>
                          Color: {item.color} | Size: {item.size}
                        </p>
                        <p>Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ${Number(item.price).toFixed(2)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-sm text-gray-500">
                          ${(Number(item.price) / item.quantity).toFixed(2)} each
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Customization Details */}
                  {item.isCustomized && item.customization && (
                    <div className="mt-4 pt-4 border-t border-purple-200">
                      <h4 className="text-sm font-medium text-purple-900 mb-4">
                        Customization Details
                      </h4>

                      {/* Model Screenshots - 4 views */}
                      {item.screenshots && Object.values(item.screenshots).some(Boolean) && (
                        <div className="mb-6">
                          <p className="text-sm font-medium text-gray-700 mb-3">Hoodie Preview Screenshots</p>
                          <div className="grid grid-cols-4 gap-3">
                            {screenshotViews.map((view) => {
                              const url = item.screenshots?.[view];
                              const viewLabels: Record<ScreenshotView, string> = {
                                front: 'Front View',
                                back: 'Back View',
                                left: 'Left Side',
                                right: 'Right Side',
                              };
                              return (
                                <div key={view} className="flex flex-col">
                                  <button
                                    onClick={() => url && setLightboxItem({ item, initialView: view })}
                                    className="relative aspect-square bg-white rounded-lg overflow-hidden border-2 border-gray-200 hover:border-purple-400 transition-colors group shadow-sm"
                                    disabled={!url}
                                  >
                                    {url ? (
                                      <>
                                        <img
                                          src={url}
                                          alt={`${view} view`}
                                          className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                          <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">
                                            Click to enlarge
                                          </span>
                                        </div>
                                      </>
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                                        <Package size={24} />
                                      </div>
                                    )}
                                  </button>
                                  <span className="mt-1 text-xs font-medium text-gray-600 text-center">
                                    {viewLabels[view]}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Design Placements - showing uploaded images per placement */}
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-3">Custom Design Placements</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {(() => {
                            const c = item.customization;
                            // Map the flat customization structure to placement cards
                            const placements = [
                              {
                                name: 'Chest (Front)',
                                imageUrl: c?.decalImage,
                                text: c?.textValue,
                                textColor: c?.textColor,
                                textFont: c?.textFont,
                                scale: c?.decalScale,
                                position: c?.decalPosition,
                              },
                              {
                                name: 'Back',
                                imageUrl: c?.backImage,
                                text: c?.backText,
                                textColor: c?.backTextColor,
                                textFont: c?.backTextFont,
                                scale: c?.backScale,
                                position: c?.backPosition,
                              },
                              {
                                name: 'Left Shoulder',
                                imageUrl: c?.leftShoulderImage,
                                text: c?.leftShoulderText,
                                textColor: c?.leftShoulderTextColor,
                                textFont: c?.leftShoulderTextFont,
                                scale: c?.leftShoulderScale,
                                position: c?.leftShoulderPosition,
                              },
                              {
                                name: 'Right Shoulder',
                                imageUrl: c?.rightShoulderImage,
                                text: c?.rightShoulderText,
                                textColor: c?.rightShoulderTextColor,
                                textFont: c?.rightShoulderTextFont,
                                scale: c?.rightShoulderScale,
                                position: c?.rightShoulderPosition,
                              },
                            ];

                            return placements
                              .filter(p => p.imageUrl || p.text)
                              .map((placement) => (
                                <div
                                  key={placement.name}
                                  className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
                                >
                                  <div className="flex items-center gap-2 mb-3">
                                    <span className="px-2 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-800">
                                      {placement.name}
                                    </span>
                                  </div>

                                  <div className="space-y-3">
                                    {/* Design Image */}
                                    {placement.imageUrl && (
                                      <div>
                                        <p className="text-xs text-gray-500 mb-1">Uploaded Design:</p>
                                        <img
                                          src={placement.imageUrl}
                                          alt={`${placement.name} design`}
                                          className="w-24 h-24 object-contain rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 bg-gray-50"
                                          onClick={() => window.open(placement.imageUrl, '_blank')}
                                        />
                                      </div>
                                    )}

                                    {/* Text */}
                                    {placement.text && (
                                      <div>
                                        <p className="text-xs text-gray-500 mb-1">Text:</p>
                                        <p
                                          className="text-sm font-medium px-2 py-1 bg-gray-100 rounded inline-block"
                                          style={{
                                            color: placement.textColor || '#000',
                                            fontFamily: placement.textFont || 'inherit'
                                          }}
                                        >
                                          "{placement.text}"
                                        </p>
                                      </div>
                                    )}

                                    {/* Scale */}
                                    {placement.scale && (
                                      <div className="flex items-center gap-2">
                                        <p className="text-xs text-gray-500">Scale:</p>
                                        <span className="text-xs font-medium text-gray-700">
                                          {(placement.scale * 100).toFixed(0)}%
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ));
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Screenshot Lightbox */}
      {lightboxItem && (
        <ScreenshotLightbox
          item={lightboxItem.item}
          initialView={lightboxItem.initialView}
          onClose={() => setLightboxItem(null)}
        />
      )}
    </div>
  );
}
