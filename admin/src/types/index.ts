export interface Admin {
  id: string;
  email: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  customizationPrice: number;
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  features: string[];
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  inStock: boolean;
  customizable: boolean;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'PENDING' | 'DELIVERED' | 'CANCELLED';

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

export interface ScreenshotUrls {
  front: string;
  back: string;
  left: string;
  right: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    images: string[];
    slug?: string;
  };
  quantity: number;
  color: string;
  size: string;
  price: number;
  customization?: any;
  isCustomized?: boolean;
  screenshots?: ScreenshotUrls;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  customerEmail: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
