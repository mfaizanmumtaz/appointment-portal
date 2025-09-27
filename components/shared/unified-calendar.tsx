"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, MapPin, Video, RefreshCw } from "lucide-react"
import { TimeSlot, BookingStats, fetchTimeSlots, fetchBookingStats, formatTime, formatDate } from "@/lib/calendar-utils"
import { venueLocations } from "@/lib/venue-config"

interface UnifiedCalendarProps {
  calendarType: "business" | "student"
  sessionType?: "online-free" | "online-paid" | "in-person"
  isPaid?: boolean
  onPlanSelect?: (plan: "30min" | "60min" | "6month") => void
  onBookingSelect?: (slot: TimeSlot) => void
}

const businessPlans = [
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

export function UnifiedCalendar({
  calendarType,
  sessionType,
  isPaid = false,
  onPlanSelect,
  onBookingSelect
}: UnifiedCalendarProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [stats, setStats] = useState<BookingStats>({ totalBookings: 0, pendingApprovals: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSlots()
    fetchStats()

    // Refresh data every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchSlots()
      fetchStats()
    }, 30000)

    return () => clearInterval(interval)
  }, [calendarType, sessionType])

  const fetchSlots = async () => {
    setLoading(true)
    try {
      let slotTypeFilter: string[]
      let sessionTypeFilter: "free" | "paid" | undefined

      if (calendarType === "business") {
        slotTypeFilter = ['business', 'both']
      } else {
        slotTypeFilter = ['student', 'both']
        if (sessionType === "online-free") {
          sessionTypeFilter = "free"
        } else if (sessionType === "online-paid" || sessionType === "in-person") {
          sessionTypeFilter = "paid"
        }
      }

      const slots = await fetchTimeSlots(slotTypeFilter, sessionTypeFilter)
      setAvailableSlots(slots)
    } catch (error) {
      console.error('Error fetching slots:', error)
      setAvailableSlots([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const statsData = await fetchBookingStats(calendarType)
      setStats(statsData)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  // Business paid plans view
  if (calendarType === "business" && isPaid) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Select Your Plan</h2>
          <p className="text-muted-foreground">Choose the consultation package that fits your needs</p>
        </div>

        <div className="grid gap-6">
          {businessPlans.map((plan) => (
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
                <Button onClick={() => onPlanSelect?.(plan.id)} className="w-full btn-large btn-primary">
                  Select {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
          <p className="text-muted-foreground">Loading available slots...</p>
        </div>
      </div>
    )
  }

  // Get title and icon based on calendar and session type
  const getCalendarTitle = () => {
    if (calendarType === "business") {
      return "Available Free Sessions"
    }

    if (sessionType === "online-free" || sessionType === "online-paid") {
      return `Available ${sessionType === "online-free" ? "Free" : "Paid"} Online Sessions`
    }

    return "Available In-Person Sessions"
  }

  const getCalendarIcon = () => {
    if (sessionType === "in-person") return MapPin
    if (sessionType?.includes("online")) return Video
    return Calendar
  }

  const CalendarIcon = getCalendarIcon()

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">{getCalendarTitle()}</h2>
        <p className="text-muted-foreground">
          {calendarType === "business"
            ? "All future slots available - book now"
            : sessionType === "in-person"
              ? "Choose your preferred location and time"
              : "Select your preferred time slot"
          }
        </p>
      </div>

      <Card className="card-calm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            {sessionType === "in-person"
              ? "In-Person Sessions - $75 each"
              : `All Available ${sessionType === "online-free" ? "Free" : sessionType === "online-paid" ? "Paid" : ""} ${
                  sessionType?.includes("online") ? "Online " : ""
                }Sessions`
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          {availableSlots.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No available slots found</p>
              {calendarType === "business" && (
                <p className="text-sm text-muted-foreground mt-2">Check back later or contact support</p>
              )}
            </div>
          ) : (
            <div className="grid gap-3 max-h-80 overflow-y-auto">
              {availableSlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    slot.is_available
                      ? "border-border hover:border-primary/50 cursor-pointer"
                      : "border-border bg-muted/50 cursor-not-allowed"
                  }`}
                >
                  <div className={sessionType === "in-person" ? "space-y-2" : "flex items-center gap-3"}>
                    <div className={sessionType === "in-person" ? "flex items-center gap-3" : ""}>
                      <div className="text-sm font-medium">
                        {formatDate(slot.date)}
                      </div>
                      <div className="text-sm text-muted-foreground">{formatTime(slot.time)}</div>
                      {calendarType === "business" && (
                        <>
                          <Badge variant="outline" className="text-xs">{slot.slot_type}</Badge>
                          <Badge variant={slot.session_type === 'paid' ? 'default' : 'secondary'} className="text-xs">
                            {slot.session_type === 'paid' ? 'Paid' : 'FREE'}
                          </Badge>
                        </>
                      )}
                      {sessionType?.includes("online") && (
                        <>
                          <Badge variant="outline" className="text-xs">Zoom</Badge>
                          <Badge variant={slot.session_type === 'paid' ? 'default' : 'secondary'} className="text-xs">
                            {slot.session_type === 'paid' ? 'Paid' : 'FREE'}
                          </Badge>
                        </>
                      )}
                    </div>
                    {sessionType === "in-person" && (
                      <>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span className="font-medium">Downtown Office</span>
                        </div>
                        <div className="text-xs text-muted-foreground">123 Tech Street, Suite 400</div>
                      </>
                    )}
                  </div>
                  {slot.is_available ? (
                    <Button
                      size="sm"
                      onClick={() => {
                        if (calendarType === "business") {
                          onPlanSelect?.("30min")
                        } else {
                          onBookingSelect?.(slot)
                        }
                      }}
                    >
                      {sessionType === "in-person" ? "Select & Pay" :
                       calendarType === "business" ? "Book Slot" : "Book Session"}
                    </Button>
                  ) : (
                    <Badge variant="secondary">Booked</Badge>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Stats Section */}
          <div className="mt-6 p-4 bg-muted/30 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {calendarType === "business" ? "This Week's Stats" :
                 sessionType === "in-person" ? "Session Locations" : "Student Session Stats"}
              </span>
            </div>

            {sessionType === "in-person" ? (
              <div className="space-y-2 text-sm">
                {venueLocations.map((venue) => (
                  <div key={venue.id} className="flex items-center gap-2">
                    <div className={`w-2 h-2 ${venue.color === 'primary' ? 'bg-primary' : 'bg-secondary'} rounded-full`} />
                    <span className="font-medium">{venue.name}:</span>
                    <span className="text-muted-foreground">{venue.description}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">
                    {calendarType === "business" ? "Total Bookings:" : "This Week:"}
                  </span>
                  <span className="ml-2 font-semibold">
                    {calendarType === "business" ? stats.totalBookings : `${availableSlots.length} sessions`}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {calendarType === "business" ? "Pending Approvals:" : "Available:"}
                  </span>
                  <span className="ml-2 font-semibold">
                    {calendarType === "business" ? stats.pendingApprovals : `${availableSlots.filter(s => s.is_available).length} slots`}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}