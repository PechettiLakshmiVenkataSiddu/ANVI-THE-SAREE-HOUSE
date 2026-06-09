'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import { createClient } from '@/lib/supabase/client'
import type { DbCollection } from '@/lib/types/admin'
import Image from 'next/image'
import Link from 'next/link'

export default function CollectionsPage() {
  const [collections, setCollections] = useState<DbCollection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCollections() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('is_active', true)
        .order('title')
      if (!error && data) {
        setCollections(data)
      }
      setLoading(false)
    }
    fetchCollections()
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <section className="relative h-48 md:h-56 bg-secondary border-b border-border overflow-hidden">
        <Image
          src="/images/silk-collection.png"
          alt="Collections"
          fill
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="text-center px-4">
            <p className="text-accent text-sm tracking-widest mb-2">EXPLORE OUR</p>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white">
              COLLECTIONS
            </h1>
          </div>
        </div>
      </section>

      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Collections' },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading collections...</p>
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">No collections available</p>
            <Link href="/shop" className="text-accent font-semibold hover:text-primary">
              Browse all sarees
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.slug}`}
                className="group block"
              >
                <div className="relative h-64 md:h-80 rounded-lg overflow-hidden mb-4">
                  {collection.banner_url ? (
                    <Image
                      src={collection.banner_url}
                      alt={collection.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-serif font-bold text-foreground group-hover:text-primary transition">
                  {collection.title}
                </h2>
                {collection.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {collection.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
