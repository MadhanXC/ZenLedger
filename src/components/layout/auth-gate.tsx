"use client"

import { useUser } from "@/firebase"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Loader2, Files, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser()
  const pathname = usePathname()
  const router = useRouter()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const isAuthPage = pathname === "/login" || pathname === "/register"

  useEffect(() => {
    if (!isUserLoading && !user && !isAuthPage) {
      router.push("/login")
    }
  }, [user, isUserLoading, isAuthPage, router])

  // Close drawer when pathname changes (navigation)
  useEffect(() => {
    setIsDrawerOpen(false)
  }, [pathname])

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="size-10 animate-spin text-accent" />
      </div>
    )
  }

  if (isAuthPage) {
    return <>{children}</>
  }

  if (!user) return null

  return (
    <div className="flex min-h-screen w-full bg-background relative overflow-x-hidden">
      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden lg:flex w-64 border-r border-sidebar-border shrink-0 flex-col bg-sidebar text-sidebar-foreground">
        <AppSidebar />
      </aside>

      {/* Custom Mobile Drawer Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          isDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* Custom Mobile Sidebar (Drawer) */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-transform duration-300 ease-in-out lg:hidden",
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col relative">
          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-md hover:bg-sidebar-accent lg:hidden"
          >
            <X className="size-5" />
          </button>
          <AppSidebar />
        </div>
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile Header (Main Content) - Now Dark */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-sidebar-border px-4 lg:hidden sticky top-0 bg-sidebar text-sidebar-foreground z-20">
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 -ml-2 rounded-md hover:bg-sidebar-accent transition-colors"
          >
            <Menu className="size-5" />
          </button>
          <Separator orientation="vertical" className="h-4 bg-sidebar-border" />
          <div className="flex items-center gap-2 font-bold">
            <Files className="size-5 text-accent" />
            <span className="text-sm tracking-tight">Zen Ledger</span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-10 w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
