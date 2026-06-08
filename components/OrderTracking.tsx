'use client'

import { Check, Truck, MapPin, Package, ClipboardCheck } from 'lucide-react'
import type { TrackingStep } from '@/lib/types'
import { cn } from '@/lib/utils'

interface OrderTrackingProps {
  orderId?: string
  steps: TrackingStep[]
}

const stepIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  placed: ClipboardCheck,
  confirmed: Check,
  shipped: Truck,
  out_for_delivery: MapPin,
  delivered: Package,
}

export default function OrderTracking({ orderId, steps }: OrderTrackingProps) {
  return (
    <div className="bg-card rounded-lg p-6 border border-border h-full">
      <h2 className="text-xl font-bold text-foreground mb-6 tracking-wide">TRACK ORDER</h2>

      {orderId && (
        <div className="text-sm text-muted-foreground mb-6">
          Order ID: <span className="font-semibold text-foreground">{orderId}</span>
        </div>
      )}

      <div className="relative pl-1">
        {steps.map((step, index) => {
          const Icon = stepIcons[step.status] ?? Check
          const isLast = index === steps.length - 1

          return (
            <div key={step.status} className="relative flex gap-4 pb-8 last:pb-0">
              {/* Vertical connector line */}
              {!isLast && (
                <div
                  className={cn(
                    'absolute left-[17px] top-9 w-0.5 h-[calc(100%-12px)]',
                    step.completed ? 'bg-green-500' : 'bg-border'
                  )}
                />
              )}

              {/* Step node */}
              <div
                className={cn(
                  'relative z-10 flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all',
                  step.completed
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'bg-muted text-muted-foreground border-2 border-border'
                )}
              >
                <Icon size={18} className={step.completed ? 'text-white' : ''} />
              </div>

              {/* Step content */}
              <div className="pt-1 min-w-0">
                <h3
                  className={cn(
                    'font-semibold text-sm',
                    step.completed ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </h3>
                {step.completed && step.date && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.date}, {step.time}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
