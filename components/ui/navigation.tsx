"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">IM</span>
            </div>
            <span className="font-semibold text-foreground">Irfan Malik</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/business"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname.startsWith("/business") ? "text-primary" : "text-muted-foreground",
              )}
            >
              Business
            </Link>
            <Link
              href="/student"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname.startsWith("/student") ? "text-primary" : "text-muted-foreground",
              )}
            >
              Students
            </Link>
            <Link
              href="/chat/irfan"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname.startsWith("/chat") ? "text-primary" : "text-muted-foreground",
              )}
            >
              AI Chat
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin">Admin</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
