"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Users,
  Package,
  Receipt,
  Building2,
  Settings,
  PlusCircle,
  FileSignature,
  LogOut,
  Files
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/firebase"
import { signOut } from "firebase/auth"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Catalog", href: "/catalog", icon: Package },
  { name: "Quotes", href: "/quotes", icon: FileSignature },
  { name: "Invoices", href: "/invoices", icon: Receipt },
]

const settingsLinks = [
  { name: "Company Profile", href: "/company", icon: Building2 },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const auth = useAuth()
  const { toast } = useToast()

  const handleLogout = () => {
    signOut(auth).then(() => {
      toast({ title: "Signed Out", description: "Successfully logged out." })
    })
  }

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Header - Vertically Centered and Left Aligned */}
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-3 font-bold text-xl">
          <Files className="size-8 shrink-0 text-accent" />
          <span className="truncate tracking-tight text-sidebar-foreground">Zen Ledger</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
        {/* Main Navigation */}
        <nav className="space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === item.href 
                  ? "bg-accent/10 text-accent" 
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="size-4 shrink-0" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Configuration Section */}
        <div className="space-y-4">
          <h4 className="px-3 text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-wider">
            Configuration
          </h4>
          <nav className="space-y-1">
            {settingsLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === item.href 
                    ? "bg-accent/10 text-accent" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="size-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <Link 
          href="/quotes/new"
          className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-accent text-accent-foreground rounded-md text-sm font-semibold hover:bg-accent/90 transition-colors shadow-sm"
        >
          <PlusCircle className="size-4" />
          <span>New Quote</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors text-left"
        >
          <LogOut className="size-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}