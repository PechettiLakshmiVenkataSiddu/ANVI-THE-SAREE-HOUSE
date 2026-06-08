import type { UserRole } from '@/lib/auth'

export interface CustomerInfo {
  id: string
  email: string
  displayName: string
  firstName: string
  lastName: string
  role: UserRole
}
