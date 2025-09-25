"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/ui/footer"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminCalendar } from "@/components/admin/admin-calendar"
import { AdminRequests } from "@/components/admin/admin-requests"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { AdminSettings } from "@/components/admin/admin-settings"
import { AdminSlots } from "@/components/admin/admin-slots"
import { AdminChat } from "@/components/admin/admin-chat"
import { AdminTriage } from "@/components/admin/admin-triage"
import { AdminGallery } from "@/components/admin/admin-gallery"
import { AdminMeetings } from "@/components/admin/admin-meetings"
import { Home } from "lucide-react"
import Link from "next/link"

type AdminView = "calendar" | "requests" | "dashboard" | "settings" | "slots" | "chat" | "triage" | "gallery" | "meetings"

export default function AdminPage() {
  const [currentView, setCurrentView] = useState<AdminView>("dashboard")

  const renderView = () => {
    switch (currentView) {
      case "calendar":
        return <AdminCalendar />
      case "requests":
        return <AdminRequests />
      case "dashboard":
        return <AdminDashboard />
      case "settings":
        return <AdminSettings />
      case "slots":
        return <AdminSlots />
      case "meetings":
        return <AdminMeetings />
      case "chat":
        return <AdminChat />
      case "triage":
        return <AdminTriage />
      case "gallery":
        return <AdminGallery />
      default:
        return <AdminDashboard />
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="admin-header">
        <div className="flex h-16 items-center container-padding">
          <Button asChild variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
            <Link href="/">
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
          <div className="ml-auto">
            <h1 className="heading-font text-xl font-bold text-foreground">Admin Panel</h1>
          </div>
        </div>
      </div>

      <main className="flex-1 flex">
        <AdminSidebar currentView={currentView} onViewChange={setCurrentView} />
        <div className="admin-content">{renderView()}</div>
      </main>

      <Footer />
    </div>
  )
}
