'use client'

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Package, Truck, RotateCcw, Lock, Headphones } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/layout/Footer'
import HeroBanner from '@/components/home/HeroBanner'
import ProductGrid from '@/components/home/ProductGrid'
import Testimonials from '@/components/home/Testimonials'
import Newsletter from '@/components/home/Newsletter'
import CollectionCategory from '@/components/CollectionCategory'
import FeatureBadge from '@/components/FeatureBadge'
import { categories } from '@/lib/data/categories'

const features = [
  { icon: Package, title: 'PREMIUM QUALITY', description: 'Finest Fabrics' },
  { icon: Truck, title: 'FREE SHIPPING', description: 'On orders above ₹1999' },
  { icon: RotateCcw, title: 'EASY RETURNS', description: 'Within 7 days' },
  { icon: Lock, title: 'SECURE PAYMENTS', description: '100% Safe & Secure' },
  { icon: Headphones, title: '24/7 SUPPORT', description: "We're here to help" },
]

export default function HomePage() {
  // ✅ Fixed
const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
const [newArrivals, setNewArrivals] = useState<any[]>([])
const [bestSellers, setBestSellers] = useState<any[]>([])
const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    fetchAllProducts()
  }, [])

  async function fetchAllProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching products:", error)
      setLoading(false)
      return
    }

    const all = data ?? []

    // Filter from Supabase data using your boolean columns
    setFeaturedProducts(all.filter(p => p.is_featured).slice(0, 4))
    setNewArrivals(all.filter(p => p.is_new).slice(0, 4))
    setBestSellers(all.filter(p => p.is_best_seller).slice(0, 4))
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroBanner />

      <section className="bg-card border-y border-border py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {features.map((feature, index) => (
              <FeatureBadge key={index} icon={feature.icon} title={feature.title} description={feature.description} />
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-10">
          <p className="text-accent text-sm tracking-widest mb-2">COLLECTIONS</p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((collection) => (
            <CollectionCategory key={collection.slug} title={collection.title} image={collection.image} slug={collection.slug} />
          ))}
        </div>
      </section>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">
          Loading products...
        </div>
      ) : (
        <>
          <ProductGrid
            title="Featured Products"
            subtitle="CURATED FOR YOU"
            products={featuredProducts}
            viewAllHref="/shop?filter=featured"
            className="bg-card border-t border-border"
          />
          <ProductGrid
            title="New Arrivals"
            subtitle="JUST LANDED"
            products={newArrivals}
            viewAllHref="/shop?filter=new"
          />
          <ProductGrid
            title="Best Sellers"
            subtitle="CUSTOMER FAVORITES"
            products={bestSellers}
            viewAllHref="/shop?filter=bestseller"
            className="bg-card border-t border-border"
          />
        </>
      )}

      <Testimonials />
      <Newsletter />
      <Footer />
    </main>
  )
}