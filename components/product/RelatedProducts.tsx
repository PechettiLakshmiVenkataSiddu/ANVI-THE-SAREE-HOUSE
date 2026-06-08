'use client'

import ProductCard from '@/components/ProductCard'
import type { Product } from '@/lib/types'

interface RelatedProductsProps {
  products: Product[]
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null

  return (
    <section className="mt-16 pt-12 border-t border-border">
      <h2 className="text-2xl font-serif font-bold text-foreground mb-8">You May Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
    </section>
  )
}
