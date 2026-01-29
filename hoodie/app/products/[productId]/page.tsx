import { notFound } from 'next/navigation'
import { getProduct } from '@/lib/api/client'
import { ProductDetail } from './ProductDetail'

export const dynamic = 'force-dynamic'

interface ProductDetailPageProps {
  params: Promise<{ productId: string }>
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { productId } = await params

  let product
  try {
    product = await getProduct(productId)
  } catch {
    notFound()
  }

  return <ProductDetail product={product} />
}
