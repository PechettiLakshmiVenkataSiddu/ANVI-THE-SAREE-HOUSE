'use client'

import { motion } from 'framer-motion'
import ProductCard from '@/components/ProductCard'
import Link from 'next/link'
import type { Product } from '@/lib/types'

interface ProductGridProps {
  title: string
  subtitle?: string
  products: Product[]
  viewAllHref?: string
  className?: string
}

export default function ProductGrid({ title, subtitle, products, viewAllHref, className = '' }: ProductGridProps) {
  return (
    <section className={`py-16 md:py-20 ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            {subtitle && <p className="text-accent text-sm tracking-widest mb-2">{subtitle}</p>}
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-foreground">{title}</h2>
          </div>
          {viewAllHref && (
            <Link href={viewAllHref} className="text-accent hover:text-primary transition font-semibold text-sm hidden sm:block">
              VIEW ALL →
            </Link>
          )}
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              slug={product.slug}
              image={product.images[0]}
              name={product.name}
              price={product.price}
              originalPrice={product.originalPrice}
              rating={product.rating}
              reviews={product.reviews}
            />
          ))}
        </div>

        {viewAllHref && (
          <div className="text-center mt-8 sm:hidden">
            <Link href={viewAllHref} className="text-accent hover:text-primary font-semibold text-sm">
              VIEW ALL →
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
