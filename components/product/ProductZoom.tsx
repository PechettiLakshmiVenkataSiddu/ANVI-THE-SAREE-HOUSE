'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'
import Image from 'next/image'

interface ProductZoomProps {
  images: string[]
  initialIndex?: number
  open: boolean
  onClose: () => void
  name: string
}

export default function ProductZoom({ images, initialIndex = 0, open, onClose, name }: ProductZoomProps) {
  const [current, setCurrent] = useState(initialIndex)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    if (open) setCurrent(initialIndex)
  }, [open, initialIndex])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 z-[100] flex flex-col"
      >
        <div className="flex items-center justify-between p-4 text-white">
          <span className="text-sm font-medium truncate">{name}</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setScale((s) => Math.max(1, s - 0.5))} className="p-2 hover:bg-white/10 rounded-full">
              <ZoomOut size={20} />
            </button>
            <button onClick={() => setScale((s) => Math.min(3, s + 0.5))} className="p-2 hover:bg-white/10 rounded-full">
              <ZoomIn size={20} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
              <X size={22} />
            </button>
          </div>
        </div>

        <div className="flex-1 relative flex items-center justify-center overflow-hidden">
          <motion.div
            style={{ scale }}
            className="relative w-full max-w-3xl aspect-square mx-4"
          >
            <Image src={images[current]} alt={name} fill className="object-contain" sizes="90vw" />
          </motion.div>

          {images.length > 1 && (
            <>
              <button
                onClick={() => setCurrent((c) => (c - 1 + images.length) % images.length)}
                className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => setCurrent((c) => (c + 1) % images.length)}
                className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>

        <div className="flex justify-center gap-2 p-4">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`relative w-12 h-12 rounded overflow-hidden border-2 ${
                i === current ? 'border-accent' : 'border-transparent opacity-60'
              }`}
            >
              <Image src={img} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
