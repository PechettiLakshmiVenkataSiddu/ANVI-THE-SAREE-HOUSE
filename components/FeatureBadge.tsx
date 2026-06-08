'use client'

import { LucideIcon } from 'lucide-react'

interface FeatureBadgeProps {
  icon: LucideIcon
  title: string
  description: string
}

export default function FeatureBadge({ icon: Icon, title, description }: FeatureBadgeProps) {
  return (
    <div className="flex flex-col items-center text-center gap-3">
      <div className="bg-secondary rounded-full p-4">
        <Icon size={28} className="text-primary" />
      </div>
      <div>
        <h3 className="font-bold text-foreground text-sm">{title}</h3>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
    </div>
  )
}
