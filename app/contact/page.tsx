'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import { Mail, Phone, MapPin, CheckCircle, MessageCircle } from 'lucide-react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      setStatus('success')
      setForm({ name: '', email: '', message: '' })
    } else {
      setStatus('error')
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Contact Us' }]} />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-8 text-center">Contact Us</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Have a question about our sarees, orders, or returns? We&apos;d love to hear from you.
            </p>
            {[
              { icon: Mail, label: 'Email', value: 'anvithesareehouse@gmail.com' },
              { icon: Phone, label: 'Phone', value: '8639899155' },
              { icon: MessageCircle, label: 'WhatsApp', value: '8639899155', link: 'https://wa.me/918639899155' },
              { icon: MapPin, label: 'Address', value: 'PANTI REVU ROAD, STEAMER ROAD, Near Ramalayam, Narsapur, Andhra Pradesh 534275' },
            ].map(({ icon: Icon, label, value, link }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="p-3 bg-secondary rounded-full">
                  <Icon size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{label}</p>
                  {link ? (
                    <a href={link} target="_blank" rel="noopener noreferrer" className="text-muted-foreground text-sm hover:text-primary transition">
                      {value}
                    </a>
                  ) : (
                    <p className="text-muted-foreground text-sm">{value}</p>
                  )}
                </div>
              </div>
            ))}
            <div className="pt-4 border-t border-border">
              <p className="font-semibold text-sm mb-1">Business Hours</p>
              <p className="text-muted-foreground text-sm">Open 9:30 AM to 9 PM</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            {status === 'success' ? (
              <div className="text-center py-8">
                <CheckCircle size={48} className="mx-auto text-green-600 mb-4" />
                <h2 className="font-bold text-lg mb-2">Message Sent!</h2>
                <p className="text-muted-foreground text-sm">We&apos;ll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Name</label>
                  <input
                    required
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-md bg-input text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Email</label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-md bg-input text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Message</label>
                  <textarea
                    required
                    rows={4}
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-md bg-input text-sm"
                  />
                </div>

                {status === 'error' && (
                  <p className="text-red-500 text-sm">Something went wrong. Please try again.</p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-md font-semibold disabled:opacity-60"
                >
                  {status === 'loading' ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}