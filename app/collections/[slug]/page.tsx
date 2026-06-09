'use client'

import { useEffect, useState } from 'react'
import { use } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import ProductCard from '@/components/ProductCard'
import { createClient } from '@/lib/supabase/client'
import type { DbCollection, DbProduct } from '@/lib/types/admin'
import Image from 'next/image'

interface CollectionPageProps {
  params: Promise<{ slug: string }>
}

export default function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = use(params)
  const [collection, setCollection] = useState<DbCollection | null>(null)
  const [products, setProducts] = useState<DbProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCollection() {
      const supabase = createClient()
      
      // Fetch collection
      const { data: collectionData, error: collectionError } = await supabase
        .from('collections')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (collectionError || !collectionData) {
        setLoading(false)
        return
      }

      setCollection(collectionData)

      // Fetch products in this collection
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('collection_id', collectionData.id)
        .order('created_at', { ascending: false })

      if (productsData) {
        setProducts(productsData)
      }

      setLoading(false)
    }

    fetchCollection()
  }, [slug])

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading collection...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (!collection) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Collection not found</p>
            <a href="/collections" className="text-accent font-semibold hover:text-primary">
              View all collections
            </a>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {collection.banner_url && (
        <section className="relative h-64 md:h-80 bg-secondary border-b border-border overflow-hidden">
          <Image
            src={collection.banner_url}
            alt={collection.title}
            fill
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="text-center px-4">
              <p className="text-accent text-sm tracking-widest mb-2">COLLECTION</p>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-white">
                {collection.title}
              </h1>
            </div>
          </div>
        </section>
      )}

      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Collections', href: '/collections' },
          { label: collection.title },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {collection.description && (
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-foreground text-lg leading-relaxed">{collection.description}</p>
          </div>
        )}

        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">No products in this collection yet</p>
            <a href="/shop" className="text-accent font-semibold hover:text-primary">
              Browse all sarees
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
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

      <Footer />
    </main>
  )
}
