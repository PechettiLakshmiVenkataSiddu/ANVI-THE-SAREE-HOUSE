"use client"
import { Package, Truck, RotateCcw, Lock, Headphones } from 'lucide-react'

const iconMap = {
  Package,
  Truck,
  RotateCcw,
  Lock,
  Headphones,
} as const

type IconName = keyof typeof iconMap

interface FeatureBadgeProps {
  icon: IconName
  title: string
  description: string
}

export default function FeatureBadge({ icon, title, description }: FeatureBadgeProps) {
  const Icon = iconMap[icon]
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