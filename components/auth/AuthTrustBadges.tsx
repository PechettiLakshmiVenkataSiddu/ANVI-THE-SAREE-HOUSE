'use client'

import { Package, RotateCcw, Lock, Headphones } from 'lucide-react'

const badges = [
  { icon: Package, title: 'Premium Quality', desc: 'Finest Fabrics' },
  { icon: RotateCcw, title: 'Easy Returns', desc: 'Within 7 Days' },
  { icon: Lock, title: 'Secure Payments', desc: '100% Safe & Secure' },
  { icon: Headphones, title: '24/7 Support', desc: "We're Here To Help" },
]

export default function AuthTrustBadges() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-border/60">
      {badges.map(({ icon: Icon, title, desc }) => (
        <div key={title} className="flex items-start gap-2.5">
          <div className="p-2 bg-secondary/60 rounded-full flex-shrink-0">
            <Icon size={16} className="text-primary" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-foreground leading-tight">{title}</p>
            <p className="text-[10px] text-muted-foreground">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
