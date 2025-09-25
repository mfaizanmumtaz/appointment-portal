"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users } from "lucide-react"

interface BusinessCalendarProps {
  onPlanSelect: (plan: "30min" | "60min" | "6month") => void
  isPaid: boolean
}

const paidPlans = [
  {
    id: "30min" as const,
    name: "30-Minute Session",
    price: "$150",
    description: "Quick consultation for specific questions",
    features: ["AI strategy overview", "Technology recommendations", "Q&A session"],
  },
  {
    id: "60min" as const,
    name: "60-Minute Deep Dive",
    price: "$250",
    description: "Comprehensive analysis and planning",
    features: ["Detailed AI roadmap", "Custom solution design", "Implementation timeline", "Follow-up email"],
  },
  {
    id: "6month" as const,
    name: "6-Month Consultancy",
    price: "$2,500",
    description: "Ongoing partnership and support",
    features: [
      "Monthly strategy sessions",
      "Implementation support",
      "Team training",
      "Performance monitoring",
      "Priority email support",
    ],
  },
]

interface TimeSlot {
  id: string
  date: string
  time: string
  is_available: boolean
  slot_type: "business" | "student" | "both"
}

interface BookingStats {
  totalBookings: number
  pendingApprovals: number
}

export function BusinessCalendar({ onPlanSelect, isPaid }: BusinessCalendarProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [stats, setStats] = useState<BookingStats>({ totalBookings: 0, pendingApprovals: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAvailableSlots()
    fetchBookingStats()

    // Refresh data every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchAvailableSlots()
      fetchBookingStats()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const fetchAvailableSlots = async () => {
    try {
      const { supabase } = await import("@/lib/supabase")

      const today = new Date()
      const weekEnd = new Date(today)
      weekEnd.setDate(today.getDate() + 7)

      const { data: slots, error } = await supabase
        .from('time_slots')
        .select('*')
        .gte('date', today.toISOString().split('T')[0])
        .lte('date', weekEnd.toISOString().split('T')[0])
        .in('slot_type', ['business', 'both'])
        .order('date', { ascending: true })
        .order('time', { ascending: true })

      if (error) {
        console.error('Error fetching slots:', error)
        return
      }

      setAvailableSlots(slots || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const fetchBookingStats = async () => {
    try {
      const { supabase } = await import("@/lib/supabase")

      const today = new Date()
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay())

      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('*')
        .gte('date', weekStart.toISOString().split('T')[0])
        .eq('type', 'business')

      if (error) {
        console.error('Error fetching appointments:', error)
        return
      }

      const pending = appointments?.filter(a => a.status === 'pending') || []

      setStats({
        totalBookings: appointments?.length || 0,
        pendingApprovals: pending.length
      })
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (time24: string) => {
    const [hours, minutes] = time24.split(':')
    const hour12 = parseInt(hours) % 12 || 12
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM'
    return `${hour12}:${minutes} ${ampm}`
  }

  if (isPaid) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Select Your Plan</h2>
          <p className="text-muted-foreground">Choose the consultation package that fits your needs</p>
        </div>

        <div className="grid gap-6">
          {paidPlans.map((plan) => (
            <Card key={plan.id} className="card-calm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {plan.name}
                  </CardTitle>
                  <Badge variant="outline" className="text-lg font-semibold">
                    {plan.price}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button onClick={() => onPlanSelect(plan.id)} className="w-full btn-large btn-primary">
                  Select {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Free consultation calendar
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading available slots...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Available Free Sessions</h2>
        <p className="text-muted-foreground">Limited slots available - book now</p>
      </div>

      <Card className="card-calm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            This Week's Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {availableSlots.length > 0 ? (
              availableSlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    slot.is_available
                      ? "border-border hover:border-primary/50 cursor-pointer"
                      : "border-border bg-muted/50 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium">
                      {new Date(slot.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-sm text-muted-foreground">{formatTime(slot.time)}</div>
                    <Badge variant="outline" className="text-xs">{slot.slot_type}</Badge>
                  </div>
                  {slot.is_available ? (
                    <Button size="sm" onClick={() => onPlanSelect("30min")}>
                      Book Slot
                    </Button>
                  ) : (
                    <Badge variant="secondary">Booked</Badge>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No available slots this week</p>
                <p className="text-sm text-muted-foreground mt-2">Check back later or contact support</p>
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-muted/30 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">This Week's Stats</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Bookings:</span>
                <span className="ml-2 font-semibold">{stats.totalBookings}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Pending Approvals:</span>
                <span className="ml-2 font-semibold">{stats.pendingApprovals}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
