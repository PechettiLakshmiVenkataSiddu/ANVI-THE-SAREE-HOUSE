'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

interface StarRatingProps {
  rating?: number
  onRatingChange?: (rating: number) => void
  readonly?: boolean
  size?: number
}

export default function StarRating({ rating = 0, onRatingChange, readonly = false, size = 20 }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const handleMouseEnter = (index: number) => {
    if (!readonly) {
      setHoverRating(index + 1)
    }
  }

  const handleMouseLeave = () => {
    setHoverRating(0)
  }

  const handleClick = (index: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(index + 1)
    }
  }

  const displayRating = hoverRating || rating

  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={`transition ${
            i < displayRating
              ? 'fill-accent text-accent'
              : 'text-muted'
          } ${!readonly ? 'cursor-pointer hover:scale-110' : ''}`}
          onMouseEnter={() => handleMouseEnter(i)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(i)}
        />
      ))}
    </div>
  )
}
