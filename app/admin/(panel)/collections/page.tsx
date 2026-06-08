'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import AdminHeader from '@/components/admin/AdminHeader'
import LoadingSpinner from '@/components/admin/LoadingSpinner'
import ImageUploader from '@/components/admin/ImageUploader'
import { getCollections, createCollection, updateCollection, deleteCollection } from '@/lib/admin/queries'
import type { DbCollection } from '@/lib/types/admin'

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<DbCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<Partial<DbCollection> | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    getCollections()
      .then(setCollections)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSave = async () => {
    if (!editing?.title || !editing.slug) return
    setSaving(true)
    try {
      if (editing.id) {
        await updateCollection(editing.id, editing)
      } else {
        await createCollection(editing)
      }
      setEditing(null)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this collection?')) return
    try {
      await deleteCollection(id)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  if (loading && !collections.length) return <LoadingSpinner />

  return (
    <div>
      <AdminHeader
        title="Collections"
        description="Manage saree categories and banners"
        action={
          <button onClick={() => setEditing({ slug: '', title: '', description: '', image_url: '', banner_url: '' })} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold">
            <Plus size={16} /> Add Collection
          </button>
        }
      />
      {error && <p className="text-destructive text-sm mb-4">{error}</p>}

      {editing && (
        <div className="bg-card border border-border rounded-lg p-6 mb-8 space-y-4">
          <h2 className="font-bold">{editing.id ? 'Edit Collection' : 'New Collection'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold">Title</label>
              <input value={editing.title ?? ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full mt-1 px-3 py-2 border border-border rounded-md text-sm bg-input" />
            </div>
            <div>
              <label className="text-xs font-semibold">Slug</label>
              <input value={editing.slug ?? ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="w-full mt-1 px-3 py-2 border border-border rounded-md text-sm bg-input" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold">Description</label>
            <textarea value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} className="w-full mt-1 px-3 py-2 border border-border rounded-md text-sm bg-input" />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-2">Collection Image</label>
            <ImageUploader images={editing.image_url ? [editing.image_url] : []} onChange={(imgs) => setEditing({ ...editing, image_url: imgs[0] ?? '' })} multiple={false} />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-2">Banner Image</label>
            <ImageUploader images={editing.banner_url ? [editing.banner_url] : []} onChange={(imgs) => setEditing({ ...editing, banner_url: imgs[0] ?? '' })} multiple={false} />
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground px-6 py-2 rounded-md text-sm font-semibold disabled:opacity-60">{saving ? 'Saving...' : 'Save'}</button>
            <button onClick={() => setEditing(null)} className="border border-border px-6 py-2 rounded-md text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map((c) => (
          <div key={c.id} className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="relative h-32 bg-secondary">
              {c.image_url && <Image src={c.image_url} alt={c.title} fill className="object-cover" sizes="300px" />}
            </div>
            <div className="p-4">
              <h3 className="font-bold">{c.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{c.slug}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setEditing(c)} className="p-1.5 hover:bg-secondary rounded"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-secondary rounded text-destructive"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {collections.length === 0 && !editing && <p className="text-center text-muted-foreground py-12">No collections yet.</p>}
    </div>
  )
}
