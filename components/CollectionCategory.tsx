'use client'

import Image from 'next/image'
import Link from 'next/link'

interface CollectionCategoryProps {
  title: string
  image: string
  slug: string
}

export default function CollectionCategory({ title, image, slug }: CollectionCategoryProps) {
  return (
    <Link href={`/shop?category=${slug}`}>
      <div className="relative overflow-hidden rounded-lg group cursor-pointer h-48">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-300" />

        {/* Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <h3 className="text-white text-2xl font-bold tracking-widest uppercase">{title}</h3>
          <div className="text-white text-sm mt-2 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
            EXPLORE NOW →
          </div>
        </div>
      </div>
    </Link>
  )
}
