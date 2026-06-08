'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NewsletterProps {
  variant?: 'default' | 'footer'
}

export default function Newsletter({ variant = 'default' }: NewsletterProps) {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 4000)
    }
  }

  if (variant === 'footer') {
    return (
      <div className="border-b border-primary-foreground/20 py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-xl font-serif font-bold mb-2">Subscribe to Our Newsletter</h3>
          <p className="text-sm opacity-90 mb-6">Get exclusive offers and new arrival updates</p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-4 py-2.5 rounded-md bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              type="submit"
              className="bg-accent text-accent-foreground px-6 py-2.5 rounded-md font-semibold text-sm hover:opacity-90 transition"
            >
              Subscribe
            </button>
          </form>
          {subscribed && (
            <p className="text-sm mt-3 flex items-center justify-center gap-1 text-accent">
              <CheckCircle size={16} /> Thank you for subscribing!
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <section className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={cn(
            'rounded-2xl p-8 md:p-12 text-center',
            'bg-primary text-primary-foreground'
          )}
        >
          <Mail size={32} className="mx-auto mb-4 text-accent" />
          <h2 className="text-2xl md:text-3xl font-serif font-bold mb-3">Stay in the Loop</h2>
          <p className="text-sm opacity-90 mb-8 max-w-md mx-auto">
            Subscribe to receive exclusive offers, styling tips, and early access to new collections.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              className="flex-1 px-4 py-3 rounded-md bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              type="submit"
              className="bg-accent text-accent-foreground px-8 py-3 rounded-md font-semibold text-sm hover:opacity-90 transition whitespace-nowrap"
            >
              SUBSCRIBE
            </button>
          </form>
          {subscribed && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm mt-4 flex items-center justify-center gap-1 text-accent"
            >
              <CheckCircle size={16} /> Successfully subscribed!
            </motion.p>
          )}
        </motion.div>
      </div>
    </section>
  )
}
