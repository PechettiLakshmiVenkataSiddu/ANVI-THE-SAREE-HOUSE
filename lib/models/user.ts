import type { User, ShippingAddress } from '@/lib/types'

export const defaultUser: User = {
  id: 'user-1',
  firstName: 'Guest',
  lastName: 'User',
  email: 'guest@sareeelegance.com',
  phone: '',
  addresses: [],
}

export function formatUserName(user: User): string {
  return `${user.firstName} ${user.lastName}`.trim()
}

export function createEmptyAddress(): ShippingAddress {
  return {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  }
}
