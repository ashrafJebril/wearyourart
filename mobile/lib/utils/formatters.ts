export function formatPrice(price: number | string | undefined | null): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (numPrice == null || isNaN(numPrice)) {
    return '$0.00';
  }
  return `$${numPrice.toFixed(2)}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatOrderStatus(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'Processing'
    case 'DELIVERED':
      return 'Delivered'
    case 'CANCELLED':
      return 'Cancelled'
    default:
      return status
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'PENDING':
      return '#f59e0b' // amber
    case 'DELIVERED':
      return '#22c55e' // green
    case 'CANCELLED':
      return '#ef4444' // red
    default:
      return '#6b7280' // gray
  }
}
