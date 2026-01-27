import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ordersApi } from '../api/orders';
import { Order, OrderItem } from '../types';
import { HoodiePlacementGuide } from '../components/HoodiePlacementGuide';
import { PrintSpecifications } from '../components/PrintSpecifications';
import { extractPlacementSpecifications } from '../utils/measurementConversion';

const PrintView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await ordersApi.getOne(id);
        setOrder(data);
      } catch (err) {
        setError('Failed to load order');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Failed to download image:', err);
      alert('Failed to download image');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Order not found'}</p>
          <Link to="/orders" className="text-purple-600 hover:underline">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  // Filter to only customized items
  const customizedItems = order.items.filter((item) => item.isCustomized);

  return (
    <div className="min-h-screen bg-white">
      {/* Print styles */}
      <style>
        {`
          @media print {
            .no-print { display: none !important; }
            .print-page { page-break-after: always; }
            .print-item { page-break-inside: avoid; }
            body {
              font-size: 12pt;
              color: #000;
              background: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-header {
              border-bottom: 2px solid #000;
              padding-bottom: 1rem;
              margin-bottom: 1rem;
            }
          }
        `}
      </style>

      {/* Header */}
      <div className="bg-gray-900 text-white py-4 px-6 no-print">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to={`/orders/${id}`}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Order
            </Link>
            <h1 className="text-xl font-bold">Print Specifications</h1>
          </div>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Print This Page
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Order header */}
        <div className="print-header mb-8 pb-4 border-b-2 border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                PRINT SPECIFICATIONS
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Order: {order.orderNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                Date: {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                Customer: {order.customerName}
              </p>
              <p className="text-sm text-gray-600">
                Total Items: {customizedItems.length} customized
              </p>
            </div>
          </div>
        </div>

        {/* Items */}
        {customizedItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No customized items in this order.</p>
          </div>
        ) : (
          customizedItems.map((item, itemIndex) => (
            <ItemPrintSection
              key={item.id}
              item={item}
              itemIndex={itemIndex}
              totalItems={customizedItems.length}
              onDownloadImage={handleDownloadImage}
            />
          ))
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>Generated on {new Date().toLocaleString()}</p>
          <p>Order #{order.orderNumber} - WearYourArt Print Specifications</p>
        </div>
      </div>
    </div>
  );
};

interface ItemPrintSectionProps {
  item: OrderItem;
  itemIndex: number;
  totalItems: number;
  onDownloadImage: (url: string, filename: string) => void;
}

const ItemPrintSection: React.FC<ItemPrintSectionProps> = ({
  item,
  itemIndex,
  totalItems,
  onDownloadImage,
}) => {
  const placements = extractPlacementSpecifications(item.customization);
  const frontPlacements = placements.filter(
    (p) => p.area === 'front' || p.area === 'leftShoulder' || p.area === 'rightShoulder'
  );
  const backPlacements = placements.filter((p) => p.area === 'back');

  return (
    <div className={`print-item mb-12 ${itemIndex < totalItems - 1 ? 'print-page' : ''}`}>
      {/* Item header */}
      <div className="bg-gray-100 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Item {itemIndex + 1}: {item.product.name}
            </h2>
            <p className="text-gray-600">
              Color: {item.color} | Size: {item.size} | Qty: {item.quantity}
            </p>
          </div>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
            Custom Design
          </span>
        </div>
      </div>

      {/* Screenshots section */}
      {item.screenshots && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Preview Screenshots
          </h3>
          <div className="grid grid-cols-4 gap-4">
            {(['front', 'back', 'left', 'right'] as const).map((view) => {
              const url = item.screenshots?.[view];
              return url ? (
                <div key={view} className="text-center">
                  <img
                    src={url}
                    alt={`${view} view`}
                    className="w-full h-auto border border-gray-200 rounded"
                  />
                  <p className="text-xs text-gray-500 mt-1 capitalize">{view}</p>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Placement guides and specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Front view section */}
        {frontPlacements.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Front View Placements
            </h3>
            <div className="flex flex-col items-center mb-4">
              <HoodiePlacementGuide
                placements={placements}
                view="front"
                width={250}
                height={333}
              />
            </div>
            <div className="space-y-4">
              {frontPlacements.map((placement) => (
                <PrintSpecifications
                  key={placement.area}
                  placement={placement}
                  onDownloadImage={onDownloadImage}
                />
              ))}
            </div>
          </div>
        )}

        {/* Back view section */}
        {backPlacements.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Back View Placements
            </h3>
            <div className="flex flex-col items-center mb-4">
              <HoodiePlacementGuide
                placements={placements}
                view="back"
                width={250}
                height={333}
              />
            </div>
            <div className="space-y-4">
              {backPlacements.map((placement) => (
                <PrintSpecifications
                  key={placement.area}
                  placement={placement}
                  onDownloadImage={onDownloadImage}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* All design images for easy download */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg no-print">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Quick Download All Designs
        </h3>
        <div className="flex flex-wrap gap-4">
          {placements
            .filter((p) => p.hasImage && p.imageUrl)
            .map((p) => (
              <button
                key={p.area}
                onClick={() =>
                  onDownloadImage(p.imageUrl!, `${p.area}-design.png`)
                }
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              >
                Download {p.label} Image
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default PrintView;
