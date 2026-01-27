import Link from 'next/link'
import { Product } from '@/lib/types'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} className="group block h-full">
      <div className="card-hover h-full flex flex-col">
        {/* Image */}
        <div className="aspect-square bg-neutral-100 relative overflow-hidden flex-shrink-0">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {product.tags.includes('bestseller') && (
            <span className="absolute top-3 left-3 px-2 py-1 bg-neutral-900 text-white text-xs font-medium rounded">
              Bestseller
            </span>
          )}
          {product.customizable && (
            <span className="absolute top-3 right-3 px-2 py-1 bg-primary-600 text-white text-xs font-medium rounded">
              Customizable
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-medium text-neutral-900 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-neutral-500 mt-1 line-clamp-2 flex-grow">
            {product.description}
          </p>
          <div className="flex items-center justify-between mt-3">
            <p className="font-semibold text-neutral-900">
              ${product.price.toFixed(2)}
            </p>
            <div className="flex -space-x-1">
              {product.colors.slice(0, 4).map((color) => (
                <div
                  key={color.id}
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
              {product.colors.length > 4 && (
                <div className="w-4 h-4 rounded-full bg-neutral-200 border-2 border-white shadow-sm flex items-center justify-center">
                  <span className="text-[8px] font-medium text-neutral-600">
                    +{product.colors.length - 4}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
