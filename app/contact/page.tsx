'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import { Mail, Phone, MapPin, CheckCircle } from 'lucide-react'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
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
              { icon: Mail, label: 'Email', value: 'info@sareeelegance.com' },
              { icon: Phone, label: 'Phone', value: '+91 98765 43210' },
              { icon: MapPin, label: 'Address', value: 'Jaipur, Rajasthan, India' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="p-3 bg-secondary rounded-full">
                  <Icon size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{label}</p>
                  <p className="text-muted-foreground text-sm">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle size={48} className="mx-auto text-green-600 mb-4" />
                <h2 className="font-bold text-lg mb-2">Message Sent!</h2>
                <p className="text-muted-foreground text-sm">We&apos;ll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Name</label>
                  <input required type="text" className="w-full px-3 py-2 border border-border rounded-md bg-input text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Email</label>
                  <input required type="email" className="w-full px-3 py-2 border border-border rounded-md bg-input text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Message</label>
                  <textarea required rows={4} className="w-full px-3 py-2 border border-border rounded-md bg-input text-sm" />
                </div>
                <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-md font-semibold">
                  Send Message
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
