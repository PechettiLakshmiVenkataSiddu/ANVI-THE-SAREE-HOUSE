import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 max-w-7xl">{children}</div>
      </main>
    </div>
  )
}
