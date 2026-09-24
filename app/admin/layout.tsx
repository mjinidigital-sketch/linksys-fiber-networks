'use client'

import { useState } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { ToastProvider } from '@/components/ui/toast'
import AdminGuard from '@/components/admin/AdminGuard'
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <ToastProvider>
      <AdminGuard>
        <div className="h-screen overflow-hidden bg-background text-foreground antialiased">
          <div className="flex h-screen overflow-hidden">
            <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
            <div className="flex min-w-0 flex-1 flex-col h-screen overflow-hidden">
              <AdminHeader onToggleMobile={() => setMobileOpen(true)} />
              <main className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-8 lg:p-10">
                {children}
              </main>
            </div>
          </div>
        </div>
      </AdminGuard>
    </ToastProvider>
  )
}
