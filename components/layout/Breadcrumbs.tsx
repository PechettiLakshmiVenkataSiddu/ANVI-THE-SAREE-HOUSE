import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2 text-sm text-muted-foreground border-b border-border flex-wrap">
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-2">
          {index > 0 && <ChevronRight size={14} className="text-muted-foreground/60" />}
          {item.href ? (
            <Link href={item.href} className="hover:text-foreground transition">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground line-clamp-1">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
