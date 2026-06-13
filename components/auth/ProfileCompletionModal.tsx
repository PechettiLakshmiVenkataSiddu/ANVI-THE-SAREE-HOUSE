'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Phone, User, Loader2 } from 'lucide-react'

interface ProfileCompletionModalProps {
  isOpen: boolean
  onClose: () => void
  initialName?: string
  onComplete: (data: { phone?: string; displayName?: string }) => Promise<void>
}

export default function ProfileCompletionModal({
  isOpen,
  onClose,
  initialName = '',
  onComplete,
}: ProfileCompletionModalProps) {
  const [displayName, setDisplayName] = useState(initialName)
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await onComplete({
      phone: phone.trim() || undefined,
      displayName: displayName.trim() || undefined,
    })
    setLoading(false)
  }

  const handleSkip = async () => {
    setLoading(true)
    await onComplete({})
    setLoading(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-card border border-border rounded-lg p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Complete Your Profile</h2>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Help us serve you better by adding a few details (optional).
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Display Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-input text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Phone Number (Recommended)</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Your phone number"
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-input text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-border rounded-md text-sm font-semibold hover:bg-secondary/50 transition disabled:opacity-60"
                >
                  {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Skip'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold disabled:opacity-60 transition"
                >
                  {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Save'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
