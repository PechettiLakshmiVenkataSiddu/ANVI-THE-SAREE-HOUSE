'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const heroSlides = [
  {
    image: '/images/hero-saree.png',
    title: 'TIMELESS BEAUTY',
    subtitle: 'ELEGANCE IN EVERY DRAPE',
    description: 'Premium Sarees for Every Occasion',
    cta: '/shop',
  },
  {
    image: '/images/silk-collection.png',
    title: 'LUXURY COLLECTION',
    subtitle: 'FINEST SILKS',
    description: 'Crafted for Celebrations',
    cta: '/shop?category=silk',
  },
  {
    image: '/images/kanchipuram-collection.png',
    title: 'TRADITIONAL CRAFT',
    subtitle: 'KANCHIPURAM SILKS',
    description: 'Temple-Inspired Masterpieces',
    cta: '/shop?category=kanchipuram',
  },
]

export default function HeroBanner() {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % heroSlides.length)
  }, [])

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }, [])

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  return (
    <section className="relative h-[420px] md:h-[600px] lg:h-[700px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <Image
            src={heroSlides[current].image}
            alt={heroSlides[current].subtitle}
            fill
            priority={current === 0}
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/20" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm md:text-base tracking-[0.3em] text-accent mb-3"
            >
              {heroSlides[current].title}
            </motion.p>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold mb-4"
            >
              {heroSlides[current].subtitle}
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-sm md:text-lg mb-8 opacity-90"
            >
              {heroSlides[current].description}
            </motion.p>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}>
              <Link
                href={heroSlides[current].cta}
                className="inline-block bg-primary text-primary-foreground px-8 py-3 font-semibold tracking-wide hover:opacity-90 transition rounded-sm"
              >
                SHOP NOW
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-2.5 rounded-full transition z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-2.5 rounded-full transition z-10"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === current ? 'w-8 bg-white' : 'w-3 bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
