import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ordersApi } from '../api/orders';
import { categoriesApi } from '../api/categories';
import { productsApi } from '../api/products';
import { OrderStats, Category, Order } from '../types';
import {
  Package,
  FolderTree,
  ShoppingCart,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, categoriesData, productsData, ordersData] =
          await Promise.all([
            ordersApi.getStats(),
            categoriesApi.getAll(),
            productsApi.getAll({ limit: 1 }),
            ordersApi.getAll({ limit: 5 }),
          ]);

        setStats(statsData);
        setCategories(categoriesData);
        setProductCount(productsData.pagination.total);
        setRecentOrders(ordersData.orders);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Revenue',
      value: `${Number(stats?.totalRevenue || 0).toFixed(2)} JD`,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      label: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      link: '/orders',
    },
    {
      label: 'Products',
      value: productCount,
      icon: Package,
      color: 'bg-purple-500',
      link: '/products',
    },
    {
      label: 'Categories',
      value: categories.length,
      icon: FolderTree,
      color: 'bg-orange-500',
      link: '/categories',
    },
  ];

  const orderStatusCards = [
    {
      label: 'Pending',
      value: stats?.pendingOrders || 0,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 hover:bg-yellow-100',
      status: 'PENDING',
    },
    {
      label: 'Delivered',
      value: stats?.deliveredOrders || 0,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50 hover:bg-green-100',
      status: 'DELIVERED',
    },
    {
      label: 'Cancelled',
      value: stats?.cancelledOrders || 0,
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50 hover:bg-red-100',
      status: 'CANCELLED',
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's an overview.</p>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map(({ label, value, icon: Icon, color, link }) => {
          const content = (
            <div className="flex items-center gap-4">
              <div className={`${color} p-3 rounded-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
            </div>
          );

          return link ? (
            <Link
              key={label}
              to={link}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              {content}
            </Link>
          ) : (
            <div key={label} className="bg-white rounded-xl shadow-sm p-6">
              {content}
            </div>
          );
        })}
      </div>

      {/* Order status breakdown */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Order Status Breakdown
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {orderStatusCards.map(({ label, value, icon: Icon, color, bgColor, status }) => (
            <button
              key={label}
              onClick={() => navigate(`/orders?status=${status}`)}
              className={`flex items-center gap-3 p-4 ${bgColor} rounded-lg transition-colors cursor-pointer text-left`}
            >
              <Icon className={`h-6 w-6 ${color}`} />
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <Link
            to="/orders"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            View all
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3 font-medium">Order</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-3">
                      <Link
                        to={`/orders/${order.id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3">
                      <p className="font-medium text-gray-900">
                        {order.customerName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.customerEmail}
                      </p>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 font-medium">
                      {Number(order.total).toFixed(2)} JD
                    </td>
                    <td className="py-3 text-gray-500 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
