"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DataProvider } from "@/lib/data"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Spinner } from "@/components/ui/spinner"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DataProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col min-h-screen">
            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t py-4 px-6 text-center text-sm text-muted-foreground">
              &copy; 2026 Vikas Trading Co.
            </footer>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </DataProvider>
  )
}
