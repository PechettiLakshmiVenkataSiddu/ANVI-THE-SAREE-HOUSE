'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Share2, Star, Minus, Plus, Package, Truck, RotateCcw } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import ProductGallery from '@/components/product/ProductGallery'
import RelatedProducts from '@/components/product/RelatedProducts'
import StarRating from '@/components/product/StarRating'
import { getDiscountPercent } from '@/lib/data/products'
import { useCart } from '@/lib/context/cart-context'
import { useWishlist } from '@/lib/context/wishlist-context'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { notFound } from 'next/navigation'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = use(params)
  const router = useRouter()
  const { addItem } = useCart()
  const { toggleItem, isInWishlist } = useWishlist()

  const [product, setProduct] = useState<any>(null)
  const [related, setRelated] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notFoundPage, setNotFoundPage] = useState(false)

  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedBlouse, setSelectedBlouse] = useState('')
  const [quantity, setQuantity] = useState(1)

  // Rating states
  const [user, setUser] = useState<any>(null)
  const [hasOrdered, setHasOrdered] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])
  const [userReview, setUserReview] = useState<any>(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submittingRating, setSubmittingRating] = useState(false)

  useEffect(() => {
    async function fetchProduct() {
      // Try by slug first
      let { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .maybeSingle()

      // If not found by slug, try by id
      if (!data) {
        const res = await supabase
          .from('products')
          .select('*')
          .eq('id', slug)
          .maybeSingle()
        data = res.data
      }

      if (!data) {
        setNotFoundPage(true)
        setLoading(false)
        return
      }

      setProduct(data)

      // Set defaults for selectors
      const colors = Array.isArray(data.colors) ? data.colors : []
      const sizes = Array.isArray(data.sizes) ? data.sizes : []
      const blouseOptions = Array.isArray(data.blouse_options) ? data.blouse_options : []

      setSelectedColor(
        typeof colors[0] === 'string' ? colors[0] : colors[0]?.color ?? ''
      )
      setSelectedSize(sizes[0] ?? '')
      setSelectedBlouse(blouseOptions[0] ?? '')

      // Fetch related products (same category)
      if (data.category) {
        const { data: relatedData } = await supabase
          .from('products')
          .select('*')
          .eq('category', data.category)
          .neq('id', data.id)
          .limit(4)
        setRelated(relatedData ?? [])
      }

      // Fetch reviews for this product
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', data.id)
        .order('created_at', { ascending: false })
      setReviews(reviewsData ?? [])

      setLoading(false)
    }

    fetchProduct()
  }, [slug])

  useEffect(() => {
    async function fetchUserData() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user && product) {
        // Check if user has ordered this product
        const { data: ordersData } = await supabase
          .from('orders')
          .select('items')
          .eq('user_id', user.id)
        
        const hasOrderedProduct = ordersData?.some((order: any) =>
          order.items?.some((item: any) => item.product_id === product.id)
        )
        setHasOrdered(hasOrderedProduct ?? false)

        // Check if user has already reviewed this product
        const { data: userReviewData } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', product.id)
          .eq('user_id', user.id)
          .single()
        
        if (userReviewData) {
          setUserReview(userReviewData)
          setRating(userReviewData.rating)
          setComment(userReviewData.comment ?? '')
        }
      }
    }

    if (product) {
      fetchUserData()
    }
  }, [product])

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading product...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (notFoundPage || !product) return notFound()

  // Normalize fields — handle both static (camelCase) and Supabase (snake_case)
  const images = Array.isArray(product.images) ? product.images : []
  const colors = Array.isArray(product.colors) ? product.colors : []
  const sizes = Array.isArray(product.sizes) ? product.sizes : []
  const blouseOptions = Array.isArray(product.blouse_options ?? product.blouseOptions)
    ? (product.blouse_options ?? product.blouseOptions)
    : []
  const originalPrice = product.original_price ?? product.originalPrice ?? 0
  const categoryLabel = product.category_label ?? product.categoryLabel ?? product.category ?? ''
  const discount = originalPrice ? getDiscountPercent(product.price, originalPrice) : 0
  const wishlisted = isInWishlist(product.id)

  // Normalize image urls from jsonb array
  const normalizeImage = (img: any): string => {
    if (!img) return '/images/placeholder.png'
    if (typeof img === 'string') return img
    if (img?.url) return img.url
    return '/images/placeholder.png'
  }
  const normalizedImages = images.map(normalizeImage)

  const productObj = {
    ...product,
    images: normalizedImages,
    originalPrice,
    blouseOptions,
    categoryLabel,
  }

  const handleAddToCart = () => {
    addItem(productObj, quantity, selectedColor, selectedSize, selectedBlouse)
  }

  const handleBuyNow = () => {
    addItem(productObj, quantity, selectedColor, selectedSize, selectedBlouse)
    router.push('/checkout')
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: product.name, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleSubmitReview = async () => {
    if (!user || !product || rating === 0) return

    setSubmittingRating(true)
    try {
      if (userReview) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update({ rating, comment })
          .eq('id', userReview.id)
        
        if (error) throw error

        // Update local state
        setReviews(reviews.map(r => r.id === userReview.id ? { ...r, rating, comment } : r))
        setUserReview({ ...userReview, rating, comment })
      } else {
        // Create new review
        const { data, error } = await supabase
          .from('reviews')
          .insert({
            product_id: product.id,
            user_id: user.id,
            rating,
            comment: comment || null,
          })
          .select()
          .single()
        
        if (error) throw error

        // Update local state
        setReviews([data, ...reviews])
        setUserReview(data)
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review. Please try again.')
    } finally {
      setSubmittingRating(false)
    }
  }

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : product.rating ?? 0

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Shop', href: '/shop' },
          { label: categoryLabel, href: `/shop?category=${product.category}` },
          { label: product.name },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ProductGallery images={normalizedImages} name={product.name} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            <div>
              <p className="text-accent text-sm font-semibold tracking-widest mb-2">
                {categoryLabel.toUpperCase()}
              </p>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-3">
                {product.name}
              </h1>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < Math.round(averageRating)
                          ? 'fill-accent text-accent'
                          : 'text-muted'
                      }
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  ({reviews.length} Reviews)
                </span>
              </div>

              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="text-3xl font-bold text-primary">
                  ₹{product.price.toLocaleString()}
                </span>
                {originalPrice > 0 && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      ₹{originalPrice.toLocaleString()}
                    </span>
                    <span className="bg-secondary text-accent-foreground px-3 py-1 rounded text-sm font-semibold">
                      {discount}% OFF
                    </span>
                  </>
                )}
              </div>

              <p className="text-foreground text-sm leading-relaxed mb-6">
                {product.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {[
                  { icon: Package, title: 'PREMIUM QUALITY', desc: 'Finest Fabrics' },
                  { icon: Truck, title: 'FREE SHIPPING', desc: 'Above ₹1999' },
                  { icon: RotateCcw, title: 'EASY RETURNS', desc: 'Within 7 days' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                    <Icon size={18} className="text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold">{title}</p>
                      <p className="text-[10px] text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Colors */}
            {colors.length > 0 && (
              <div>
                <label className="text-sm font-semibold mb-3 block">
                  COLOR: {selectedColor.toUpperCase()}
                </label>
                <div className="flex gap-3 flex-wrap mb-6">
                  {colors.map((c: any) => {
                    const colorName = typeof c === 'string' ? c : c.color
                    const colorHex = typeof c === 'string' ? c : c.colorHex ?? c.color
                    return (
                      <button
                        key={colorName}
                        onClick={() => setSelectedColor(colorName)}
                        className={`w-8 h-8 rounded-full border-2 transition ${
                          selectedColor === colorName
                            ? 'border-foreground scale-110 ring-2 ring-offset-2 ring-primary/30'
                            : 'border-border'
                        }`}
                        style={{ backgroundColor: colorHex }}
                        title={colorName}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {/* Sizes */}
            {sizes.length > 0 && (
              <div>
                <label className="text-sm font-semibold mb-3 block">SIZE</label>
                <div className="flex gap-2 flex-wrap mb-6">
                  {sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 text-xs border rounded-md transition ${
                        selectedSize === size
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Blouse Options */}
            {blouseOptions.length > 0 && (
              <div>
                <label className="text-sm font-semibold mb-3 block">BLOUSE OPTION</label>
                <div className="flex gap-2 flex-wrap mb-6">
                  {blouseOptions.map((option: string) => (
                    <button
                      key={option}
                      onClick={() => setSelectedBlouse(option)}
                      className={`px-4 py-2 text-xs border rounded-md transition ${
                        selectedBlouse === option
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold">QUANTITY</label>
              <div className="flex items-center border border-border rounded-md">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 hover:bg-secondary"
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2.5 hover:bg-secondary"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-md font-semibold tracking-wide hover:opacity-90 transition"
              >
                ADD TO CART
              </button>
              <button
                onClick={handleBuyNow}
                className="w-full border-2 border-primary text-primary py-3.5 rounded-md font-semibold tracking-wide hover:bg-secondary transition"
              >
                BUY NOW
              </button>
            </div>

            <div className="flex gap-4 pt-4 border-t border-border">
              <button
                onClick={() => toggleItem(productObj)}
                className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-secondary rounded-md transition text-sm"
              >
                <Heart
                  size={18}
                  className={wishlisted ? 'fill-destructive text-destructive' : ''}
                />
                {wishlisted ? 'In Wishlist' : 'Add to Wishlist'}
              </button>
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-secondary rounded-md transition text-sm"
              >
                <Share2 size={18} />
                Share
              </button>
            </div>
          </motion.div>
        </div>

        <RelatedProducts products={related} />

        {/* Reviews Section */}
        <div className="mt-16 border-t border-border pt-12">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-8">Customer Reviews</h2>
          
          {reviews.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No reviews yet. Be the first to review this product!</p>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <StarRating rating={review.rating} readonly size={16} />
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-foreground">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Rating Form - Only show if logged in and has ordered */}
          {user && hasOrdered && (
            <div className="mt-8 bg-card border border-border rounded-lg p-6">
              <h3 className="font-bold text-foreground mb-4">
                {userReview ? 'Update Your Review' : 'Write a Review'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block">Your Rating</label>
                  <StarRating rating={rating} onRatingChange={setRating} size={24} />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-2 block">Your Review (Optional)</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    placeholder="Share your experience with this product..."
                    className="w-full px-4 py-2 border border-border rounded-md bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <button
                  onClick={handleSubmitReview}
                  disabled={submittingRating || rating === 0}
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-md text-sm font-semibold disabled:opacity-60"
                >
                  {submittingRating ? 'Submitting...' : userReview ? 'Update Review' : 'Submit Review'}
                </button>
              </div>
            </div>
          )}

          {user && !hasOrdered && (
            <p className="text-sm text-muted-foreground mt-4 text-center">
              You must purchase this product before writing a review.
            </p>
          )}

          {!user && (
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Please <a href="/login" className="text-accent hover:text-primary">log in</a> to write a review.
            </p>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}