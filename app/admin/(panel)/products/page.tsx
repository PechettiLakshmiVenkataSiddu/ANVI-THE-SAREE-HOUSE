'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import AdminHeader from '@/components/admin/AdminHeader'
import LoadingSpinner from '@/components/admin/LoadingSpinner'
import ImageUploader from '@/components/admin/ImageUploader'
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/lib/admin/queries'
import type { DbProduct } from '@/lib/types/admin'

const emptyProduct = (): Partial<DbProduct> => ({
  slug: '',
  name: '',
  description: '',
  details: [],
  price: 0,
  original_price: 0,
  stock: 0,
  category: '',
  category_label: '',
  images: [],
  colors: [],
  sizes: ['Free Size', '5.5 Meters'],
  blouse_options: ['Without Blouse', 'With Blouse'],
  rating: 0,
  reviews: 0,
  is_new: false,
  is_best_seller: false,
  is_featured: false,
  tags: [],
})

export default function AdminProductsPage() {
  const [products, setProducts] = useState<DbProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<Partial<DbProduct> | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    getProducts()
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    if (!editing?.name || !editing.slug) return
    setSaving(true)
    setError('')
    try {
      if (editing.id) {
        await updateProduct(editing.id, editing)
      } else {
        await createProduct(editing)
      }
      setEditing(null)
      load()
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Save failed'
      console.error('[admin/products] save error:', message)
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return
    try {
      await deleteProduct(id)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  if (loading && !products.length) return <LoadingSpinner />

  return (
    <div>
      <AdminHeader
        title="Products"
        description="Manage your saree catalog"
        action={
          <button
            onClick={() => setEditing(emptyProduct())}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold hover:opacity-90"
          >
            <Plus size={16} /> Add Product
          </button>
        }
      />

      {error && <p className="text-destructive text-sm mb-4">{error}</p>}

      {editing && (
        <div className="bg-card border border-border rounded-lg p-6 mb-8 space-y-4">
          <h2 className="font-bold">{editing.id ? 'Edit Product' : 'New Product'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold">Name</label>
              <input value={editing.name ?? ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full mt-1 px-3 py-2 border border-border rounded-md text-sm bg-input" />
            </div>
            <div>
              <label className="text-xs font-semibold">Slug</label>
              <input value={editing.slug ?? ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="w-full mt-1 px-3 py-2 border border-border rounded-md text-sm bg-input" />
            </div>
            <div>
              <label className="text-xs font-semibold">Price (₹)</label>
              <input type="number" value={editing.price ?? 0} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 border border-border rounded-md text-sm bg-input" />
            </div>
            <div>
              <label className="text-xs font-semibold">Original Price (₹)</label>
              <input type="number" value={editing.original_price ?? 0} onChange={(e) => setEditing({ ...editing, original_price: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 border border-border rounded-md text-sm bg-input" />
            </div>
            <div>
              <label className="text-xs font-semibold">Stock</label>
              <input type="number" value={editing.stock ?? 0} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 border border-border rounded-md text-sm bg-input" />
            </div>
            <div>
              <label className="text-xs font-semibold">Category</label>
              <input value={editing.category ?? ''} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="w-full mt-1 px-3 py-2 border border-border rounded-md text-sm bg-input" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold">Description</label>
            <textarea value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className="w-full mt-1 px-3 py-2 border border-border rounded-md text-sm bg-input" />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-2">Images</label>
            <ImageUploader images={editing.images ?? []} onChange={(images) => setEditing({ ...editing, images })} />
            <input
              type="text"
              placeholder="Or paste image URL and press Enter"
              className="w-full mt-2 px-3 py-2 border border-border rounded-md text-sm bg-input"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  const url = (e.target as HTMLInputElement).value.trim()
                  if (url) {
                    setEditing({ ...editing, images: [...(editing.images ?? []), url] });
                    (e.target as HTMLInputElement).value = ''
                  }
                }
              }}
            />
          </div>
          <div className="flex gap-4 flex-wrap">
            {(['is_new', 'is_best_seller', 'is_featured'] as const).map((flag) => (
              <label key={flag} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!editing[flag]} onChange={(e) => setEditing({ ...editing, [flag]: e.target.checked })} />
                {flag.replace(/_/g, ' ')}
              </label>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground px-6 py-2 rounded-md text-sm font-semibold disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Product'}
            </button>
            <button onClick={() => setEditing(null)} className="border border-border px-6 py-2 rounded-md text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left p-4">Product</th>
              <th className="text-left p-4">Category</th>
              <th className="text-right p-4">Price</th>
              <th className="text-right p-4">Stock</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/10">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {p.images?.[0] && (
                      <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                        <Image src={p.images[0]} alt="" fill className="object-cover" sizes="40px" />
                      </div>
                    )}
                    <span className="font-medium line-clamp-1">{p.name}</span>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground capitalize">{p.category ?? '—'}</td>
                <td className="p-4 text-right">₹{Number(p.price).toLocaleString()}</td>
                <td className="p-4 text-right">{p.stock}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditing(p)} className="p-1.5 hover:bg-secondary rounded"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-secondary rounded text-destructive"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="p-8 text-center text-muted-foreground">No products yet. Add your first product above.</p>}
      </div>
    </div>
  )
}
