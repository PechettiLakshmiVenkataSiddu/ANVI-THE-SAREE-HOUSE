'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Tag, Trash2, Plus } from 'lucide-react'

interface Coupon {
  id: string
  code: string
  discount_percent: number
  is_active: boolean
  expires_at: string | null
  created_at: string
}

export default function CouponsPage() {
  const supabase = createClient()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    code: '',
    discount_percent: '',
    expires_at: '',
    is_active: true,
  })
  const [message, setMessage] = useState('')

  const fetchCoupons = async () => {
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })
    setCoupons(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchCoupons() }, [])

  const handleAdd = async () => {
    if (!form.code || !form.discount_percent) {
      setMessage('Code and discount % are required.')
      return
    }
    const { error } = await supabase.from('coupons').insert({
      code: form.code.toUpperCase().trim(),
      discount_percent: Number(form.discount_percent),
      expires_at: form.expires_at || null,
      is_active: form.is_active,
    })
    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Coupon added!')
      setForm({ code: '', discount_percent: '', expires_at: '', is_active: true })
      fetchCoupons()
    }
  }

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('coupons').update({ is_active: !current }).eq('id', id)
    fetchCoupons()
  }

  const deleteCoupon = async (id: string) => {
    await supabase.from('coupons').delete().eq('id', id)
    fetchCoupons()
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Tag size={24} /> Coupons
        </h1>
        <p className="text-muted-foreground text-sm">Manage discount coupon codes</p>
      </div>

      {/* Add Coupon Form */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="font-semibold text-lg">Add New Coupon</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1">Coupon Code</label>
            <input
              type="text"
              placeholder="e.g. SAVE20"
              value={form.code}
              onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Discount %</label>
            <input
              type="number"
              placeholder="e.g. 20"
              min={1} max={100}
              value={form.discount_percent}
              onChange={e => setForm({ ...form, discount_percent: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Expiry Date (optional)</label>
            <input
              type="date"
              value={form.expires_at}
              onChange={e => setForm({ ...form, expires_at: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Active</label>
            <select
              value={form.is_active ? 'true' : 'false'}
              onChange={e => setForm({ ...form, is_active: e.target.value === 'true' })}
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-sm"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>
        {message && <p className="text-sm text-green-600">{message}</p>}
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold"
        >
          <Plus size={16} /> Add Coupon
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Code</th>
              <th className="text-left px-4 py-3 font-semibold">Discount</th>
              <th className="text-left px-4 py-3 font-semibold">Expiry</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
              <th className="text-left px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
            ) : coupons.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No coupons yet.</td></tr>
            ) : coupons.map(c => (
              <tr key={c.id} className="border-t border-border hover:bg-muted/50">
                <td className="px-4 py-3 font-mono font-bold">{c.code}</td>
                <td className="px-4 py-3">{c.discount_percent}%</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'No expiry'}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(c.id, c.is_active)}
                    className="text-xs px-3 py-1 border border-border rounded-md hover:bg-muted"
                  >
                    {c.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => deleteCoupon(c.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}