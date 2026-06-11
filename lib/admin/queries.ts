import { supabase } from '@/lib/supabase'
import {
  formatDbError,
  sanitizeCollectionPayload,
  sanitizeProductForInsert,
  sanitizeProductForUpdate,
} from '@/lib/admin/sanitize'
import type {
  DashboardStats,
  DbCollection,
  DbOrder,
  DbProduct,
  DbProfile,
  AdminOrderStatus,
} from '@/lib/types/admin'
import { UI_STATUS_TO_DB_STATUS, ADMIN_ORDER_STATUSES, DB_STATUS_TO_UI_STATUS } from '@/lib/types/admin'

async function requireAdminSession() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    throw new Error('Not authenticated. Please log in to the admin panel.')
  }
  return user
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await requireAdminSession()

  const [ordersRes, productsRes, customersRes, recentRes] = await Promise.all([
    supabase.from('orders').select('total', { count: 'exact' }),
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
  ])

  if (ordersRes.error) console.error('[admin/queries] orders stats:', ordersRes.error.message)
  if (productsRes.error) console.error('[admin/queries] products stats:', productsRes.error.message)

  const totalRevenue = (ordersRes.data ?? []).reduce((sum, o) => sum + Number(o.total), 0)

  // Map database status values to UI status values for recent orders
  const transformedRecentOrders = (recentRes.data ?? []).map((order: any) => ({
    ...order,
    status: DB_STATUS_TO_UI_STATUS[order.status] || order.status,
  }))

  return {
    totalOrders: ordersRes.count ?? 0,
    totalProducts: productsRes.count ?? 0,
    totalCustomers: customersRes.count ?? 0,
    totalRevenue,
    recentOrders: transformedRecentOrders as DbOrder[],
  }
}

export async function getProducts(): Promise<DbProduct[]> {
  await requireAdminSession()
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(formatDbError(error))
  return (data ?? []) as DbProduct[]
}

export async function getProduct(id: string): Promise<DbProduct | null> {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle()
  if (error) return null
  return data as DbProduct | null
}

export async function createProduct(product: Partial<DbProduct>) {
  await requireAdminSession()
  const payload = sanitizeProductForInsert(product)

  const { data, error } = await supabase.from('products').insert(payload).select().single()

  if (error) {
    console.error('[admin/queries] createProduct failed:', formatDbError(error))
    throw new Error(formatDbError(error))
  }

  return data as DbProduct
}

export async function updateProduct(id: string, product: Partial<DbProduct>) {
  await requireAdminSession()
  if (!id?.trim()) throw new Error('Product ID is required for update')

  const payload = sanitizeProductForUpdate(product)

  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[admin/queries] updateProduct failed:', formatDbError(error))
    throw new Error(formatDbError(error))
  }

  return data as DbProduct
}

export async function deleteProduct(id: string) {
  await requireAdminSession()
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw new Error(formatDbError(error))
}

export async function getOrders(): Promise<DbOrder[]> {
  await requireAdminSession()
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(formatDbError(error))

  // Map database status values to UI status values for display
  const transformedOrders = (data ?? []).map((order: any) => ({
    ...order,
    status: DB_STATUS_TO_UI_STATUS[order.status] || order.status,
  }))

  return transformedOrders as DbOrder[]
}

export async function getOrder(id: string): Promise<DbOrder | null> {
  const { data, error } = await supabase.from('orders').select('*').eq('id', id).maybeSingle()
  if (error) return null

  if (!data) return null

  // Map database status value to UI status value for display
  const transformedOrder = {
    ...data,
    status: DB_STATUS_TO_UI_STATUS[data.status] || data.status,
  }

  return transformedOrder as DbOrder | null
}

export async function updateOrderStatus(id: string, status: AdminOrderStatus) {
  await requireAdminSession()

  // Find the UI label for the selected status
  const statusLabel = ADMIN_ORDER_STATUSES.find(s => s.value === status)?.label || status

  // Map UI status to valid database status
  const dbStatus = UI_STATUS_TO_DB_STATUS[status]

  console.log('[admin/queries] Updating order status:', {
    orderId: id,
    uiLabel: statusLabel,
    uiValue: status,
    dbValue: dbStatus,
  })

  const { data, error } = await supabase
    .from('orders')
    .update({ status: dbStatus })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[admin/queries] Error updating order status:', error)
    throw new Error(formatDbError(error))
  }

  console.log('[admin/queries] Order status updated successfully:', {
    orderId: id,
    newStatus: data.status,
  })

  // Map database status back to UI status for display
  const transformedOrder = {
    ...data,
    status: DB_STATUS_TO_UI_STATUS[data.status] || data.status,
  }

  return transformedOrder as DbOrder
}

export async function getCustomers(): Promise<DbProfile[]> {
  await requireAdminSession()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'customer')
    .order('created_at', { ascending: false })
  if (error) throw new Error(formatDbError(error))
  return (data ?? []) as DbProfile[]
}

export async function getCustomer(id: string): Promise<DbProfile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
  if (error) return null
  return data as DbProfile | null
}

export async function getCustomerOrders(userId: string): Promise<DbOrder[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(formatDbError(error))

  // Map database status values to UI status values for display
  const transformedOrders = (data ?? []).map((order: any) => ({
    ...order,
    status: DB_STATUS_TO_UI_STATUS[order.status] || order.status,
  }))

  return transformedOrders as DbOrder[]
}

export async function getCollections(): Promise<DbCollection[]> {
  await requireAdminSession()
  const { data, error } = await supabase.from('collections').select('*').order('title')
  if (error) throw new Error(formatDbError(error))
  return (data ?? []) as DbCollection[]
}

export async function createCollection(collection: Partial<DbCollection>) {
  await requireAdminSession()
  const payload = sanitizeCollectionPayload(collection)
  const { data, error } = await supabase.from('collections').insert(payload).select().single()
  if (error) throw new Error(formatDbError(error))
  return data as DbCollection
}

export async function updateCollection(id: string, collection: Partial<DbCollection>) {
  await requireAdminSession()
  const payload = sanitizeCollectionPayload(collection)
  const { data, error } = await supabase
    .from('collections')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(formatDbError(error))
  return data as DbCollection
}

export async function deleteCollection(id: string) {
  await requireAdminSession()
  const { error } = await supabase.from('collections').delete().eq('id', id)
  if (error) throw new Error(formatDbError(error))
}
