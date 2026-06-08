import type { DbCollection, DbProduct } from '@/lib/types/admin'

/** Format Supabase/Postgrest errors for UI display */
export function formatDbError(error: unknown): string {
  if (!error || typeof error !== 'object') return 'An unexpected error occurred'
  const e = error as { message?: string; code?: string; details?: string; hint?: string }
  const parts = [e.message, e.details, e.hint].filter(Boolean)
  return parts.join(' — ') || 'Database operation failed'
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function nullIfEmpty(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function validUuidOrNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  if (!trimmed) return null
  return UUID_RE.test(trimmed) ? trimmed : null
}

function validImageUrls(urls: string[] | undefined): string[] {
  return (urls ?? []).filter((url) => {
    if (typeof url !== 'string') return false
    const trimmed = url.trim()
    return trimmed.length > 0 && (trimmed.startsWith('http') || trimmed.startsWith('/'))
  })
}

function validJsonArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? value : fallback
}

/** Strip read-only fields and normalize types for Supabase insert */
export function sanitizeProductForInsert(product: Partial<DbProduct>): Record<string, unknown> {
  const slug = product.slug?.trim()
  const name = product.name?.trim()
  if (!slug) throw new Error('Product slug is required')
  if (!name) throw new Error('Product name is required')

  return {
    slug,
    name,
    description: nullIfEmpty(product.description ?? undefined),
    details: validJsonArray(product.details, []),
    price: Number(product.price) || 0,
    original_price: Number(product.original_price) || 0,
    stock: Math.max(0, Math.floor(Number(product.stock) || 0)),
    category: nullIfEmpty(product.category ?? undefined),
    images: validImageUrls(product.images),
    colors: validJsonArray(product.colors, []),
    sizes: validJsonArray(product.sizes, ['Free Size', '5.5 Meters']),
    blouse_options: validJsonArray(product.blouse_options, ['Without Blouse', 'With Blouse']),
    rating: Math.min(5, Math.max(0, Number(product.rating) || 0)),
    reviews: Math.max(0, Math.floor(Number(product.reviews) || 0)),
    is_new: Boolean(product.is_new),
    is_best_seller: Boolean(product.is_best_seller),
    is_featured: Boolean(product.is_featured),
    tags: validJsonArray(product.tags, []),
    collection_id: validUuidOrNull(product.collection_id ?? undefined),
  }
}

/** Strip id/timestamps — only updatable columns */
export function sanitizeProductForUpdate(product: Partial<DbProduct>): Record<string, unknown> {
  return sanitizeProductForInsert(product)
}

export function sanitizeCollectionPayload(collection: Partial<DbCollection>): Record<string, unknown> {
  const slug = collection.slug?.trim()
  const title = collection.title?.trim()
  if (!slug) throw new Error('Collection slug is required')
  if (!title) throw new Error('Collection title is required')

  const imageUrl = collection.image_url?.trim()
  const bannerUrl = collection.banner_url?.trim()

  return {
    slug,
    title,
    description: nullIfEmpty(collection.description ?? undefined),
    image_url: imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('/')) ? imageUrl : null,
    banner_url: bannerUrl && (bannerUrl.startsWith('http') || bannerUrl.startsWith('/')) ? bannerUrl : null,
  }
}

export function isValidCloudinaryUrl(url: unknown): url is string {
  return (
    typeof url === 'string' &&
    url.trim().length > 0 &&
    (url.startsWith('https://res.cloudinary.com/') || url.startsWith('http'))
  )
}
