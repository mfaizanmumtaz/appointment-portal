"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Video, Users, RefreshCw } from "lucide-react"

interface StudentCalendarProps {
  sessionType: "online-free" | "online-paid" | "in-person"
  onBookingSelect: (slot: any) => void
}

interface TimeSlot {
  id: string
  date: string
  time: string
  is_available: boolean
  slot_type: string
}


export function StudentCalendar({ sessionType, onBookingSelect }: StudentCalendarProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSlots()
  }, [sessionType])

  const fetchSlots = async () => {
    setLoading(true)
    try {
      const { supabase } = await import("@/lib/supabase")

      const today = new Date().toISOString().split('T')[0]
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)
      const nextWeekDate = nextWeek.toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('is_available', true)
        .in('slot_type', ['student', 'both'])
        .gte('date', today)
        .lte('date', nextWeekDate)
        .order('date', { ascending: true })
        .order('time', { ascending: true })

      if (error) {
        console.error('Error fetching slots:', error)
        setSlots([])
        return
      }

      setSlots(data || [])
    } catch (error) {
      console.error('Error:', error)
      setSlots([])
    } finally {
      setLoading(false)
    }
  }

  if (sessionType === "online-free" || sessionType === "online-paid") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Available Online Sessions</h2>
          <p className="text-muted-foreground">Select your preferred time slot</p>
        </div>

        <Card className="card-calm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              {sessionType === "online-free" ? "Free Online Sessions This Week" : "Paid Online Sessions This Week"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
                  <p className="text-slate-600">Loading available slots...</p>
                </div>
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No available slots found</div>
            ) : (
            <div className="grid gap-3">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-primary/50 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium">{new Date(slot.date).toLocaleDateString()}</div>
                    <div className="text-sm text-muted-foreground">{slot.time}</div>
                    <Badge variant="outline" className="text-xs">
                      Zoom
                    </Badge>
                  </div>
                  <Button size="sm" onClick={() => onBookingSelect(slot)}>
                    Book Session
                  </Button>
                </div>
              ))}
            </div>
            )}

            <div className="mt-6 p-4 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Student Session Stats</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">This Week:</span>
                  <span className="ml-2 font-semibold">{slots.length} sessions</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Available:</span>
                  <span className="ml-2 font-semibold">{slots.filter(s => s.is_available).length} slots</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // In-person sessions
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Available In-Person Sessions</h2>
        <p className="text-muted-foreground">Choose your preferred location and time</p>
      </div>

      <Card className="card-calm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            In-Person Sessions - $75 each
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
                <p className="text-slate-600">Loading available slots...</p>
              </div>
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No available slots found</div>
          ) : (
          <div className="grid gap-4">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/50 cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium">{new Date(slot.date).toLocaleDateString()}</div>
                    <div className="text-sm text-muted-foreground">{slot.time}</div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">Downtown Office</span>
                  </div>
                  <div className="text-xs text-muted-foreground">123 Tech Street, Suite 400</div>
                </div>
                <Button size="sm" onClick={() => onBookingSelect(slot)}>
                  Select & Pay
                </Button>
              </div>
            ))}
          </div>
          )}

          <div className="mt-6 p-4 bg-muted/30 rounded-xl">
            <h4 className="font-medium mb-2">Session Locations</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="font-medium">Downtown Office:</span>
                <span className="text-muted-foreground">Modern co-working space with whiteboards</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-secondary rounded-full" />
                <span className="font-medium">University Campus:</span>
                <span className="text-muted-foreground">Quiet study room with presentation setup</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
