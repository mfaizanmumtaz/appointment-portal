"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MessageSquare, BarChart3, Settings, Wrench, Shield, Clock, ImageIcon } from "lucide-react"

interface AdminSidebarProps {
  currentView: string
  onViewChange: (
    view: "calendar" | "requests" | "dashboard" | "settings" | "tools" | "slots" | "chat" | "triage" | "gallery",
  ) => void
}

export function AdminSidebar({ currentView, onViewChange }: AdminSidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, badge: null },
    { id: "slots", label: "Slot Management", icon: Clock, badge: null },
    { id: "calendar", label: "Calendar View", icon: Calendar, badge: "12" },
    { id: "requests", label: "Requests Queue", icon: MessageSquare, badge: "3" },
    { id: "triage", label: "AI Triage Log", icon: Shield, badge: "8" },
    { id: "chat", label: "Quick Chat", icon: MessageSquare, badge: "2" },
    { id: "gallery", label: "Gallery Management", icon: ImageIcon, badge: null },
    { id: "settings", label: "Settings", icon: Settings, badge: null },
    { id: "tools", label: "Tools", icon: Wrench, badge: null },
  ]

  return (
    <div className="admin-sidebar">
      <div className="space-y-3">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <h2 className="heading-font text-xl font-bold text-foreground">Admin</h2>
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant={currentView === item.id ? "default" : "ghost"}
              className="w-full justify-start rounded-xl h-12 text-left"
              onClick={() => onViewChange(item.id as any)}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-2">
                  {item.badge}
                </Badge>
              )}
            </Button>
          )
        })}
      </div>

      <Card className="card-calm mt-8">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-4 text-foreground">Quick Stats</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Today's Sessions:</span>
              <Badge variant="outline" className="font-semibold">
                5
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Pending Requests:</span>
              <Badge variant="outline" className="font-semibold">
                3
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">This Week:</span>
              <Badge variant="outline" className="font-semibold">
                28
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
