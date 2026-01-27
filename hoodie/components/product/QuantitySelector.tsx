interface QuantitySelectorProps {
  quantity: number
  onChange: (quantity: number) => void
  min?: number
  max?: number
}

export function QuantitySelector({
  quantity,
  onChange,
  min = 1,
  max = 10,
}: QuantitySelectorProps) {
  const decrease = () => {
    if (quantity > min) {
      onChange(quantity - 1)
    }
  }

  const increase = () => {
    if (quantity < max) {
      onChange(quantity + 1)
    }
  }

  return (
    <div>
      <span className="text-sm font-medium text-neutral-900 mb-3 block">Quantity</span>
      <div className="inline-flex items-center border border-neutral-200 rounded-lg">
        <button
          onClick={decrease}
          disabled={quantity <= min}
          className="px-4 py-3 text-neutral-500 hover:text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <span className="px-4 py-3 text-base font-medium min-w-[3rem] text-center border-x border-neutral-200">
          {quantity}
        </span>
        <button
          onClick={increase}
          disabled={quantity >= max}
          className="px-4 py-3 text-neutral-500 hover:text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  )
}
