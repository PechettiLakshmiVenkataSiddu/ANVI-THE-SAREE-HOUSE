import type { Category } from '@/lib/types'

export const categories: Category[] = [
  {
    id: '1',
    slug: 'kanchipuram',
    title: 'KANCHIPURAM',
    image: '/images/kanchipuram-collection.png',
    description: 'Traditional temple-inspired weaves from Tamil Nadu',
  },
  {
    id: '2',
    slug: 'banarasi',
    title: 'BANARASI',
    image: '/images/banarasi-collection.png',
    description: 'Luxurious zari work from Varanasi',
  },
  {
    id: '3',
    slug: 'silk',
    title: 'SILK',
    image: '/images/silk-collection.png',
    description: 'Premium silk sarees for every occasion',
  },
  {
    id: '4',
    slug: 'cotton',
    title: 'COTTON',
    image: '/images/cotton-collection.png',
    description: 'Breathable cotton sarees for daily elegance',
  },
  {
    id: '5',
    slug: 'designer',
    title: 'DESIGNER',
    image: '/images/designer-collection.png',
    description: 'Contemporary designer creations',
  },
  {
    id: '6',
    slug: 'wedding',
    title: 'WEDDING',
    image: '/images/wedding-collection.png',
    description: 'Bridal and wedding collection',
  },
]

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug)
}
