'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import ProductZoom from '@/components/product/ProductZoom'

interface ProductGalleryProps {
  images: string[]
  name: string
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0)
  const [zoomOpen, setZoomOpen] = useState(false)

  const prev = () => setSelected((s) => (s - 1 + images.length) % images.length)
  const next = () => setSelected((s) => (s + 1) % images.length)

  return (
    <>
      <div className="flex flex-col-reverse md:flex-row gap-4">
        {/* Thumbnails */}
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelected(index)}
              className={`relative w-16 h-16 md:w-20 md:h-20 rounded-lg border-2 flex-shrink-0 overflow-hidden transition ${
                selected === index ? 'border-primary' : 'border-border hover:border-primary/50'
              }`}
            >
              <Image src={image} alt={`${name} ${index + 1}`} fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>

        {/* Main Image */}
        <div className="relative flex-1 bg-secondary rounded-lg overflow-hidden aspect-square group">
          <AnimatePresence mode="wait">
            <motion.div
              key={selected}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <Image
                src={images[selected]}
                alt={name}
                fill
                className="object-cover cursor-zoom-in"
                onClick={() => setZoomOpen(true)}
                sizes="(max-width:768px) 100vw, 50vw"
                priority
              />
            </motion.div>
          </AnimatePresence>

          <div className="absolute top-4 left-4 bg-destructive text-white px-3 py-1 rounded-full text-xs font-semibold">
            Sale
          </div>

          <button
            onClick={() => setZoomOpen(true)}
            className="absolute bottom-4 right-4 bg-white/90 rounded-full p-2 shadow-md hover:bg-white transition opacity-0 group-hover:opacity-100"
            aria-label="Zoom image"
          >
            <ZoomIn size={20} />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow opacity-0 group-hover:opacity-100 transition"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow opacity-0 group-hover:opacity-100 transition"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>
      </div>

      <ProductZoom
        images={images}
        initialIndex={selected}
        open={zoomOpen}
        onClose={() => setZoomOpen(false)}
        name={name}
      />
    </>
  )
}
