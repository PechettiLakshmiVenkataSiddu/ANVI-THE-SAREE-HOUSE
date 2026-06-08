'use client'

import { useMemo, Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import ProductCard from '@/components/ProductCard'
import { ProductGridSkeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import { getCategoryBySlug } from '@/lib/data/categories'

interface Product {
  id: string
  slug: string
  name: string
  price: number
  original_price?: number
  rating: number
  reviews: number
  images: any[]
  colors: any[]
  sizes: any[]
  description?: string
  category?: string
  is_new?: boolean
  is_best_seller?: boolean
  is_featured?: boolean
  created_at?: string
}

function ShopContent() {
  const searchParams = useSearchParams()
  const category = searchParams.get('category')
  const filter = searchParams.get('filter')
  const query = searchParams.get('q') ?? ''
  const sortBy = searchParams.get('sort') ?? 'popularity'
  const colorFilter = searchParams.get('color')

  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error) setAllProducts((data ?? []) as Product[])
      setLoading(false)
    }
    fetchProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    let result = [...allProducts]

    if (query) {
      result = result.filter(p =>
        p.name?.toLowerCase().includes(query.toLowerCase()) ||
        p.category?.toLowerCase().includes(query.toLowerCase())
      )
    } else if (filter === 'new') {
      result = result.filter(p => p.is_new)
    } else if (filter === 'bestseller') {
      result = result.filter(p => p.is_best_seller)
    } else if (filter === 'featured') {
      result = result.filter(p => p.is_featured)
    } else if (category) {
      result = result.filter(p =>
        p.category?.toLowerCase() === category.toLowerCase()
      )
    }

    if (colorFilter) {
      result = result.filter(p =>
        Array.isArray(p.colors) &&
        p.colors.some((c: any) =>
          (typeof c === 'string' ? c : c?.color ?? '')
            .toLowerCase() === colorFilter.toLowerCase()
        )
      )
    }

    switch (sortBy) {
      case 'price-low':
        return [...result].sort((a, b) => a.price - b.price)
      case 'price-high':
        return [...result].sort((a, b) => b.price - a.price)
      case 'rating':
        return [...result].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      case 'newest':
        return [...result].sort((a, b) =>
          new Date(b.created_at ?? 0).getTime() -
          new Date(a.created_at ?? 0).getTime()
        )
      default:
        return [...result].sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0))
    }
  }, [allProducts, category, filter, query, sortBy, colorFilter])

  const categoryInfo = category ? getCategoryBySlug(category) : null
  const pageTitle = query
    ? `Search: ${query}`
    : filter === 'new' ? 'New Arrivals'
    : filter === 'bestseller' ? 'Best Sellers'
    : filter === 'featured' ? 'Featured'
    : categoryInfo?.title ?? 'All Sarees'

  if (loading) return <ProductGridSkeleton count={6} />

  return (
    <>
      <section className="relative h-48 md:h-56 bg-secondary border-b border-border overflow-hidden">
        <Image
          src="/images/silk-collection.png"
          alt="Shop"
          fill
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="text-center px-4">
            <p className="text-accent text-sm tracking-widest mb-2">EXPLORE OUR</p>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white">
              {pageTitle}
            </h1>
          </div>
        </div>
      </section>

      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Shop', href: '/shop' },
          { label: pageTitle },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          <aside className="lg:col-span-1">
            <div className="bg-card rounded-lg border border-border p-6 space-y-6 sticky top-28">
              <div>
                <h3 className="font-bold mb-4">CATEGORIES</h3>
                <div className="space-y-2">
                  {[
                    { label: 'All Sarees', slug: null },
                    { label: 'Kanchipuram', slug: 'kanchipuram' },
                    { label: 'Banarasi', slug: 'banarasi' },
                    { label: 'Silk', slug: 'silk' },
                    { label: 'Cotton', slug: 'cotton' },
                    { label: 'Designer', slug: 'designer' },
                    { label: 'Wedding', slug: 'wedding' },
                  ].map((cat) => (
                    <a
                      key={cat.label}
                      href={cat.slug ? `/shop?category=${cat.slug}` : '/shop'}
                      className={`block text-sm py-1 transition ${
                        category === cat.slug || (!category && !cat.slug)
                          ? 'text-primary font-semibold'
                          : 'text-foreground hover:text-primary'
                      }`}
                    >
                      {cat.label}
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-4">FILTER</h3>
                <div className="space-y-2">
                  {[
                    { label: 'New Arrivals', href: '/shop?filter=new' },
                    { label: 'Best Sellers', href: '/shop?filter=bestseller' },
                    { label: 'Featured', href: '/shop?filter=featured' },
                  ].map((f) => (
                    <a
                      key={f.label}
                      href={f.href}
                      className="block text-sm hover:text-primary transition"
                    >
                      {f.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-8">
              <p className="text-sm text-muted-foreground">
                Showing {filteredProducts.length} result
                {filteredProducts.length !== 1 ? 's' : ''}
              </p>
              <select
                defaultValue={sortBy}
                onChange={(e) => {
                  const params = new URLSearchParams(searchParams.toString())
                  params.set('sort', e.target.value)
                  window.location.href = `/shop?${params.toString()}`
                }}
                className="bg-background border border-border px-3 py-2 rounded-md text-sm"
              >
                <option value="popularity">Popularity</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest</option>
                <option value="rating">Best Rating</option>
              </select>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">No products found</p>
                <a
                  href="/shop"
                  className="text-accent font-semibold hover:text-primary"
                >
                  Browse all sarees
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    slug={product.slug}
                    image={product.images}
                    name={product.name}
                    price={product.price}
                    original_price={product.original_price}
                    rating={product.rating ?? 0}
                    reviews={product.reviews ?? 0}
                    colors={product.colors ?? []}
                    sizes={product.sizes ?? []}
                    description={product.description ?? ''}
                    category={product.category ?? ''}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Suspense fallback={<ProductGridSkeleton count={6} />}>
        <ShopContent />
      </Suspense>
      <Footer />
    </main>
  )
}