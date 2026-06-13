'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/layout/Footer'
import ProfileCompletionModal from '@/components/auth/ProfileCompletionModal'
import { supabase } from '@/lib/supabase'

export default function CompleteProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [initialName, setInitialName] = useState('')

  useEffect(() => {
    async function checkUser() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (!currentUser) {
        router.push('/login')
        return
      }

      setUser(currentUser)

      // Check if profile is already completed
      const { data: profile } = await supabase
        .from('profiles')
        .select('profile_completed, first_name, last_name')
        .eq('id', currentUser.id)
        .single()

      if (profile?.profile_completed) {
        // Already completed, redirect to next page
        const next = searchParams.get('next') || '/'
        router.push(next)
        return
      }

      // Set initial name from profile or user metadata
      const firstName = profile?.first_name || currentUser.user_metadata?.first_name || currentUser.user_metadata?.given_name || ''
      const lastName = profile?.last_name || currentUser.user_metadata?.last_name || currentUser.user_metadata?.family_name || ''
      const fullName = currentUser.user_metadata?.name || currentUser.user_metadata?.full_name || ''
      
      setInitialName(firstName || lastName || fullName || '')
      setIsOpen(true)
    }

    checkUser()
  }, [router, searchParams])

  const handleComplete = async (data: { phone?: string; displayName?: string }) => {
    if (!user) return

    const updateData: any = {
      profile_completed: true,
    }

    if (data.phone) {
      updateData.phone = data.phone
    }

    if (data.displayName) {
      // Parse display name into first_name and last_name
      const nameParts = data.displayName.trim().split(' ')
      updateData.first_name = nameParts[0] || ''
      updateData.last_name = nameParts.slice(1).join(' ') || ''
    }

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)

    if (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
      return
    }

    setIsOpen(false)
    const next = searchParams.get('next') || '/'
    router.push(next)
  }

  const handleClose = () => {
    // Allow closing without completing - will redirect to next page
    setIsOpen(false)
    const next = searchParams.get('next') || '/'
    router.push(next)
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
      <Footer />

      <ProfileCompletionModal
        isOpen={isOpen}
        onClose={handleClose}
        initialName={initialName}
        onComplete={handleComplete}
      />
    </main>
  )
}
