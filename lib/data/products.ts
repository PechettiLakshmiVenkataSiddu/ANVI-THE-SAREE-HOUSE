import type { Product, Testimonial } from '@/lib/types'

const defaultSizes = ['Free Size', '5.5 Meters', '6 Meters']
const defaultBlouse = ['Without Blouse', 'With Blouse', 'Custom Blouse']

export const products: Product[] = [
  {
    id: '1',
    slug: 'royal-pink-banarasi-silk-saree',
    name: 'Royal Pink Banarasi Silk Saree',
    description:
      'Luxurious Banarasi silk saree with intricate zari weaving and a rich pallu. Perfect for weddings and festive occasions.',
    details: [
      'Premium Banarasi silk',
      'Intricate zari weaving',
      'Traditional design with golden pallu',
      'Length: 5.5 meters',
      'Perfect for weddings and celebrations',
    ],
    price: 2899,
    originalPrice: 4199,
    images: ['/images/saree-1.png', '/images/saree-2.png', '/images/saree-3.png', '/images/saree-4.png'],
    category: 'banarasi',
    categoryLabel: 'Banarasi Saree',
    colors: [
      { color: 'Pink', colorHex: '#EC4899' },
      { color: 'Green', colorHex: '#22C55E' },
      { color: 'Maroon', colorHex: '#7F1D1D' },
      { color: 'Blue', colorHex: '#3B82F6' },
      { color: 'Navy', colorHex: '#1E3A5F' },
    ],
    sizes: defaultSizes,
    blouseOptions: defaultBlouse,
    rating: 5,
    reviews: 128,
    isNew: true,
    isBestSeller: true,
    isFeatured: true,
    tags: ['wedding', 'festive', 'silk'],
  },
  {
    id: '2',
    slug: 'mehendi-green-woven-saree',
    name: 'Mehendi Green Woven Saree',
    description: 'Elegant mehendi green saree with traditional woven patterns, ideal for festive celebrations.',
    details: ['Handwoven cotton blend', 'Traditional motifs', 'Lightweight and comfortable', 'Length: 5.5 meters'],
    price: 2699,
    originalPrice: 3899,
    images: ['/images/saree-2.png', '/images/saree-1.png', '/images/saree-3.png'],
    category: 'cotton',
    categoryLabel: 'Cotton Saree',
    colors: [
      { color: 'Green', colorHex: '#22C55E' },
      { color: 'Gold', colorHex: '#D4AF37' },
    ],
    sizes: defaultSizes,
    blouseOptions: defaultBlouse,
    rating: 4.5,
    reviews: 96,
    isNew: true,
    isFeatured: true,
    tags: ['festive', 'casual'],
  },
  {
    id: '3',
    slug: 'lavender-organza-saree',
    name: 'Lavender Organza Saree',
    description: 'Delicate lavender organza saree with subtle shimmer, perfect for parties and receptions.',
    details: ['Premium organza fabric', 'Subtle shimmer finish', 'Lightweight drape', 'Length: 5.5 meters'],
    price: 2599,
    originalPrice: 3599,
    images: ['/images/saree-3.png', '/images/saree-4.png', '/images/saree-5.png'],
    category: 'designer',
    categoryLabel: 'Designer Saree',
    colors: [
      { color: 'Lavender', colorHex: '#A855F7' },
      { color: 'Pink', colorHex: '#EC4899' },
    ],
    sizes: defaultSizes,
    blouseOptions: defaultBlouse,
    rating: 4.5,
    reviews: 78,
    isNew: true,
    tags: ['party', 'wedding'],
  },
  {
    id: '4',
    slug: 'teal-blue-silk-saree',
    name: 'Teal Blue Silk Saree',
    description: 'Stunning teal blue silk saree with golden border, a timeless addition to your wardrobe.',
    details: ['Pure silk fabric', 'Golden zari border', 'Rich color palette', 'Length: 5.5 meters'],
    price: 2799,
    originalPrice: 3999,
    images: ['/images/saree-4.png', '/images/saree-1.png', '/images/saree-2.png'],
    category: 'silk',
    categoryLabel: 'Silk Saree',
    colors: [
      { color: 'Teal', colorHex: '#0D9488' },
      { color: 'Blue', colorHex: '#3B82F6' },
    ],
    sizes: defaultSizes,
    blouseOptions: defaultBlouse,
    rating: 4,
    reviews: 88,
    isBestSeller: true,
    isFeatured: true,
    tags: ['casual', 'office'],
  },
  {
    id: '5',
    slug: 'wine-embroidered-saree',
    name: 'Wine Embroidered Saree',
    description: 'Rich wine-colored saree with intricate embroidery, designed for grand celebrations.',
    details: ['Embroidered silk', 'Heavy pallu work', 'Festive ready', 'Length: 5.5 meters'],
    price: 3199,
    originalPrice: 4599,
    images: ['/images/saree-5.png', '/images/saree-3.png', '/images/saree-1.png'],
    category: 'wedding',
    categoryLabel: 'Wedding Saree',
    colors: [
      { color: 'Wine', colorHex: '#7F1D1D' },
      { color: 'Maroon', colorHex: '#991B1B' },
    ],
    sizes: defaultSizes,
    blouseOptions: defaultBlouse,
    rating: 4.5,
    reviews: 112,
    isBestSeller: true,
    tags: ['wedding', 'festive'],
  },
  {
    id: '6',
    slug: 'golden-banarasi-silk-saree',
    name: 'Golden Banarasi Silk Saree',
    description: 'Opulent golden Banarasi silk saree with traditional brocade weaving.',
    details: ['Pure Banarasi silk', 'Brocade weaving', 'Golden zari work', 'Length: 5.5 meters'],
    price: 2899,
    originalPrice: 4199,
    images: ['/images/saree-1.png', '/images/saree-5.png', '/images/saree-2.png'],
    category: 'banarasi',
    categoryLabel: 'Banarasi Saree',
    colors: [
      { color: 'Gold', colorHex: '#D4AF37' },
      { color: 'Champagne', colorHex: '#F7E7CE' },
    ],
    sizes: defaultSizes,
    blouseOptions: defaultBlouse,
    rating: 5,
    reviews: 95,
    isBestSeller: true,
    isFeatured: true,
    tags: ['wedding', 'festive'],
  },
  {
    id: '7',
    slug: 'peach-silk-saree',
    name: 'Peach Silk Saree',
    description: 'Soft peach silk saree with delicate border, perfect for daytime events.',
    details: ['Soft silk fabric', 'Delicate border', 'Comfortable drape', 'Length: 5.5 meters'],
    price: 2699,
    originalPrice: 3899,
    images: ['/images/saree-2.png', '/images/saree-4.png'],
    category: 'silk',
    categoryLabel: 'Silk Saree',
    colors: [{ color: 'Peach', colorHex: '#FBAA2D' }],
    sizes: defaultSizes,
    blouseOptions: defaultBlouse,
    rating: 4,
    reviews: 67,
    isNew: true,
    tags: ['party', 'casual'],
  },
  {
    id: '8',
    slug: 'classic-black-banarasi-saree',
    name: 'Classic Black Banarasi Saree',
    description: 'Timeless black Banarasi saree with golden zari motifs for elegant evening wear.',
    details: ['Black Banarasi silk', 'Golden zari motifs', 'Evening wear ready', 'Length: 5.5 meters'],
    price: 3299,
    originalPrice: 4799,
    images: ['/images/saree-3.png', '/images/saree-1.png'],
    category: 'banarasi',
    categoryLabel: 'Banarasi Saree',
    colors: [{ color: 'Black', colorHex: '#1F2937' }],
    sizes: defaultSizes,
    blouseOptions: defaultBlouse,
    rating: 4.5,
    reviews: 110,
    tags: ['casual', 'office'],
  },
  {
    id: '9',
    slug: 'kanchipuram-gold-border-saree',
    name: 'Kanchipuram Gold Border Saree',
    description: 'Authentic Kanchipuram silk saree with traditional gold border and temple motifs.',
    details: ['Pure Kanchipuram silk', 'Temple motifs', 'Gold zari border', 'Length: 5.5 meters'],
    price: 4999,
    originalPrice: 6999,
    images: ['/images/kanchipuram-collection.png', '/images/saree-1.png'],
    category: 'kanchipuram',
    categoryLabel: 'Kanchipuram Saree',
    colors: [
      { color: 'Red', colorHex: '#EF4444' },
      { color: 'Green', colorHex: '#22C55E' },
    ],
    sizes: defaultSizes,
    blouseOptions: defaultBlouse,
    rating: 5,
    reviews: 145,
    isBestSeller: true,
    isFeatured: true,
    tags: ['wedding', 'festive'],
  },
  {
    id: '10',
    slug: 'blush-pink-banarasi-saree',
    name: 'Blush Pink Banarasi Saree',
    description: 'Soft blush pink Banarasi saree with delicate floral zari patterns.',
    details: ['Banarasi silk', 'Floral zari patterns', 'Soft pink hue', 'Length: 5.5 meters'],
    price: 2699,
    originalPrice: 3899,
    images: ['/images/saree-5.png', '/images/saree-2.png'],
    category: 'banarasi',
    categoryLabel: 'Banarasi Saree',
    colors: [{ color: 'Pink', colorHex: '#EC4899' }],
    sizes: defaultSizes,
    blouseOptions: defaultBlouse,
    rating: 4.5,
    reviews: 82,
    isNew: true,
    tags: ['party', 'wedding'],
  },
  {
    id: '11',
    slug: 'cotton-handloom-saree',
    name: 'Cotton Handloom Saree',
    description: 'Breathable handloom cotton saree with traditional block prints.',
    details: ['Handloom cotton', 'Block print design', 'Daily wear comfort', 'Length: 5.5 meters'],
    price: 1899,
    originalPrice: 2799,
    images: ['/images/cotton-collection.png', '/images/saree-3.png'],
    category: 'cotton',
    categoryLabel: 'Cotton Saree',
    colors: [
      { color: 'White', colorHex: '#F9FAFB' },
      { color: 'Beige', colorHex: '#E8D5C4' },
    ],
    sizes: defaultSizes,
    blouseOptions: defaultBlouse,
    rating: 4,
    reviews: 56,
    tags: ['casual', 'office'],
  },
  {
    id: '12',
    slug: 'designer-net-saree',
    name: 'Designer Net Saree',
    description: 'Glamorous designer net saree with sequin work, perfect for cocktail parties.',
    details: ['Premium net fabric', 'Sequin embellishments', 'Designer blouse piece', 'Length: 5.5 meters'],
    price: 3499,
    originalPrice: 4999,
    images: ['/images/net-collection.png', '/images/saree-4.png'],
    category: 'designer',
    categoryLabel: 'Designer Saree',
    colors: [
      { color: 'Silver', colorHex: '#C0C0C0' },
      { color: 'Gold', colorHex: '#D4AF37' },
    ],
    sizes: defaultSizes,
    blouseOptions: defaultBlouse,
    rating: 4.5,
    reviews: 73,
    isFeatured: true,
    tags: ['party', 'wedding'],
  },
]

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    location: 'Mumbai',
    rating: 5,
    text: 'The Banarasi saree I ordered exceeded my expectations. The zari work is exquisite and the fabric quality is premium.',
    image: '/images/saree-1.png',
  },
  {
    id: '2',
    name: 'Ananya Reddy',
    location: 'Hyderabad',
    rating: 5,
    text: 'Beautiful collection and fast delivery. My wedding saree from Saree Elegance was the highlight of my special day.',
    image: '/images/saree-5.png',
  },
  {
    id: '3',
    name: 'Meera Patel',
    location: 'Ahmedabad',
    rating: 4.5,
    text: 'Love the variety and authentic craftsmanship. The cotton sarees are perfect for daily wear with elegant designs.',
    image: '/images/saree-2.png',
  },
]

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}

export function getProductsByCategory(category: string): Product[] {
  if (!category || category === 'all') return products
  return products.filter((p) => p.category === category)
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.isFeatured)
}

export function getNewArrivals(): Product[] {
  return products.filter((p) => p.isNew)
}

export function getBestSellers(): Product[] {
  return products.filter((p) => p.isBestSeller)
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, limit)
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase().trim()
  if (!q) return products
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.categoryLabel.toLowerCase().includes(q) ||
      p.tags.some((t) => t.includes(q))
  )
}

export function getDiscountPercent(price: number, originalPrice: number): number {
  return Math.round(((originalPrice - price) / originalPrice) * 100)
}
