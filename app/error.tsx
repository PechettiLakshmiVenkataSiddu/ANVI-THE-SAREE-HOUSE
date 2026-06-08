'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-serif font-bold text-primary mb-4">Something went wrong</h1>
        <p className="text-muted-foreground mb-8">We encountered an unexpected error. Please try again.</p>
        <button
          onClick={reset}
          className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-semibold hover:opacity-90 transition"
        >
          Try Again
        </button>
      </div>
    </main>
  )
}
