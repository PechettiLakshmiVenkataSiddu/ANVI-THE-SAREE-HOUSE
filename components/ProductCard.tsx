'use client'

import { motion } from 'framer-motion'
import { Heart, Star, ShoppingCart, Eye } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { getDiscountPercent } from '@/lib/data/products'
import { useWishlist } from '@/lib/context/wishlist-context'
import { useCart } from '@/lib/context/cart-context'

interface ProductCardProps {
  id: string
  slug?: string
  image: string | { url: string } | any
  name: string
  price: number
  originalPrice?: number
  original_price?: number
  rating: number
  reviews: number
  colors?: any[]
  sizes?: any[]
  description?: string
  category?: string
}

export default function ProductCard({
  id,
  slug,
  image,
  name,
  price,
  originalPrice,
  original_price,
  rating,
  reviews,
  colors = [],
  sizes = [],
  description = '',
  category = '',
}: ProductCardProps) {
  const { toggleItem, isInWishlist } = useWishlist()
  const { addItem } = useCart()

  // Support both static (originalPrice) and Supabase (original_price) formats
  const finalOriginalPrice = originalPrice ?? original_price
  const discount = finalOriginalPrice
    ? getDiscountPercent(price, finalOriginalPrice)
    : 0
  const wishlisted = isInWishlist(id)
  const productSlug = slug ?? id

  // Support both string images and Supabase jsonb image arrays
  const imageUrl = (() => {
    if (!image) return '/images/placeholder.png'
    if (typeof image === 'string') return image
    if (Array.isArray(image) && image.length > 0) {
      const first = image[0]
      return typeof first === 'string' ? first : first?.url ?? '/images/placeholder.png'
    }
    if (typeof image === 'object' && image?.url) return image.url
    return '/images/placeholder.png'
  })()

  // Build product object from props (works for both static and Supabase products)
  const productObj = {
    id,
    slug: productSlug,
    name,
    price,
    originalPrice: finalOriginalPrice,
    original_price: finalOriginalPrice,
    rating,
    reviews,
    images: [imageUrl],
    colors,
    sizes,
    description,
    category,
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(productObj as any)
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleItem(productObj as any)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group"
    >
      <Link href={`/product/${productSlug}`}>
        <div className="bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-shadow duration-300">
          <div className="relative bg-secondary overflow-hidden aspect-square">
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
            />
            {discount > 0 && (
              <div className="absolute top-3 right-3 bg-destructive text-white px-3 py-1 rounded-full text-xs font-semibold">
                {discount}% OFF
              </div>
            )}
            <button
              onClick={handleWishlist}
              className="absolute top-3 left-3 bg-white rounded-full p-2 shadow-md hover:bg-secondary transition opacity-0 group-hover:opacity-100 z-10"
              aria-label="Add to wishlist"
            >
              <Heart
                size={18}
                className={wishlisted ? 'fill-destructive text-destructive' : 'text-foreground'}
              />
            </button>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="bg-white text-foreground px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 shadow-lg">
                <Eye size={16} /> Quick View
              </span>
            </div>
          </div>

          <div className="p-4 space-y-2">
            <h3 className="text-foreground font-semibold text-sm line-clamp-2 group-hover:text-primary transition">
              {name}
            </h3>
            <div className="flex items-center gap-1">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={i < Math.round(rating) ? 'fill-accent text-accent' : 'text-muted'}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">({reviews})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">₹{price.toLocaleString()}</span>
              {finalOriginalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ₹{finalOriginalPrice.toLocaleString()}
                </span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              className="w-full bg-primary text-primary-foreground py-2 rounded-md font-semibold text-sm hover:opacity-90 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 md:opacity-100"
            >
              <ShoppingCart size={14} />
              ADD TO CART
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}