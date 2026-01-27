'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCartStore } from '@/lib/store/useCartStore'
import { useUIStore } from '@/lib/store/useUIStore'
import { Category, Product } from '@/lib/types'

interface HeaderProps {
  categories?: Category[]
  customizableProducts?: Product[]
}

export function Header({ categories = [], customizableProducts = [] }: HeaderProps) {
  const pathname = usePathname()
  const { getTotalItems, openCart } = useCartStore()
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore()
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false)
  const [isCustomizeDropdownOpen, setIsCustomizeDropdownOpen] = useState(false)
  const [isMobileShopOpen, setIsMobileShopOpen] = useState(false)
  const [isMobileCustomizeOpen, setIsMobileCustomizeOpen] = useState(false)
  const totalItems = getTotalItems()

  const isActive = (path: string) => pathname === path
  const isShopActive = pathname.startsWith('/products')
  const isCustomizeActive = pathname.startsWith('/customize')

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <span className="text-2xl font-bold tracking-tight">HOODIE</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors duration-200 ${
                isActive('/')
                  ? 'text-neutral-900'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Home
            </Link>

            {/* Shop Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsShopDropdownOpen(true)}
              onMouseLeave={() => setIsShopDropdownOpen(false)}
            >
              <Link
                href="/products"
                className={`text-sm font-medium transition-colors duration-200 inline-flex items-center gap-1 py-2 ${
                  isShopActive
                    ? 'text-neutral-900'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Shop
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isShopDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>

              {/* Dropdown Menu */}
              {isShopDropdownOpen && (
                <div className="absolute top-full left-0 pt-2">
                  <div className="w-56 bg-white rounded-lg shadow-lg border border-neutral-100 py-2 animate-fade-in">
                    <Link
                      href="/products"
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 font-medium"
                    >
                      All Products
                    </Link>
                    {categories.length > 0 && (
                      <>
                        <div className="border-t border-neutral-100 my-2" />
                        {categories.map((category) => (
                          <Link
                            key={category.slug}
                            href={`/products?category=${category.slug}`}
                            className="block px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                          >
                            {category.name}
                          </Link>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Customize Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsCustomizeDropdownOpen(true)}
              onMouseLeave={() => setIsCustomizeDropdownOpen(false)}
            >
              <button
                className={`text-sm font-medium transition-colors duration-200 inline-flex items-center gap-1 py-2 ${
                  isCustomizeActive
                    ? 'text-neutral-900'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Customize
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isCustomizeDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isCustomizeDropdownOpen && (
                <div className="absolute top-full left-0 pt-2">
                  <div className="w-56 bg-white rounded-lg shadow-lg border border-neutral-100 py-2 animate-fade-in">
                    <p className="px-4 py-2 text-xs text-neutral-400 uppercase tracking-wider">
                      Choose a product to customize
                    </p>
                    {customizableProducts.length > 0 ? (
                      customizableProducts.map((product) => (
                        <Link
                          key={product.id}
                          href={`/customize?product=${product.id}`}
                          className="block px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                        >
                          {product.name}
                        </Link>
                      ))
                    ) : (
                      <p className="px-4 py-2 text-sm text-neutral-500">
                        No customizable products available
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2 text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-neutral-900 text-white text-xs font-medium rounded-full">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-100 animate-fade-in">
            <nav className="flex flex-col space-y-2">
              <Link
                href="/"
                onClick={closeMobileMenu}
                className={`text-base font-medium py-2 transition-colors duration-200 ${
                  isActive('/')
                    ? 'text-neutral-900'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Home
              </Link>

              {/* Mobile Shop Accordion */}
              <div>
                <button
                  onClick={() => setIsMobileShopOpen(!isMobileShopOpen)}
                  className={`w-full flex items-center justify-between text-base font-medium py-2 transition-colors duration-200 ${
                    isShopActive
                      ? 'text-neutral-900'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Shop
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isMobileShopOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isMobileShopOpen && (
                  <div className="pl-4 mt-2 space-y-2 border-l-2 border-neutral-200">
                    <Link
                      href="/products"
                      onClick={closeMobileMenu}
                      className="block py-1 text-sm text-neutral-600 hover:text-neutral-900 font-medium"
                    >
                      All Products
                    </Link>
                    {categories.map((category) => (
                      <Link
                        key={category.slug}
                        href={`/products?category=${category.slug}`}
                        onClick={closeMobileMenu}
                        className="block py-1 text-sm text-neutral-500 hover:text-neutral-900"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Customize Accordion */}
              <div>
                <button
                  onClick={() => setIsMobileCustomizeOpen(!isMobileCustomizeOpen)}
                  className={`w-full flex items-center justify-between text-base font-medium py-2 transition-colors duration-200 ${
                    isCustomizeActive
                      ? 'text-neutral-900'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Customize
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isMobileCustomizeOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isMobileCustomizeOpen && (
                  <div className="pl-4 mt-2 space-y-2 border-l-2 border-neutral-200">
                    {customizableProducts.length > 0 ? (
                      customizableProducts.map((product) => (
                        <Link
                          key={product.id}
                          href={`/customize?product=${product.id}`}
                          onClick={closeMobileMenu}
                          className="block py-1 text-sm text-neutral-500 hover:text-neutral-900"
                        >
                          {product.name}
                        </Link>
                      ))
                    ) : (
                      <p className="py-1 text-sm text-neutral-400">
                        No customizable products
                      </p>
                    )}
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
