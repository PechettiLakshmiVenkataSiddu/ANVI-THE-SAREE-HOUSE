import { ProductGridSkeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 bg-card border-b border-border animate-pulse" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-8 bg-muted rounded w-48 mb-8 animate-pulse" />
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  )
}
