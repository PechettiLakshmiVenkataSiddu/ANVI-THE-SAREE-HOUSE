'use client'

import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon?: LucideIcon
  rightElement?: React.ReactNode
  error?: string
}

export default function AuthInput({ label, icon: Icon, rightElement, error, className, ...props }: AuthInputProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold tracking-widest text-foreground/80 uppercase">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        )}
        <input
          {...props}
          className={cn(
            'w-full py-3 border border-border rounded-md bg-input text-foreground text-sm',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all',
            Icon ? 'pl-11 pr-11' : 'px-4',
            error && 'border-destructive focus:ring-destructive/30',
            className
          )}
        />
        {rightElement && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
