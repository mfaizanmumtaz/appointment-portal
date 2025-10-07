"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, User, DollarSign, Video, MapPin, RefreshCw, XCircle, CalendarDays, FileText } from "lucide-react"
import { useOffline } from "@/hooks/use-offline"
import { OfflineStatus, ErrorBanner } from "@/components/ui/offline-status"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { sendCancellationEmail } from "@/lib/meeting-utils"
import { fetchEventInvitations } from "@/lib/event-utils"
import type { EventInvitation } from "@/lib/types/database"


interface Appointment {
  id: string
  type: string
  session_type: string
  name: string
  email: string
  phone: string
  company?: string | null
  date: string
  time: string
  status: string
  slot_id?: string | null
  created_at: string
}

export function AdminCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [events, setEvents] = useState<EventInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [cancellationReason, setCancellationReason] = useState("")
  const { toast } = useToast()

  const {
    isOnline,
    error,
    lastUpdated,
    isRefreshing,
    setLastUpdated,
    setIsRefreshing,
    executeWithOfflineCheck
  } = useOffline({ autoRefresh: false, refreshInterval: 30000 })

  useEffect(() => {
    executeWithOfflineCheck(async () => {
      await fetchAppointments()
      await fetchConfirmedEvents()
    })
  }, [])

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    await executeWithOfflineCheck(async () => {
      await fetchAppointments()
      await fetchConfirmedEvents()
    })
    setIsRefreshing(false)
  }

  const fetchAppointments = async () => {
    setLoading(true)

    const { supabase } = await import("@/lib/supabase")

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .in('status', ['confirmed', 'pending'])
      .order('date', { ascending: true })
      .order('time', { ascending: true })

    if (error) {
      console.error('Error fetching appointments:', error)
      return
    }

    setAppointments(data || [])
    setLastUpdated(new Date())
    setLoading(false)
  }

  const fetchConfirmedEvents = async () => {
    const result = await fetchEventInvitations()
    if (result.success) {
      // Only show confirmed events
      const confirmedEvents = result.data.filter(event => event.status === 'confirmed')
      setEvents(confirmedEvents)
    }
  }

  const getAppointmentsByType = (type: "paid" | "free") => {
    return appointments.filter((apt) => (type === "paid" ? apt.session_type === "paid" : apt.session_type === "free"))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "business":
        return "border-l-primary"
      case "student":
        return "border-l-secondary"
      case "in-person":
        return "border-l-accent"
      default:
        return "border-l-gray-300"
    }
  }

  const handleCancelAppointment = async (appointment: Appointment) => {
    try {
      const { supabase } = await import("@/lib/supabase")

      // Update appointment status to cancelled
      const { error: appointmentError } = await supabase
        .from('appointments')
        .update({
          status: 'cancelled',
          meeting_notes: cancellationReason ? `Cancelled by CEO: ${cancellationReason}` : 'Cancelled by CEO'
        })
        .eq('id', appointment.id)

      if (appointmentError) {
        console.error('Error cancelling appointment:', appointmentError)
        toast({
          title: "Error",
          description: "Failed to cancel appointment",
          variant: "destructive"
        })
        return
      }

      // Delete the associated time slot if it exists
      if (appointment.slot_id) {
        const { error: slotError } = await supabase
          .from('time_slots')
          .delete()
          .eq('id', appointment.slot_id)

        if (slotError) {
          console.error('Error deleting time slot:', slotError)
          // Don't fail the whole operation, just log the error
          console.warn('Appointment cancelled but slot deletion failed')
        } else {
          console.log('✅ Time slot deleted successfully:', appointment.slot_id)
        }
      }

      // Send cancellation email to client
      try {
        await sendCancellationEmail({
          to: appointment.email,
          name: appointment.name,
          date: appointment.date,
          time: appointment.time,
          appointmentType: appointment.type as 'business' | 'student' | 'in-person',
          sessionType: appointment.session_type as 'free' | 'paid',
          reason: cancellationReason || undefined,
          cancelledBy: 'ceo'
        })

        toast({
          title: "Success",
          description: "Appointment cancelled, time slot freed up, and client notified via email",
          variant: "default"
        })
      } catch (emailError) {
        console.error('Error sending cancellation email:', emailError)
        toast({
          title: "Appointment Cancelled",
          description: "Appointment cancelled but email notification failed",
          variant: "default"
        })
      }

      // Update local state
      setAppointments(prev => prev.filter(apt => apt.id !== appointment.id))
      setCancellingId(null)
      setCancellationReason("")

    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
          <p className="text-slate-600">Loading appointments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-font text-3xl font-bold text-foreground mb-2">Calendar</h1>
          <p className="text-muted-foreground">Manage your appointments and schedule</p>
        </div>
        <OfflineStatus
          isOnline={isOnline}
          error={error}
          lastUpdated={lastUpdated}
          isRefreshing={isRefreshing}
          onRefresh={handleManualRefresh}
        />
      </div>

      <ErrorBanner error={error} />

      <Tabs defaultValue="paid" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="paid" className="flex items-center gap-2 cursor-pointer">
            <DollarSign className="w-4 h-4" />
            Paid Sessions ({getAppointmentsByType("paid").length})
          </TabsTrigger>
          <TabsTrigger value="free" className="flex items-center gap-2 cursor-pointer">
            <Calendar className="w-4 h-4" />
            Free Sessions ({getAppointmentsByType("free").length})
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2 cursor-pointer">
            <CalendarDays className="w-4 h-4" />
            Events ({events.filter(e => e.status === 'confirmed').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="paid" className="space-y-4">
          <Card className="card-calm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Paid Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getAppointmentsByType("paid").length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No paid appointments</p>
                ) : (
                  getAppointmentsByType("paid").map((appointment) => (
                    <div
                      key={appointment.id}
                      className={`p-4 border-l-4 ${getTypeColor(appointment.type)} bg-muted/30 rounded-r-xl cursor-pointer hover:bg-muted/50 transition-colors`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{appointment.name}</span>
                          <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-semibold">
                            Paid
                          </Badge>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setCancellingId(appointment.id)}
                                className="ml-2 cursor-pointer"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Cancel
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Cancel Appointment</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="p-4 bg-muted/30 rounded-lg">
                                  <h4 className="font-medium mb-2">Appointment Details</h4>
                                  <div className="text-sm space-y-1">
                                    <div><strong>Client:</strong> {appointment.name}</div>
                                    <div><strong>Email:</strong> {appointment.email}</div>
                                    <div><strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</div>
                                    <div><strong>Time:</strong> {appointment.time}</div>
                                    <div><strong>Type:</strong> {appointment.type} ({appointment.session_type})</div>
                                  </div>
                                </div>
                                <div>
                                  <Label htmlFor="reason">Reason for Cancellation (Optional)</Label>
                                  <Textarea
                                    id="reason"
                                    value={cancellationReason}
                                    onChange={(e) => setCancellationReason(e.target.value)}
                                    placeholder="Enter reason for cancellation (will be included in client email)..."
                                    rows={3}
                                  />
                                </div>
                                <div className="flex justify-end gap-3">
                                  <Button variant="outline" onClick={() => {
                                    setCancellingId(null)
                                    setCancellationReason("")
                                  }} className="cursor-pointer">
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleCancelAppointment(appointment)}
                                    className="cursor-pointer"
                                  >
                                    Confirm Cancellation
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {appointment.time}
                        </div>
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4" />
                          {new Date(appointment.date).toLocaleDateString()}
                        </div>
                        <div>{appointment.email}</div>
                        <div className="flex gap-2">
                          <Badge variant="outline">{appointment.type}</Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="free" className="space-y-4">
          <Card className="card-calm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Free Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getAppointmentsByType("free").length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No free appointments</p>
                ) : (
                  getAppointmentsByType("free").map((appointment) => (
                    <div
                      key={appointment.id}
                      className={`p-4 border-l-4 ${getTypeColor(appointment.type)} bg-muted/30 rounded-r-xl cursor-pointer hover:bg-muted/50 transition-colors`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{appointment.name}</span>
                          <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Free</Badge>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setCancellingId(appointment.id)}
                                className="ml-2 cursor-pointer"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Cancel
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Cancel Appointment</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="p-4 bg-muted/30 rounded-lg">
                                  <h4 className="font-medium mb-2">Appointment Details</h4>
                                  <div className="text-sm space-y-1">
                                    <div><strong>Client:</strong> {appointment.name}</div>
                                    <div><strong>Email:</strong> {appointment.email}</div>
                                    <div><strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</div>
                                    <div><strong>Time:</strong> {appointment.time}</div>
                                    <div><strong>Type:</strong> {appointment.type} ({appointment.session_type})</div>
                                  </div>
                                </div>
                                <div>
                                  <Label htmlFor="reason">Reason for Cancellation (Optional)</Label>
                                  <Textarea
                                    id="reason"
                                    value={cancellationReason}
                                    onChange={(e) => setCancellationReason(e.target.value)}
                                    placeholder="Enter reason for cancellation (will be included in client email)..."
                                    rows={3}
                                  />
                                </div>
                                <div className="flex justify-end gap-3">
                                  <Button variant="outline" onClick={() => {
                                    setCancellingId(null)
                                    setCancellationReason("")
                                  }} className="cursor-pointer">
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleCancelAppointment(appointment)}
                                    className="cursor-pointer"
                                  >
                                    Confirm Cancellation
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {appointment.time}
                        </div>
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4" />
                          {new Date(appointment.date).toLocaleDateString()}
                        </div>
                        <div>{appointment.email}</div>
                        <div className="flex gap-2">
                          <Badge variant="outline">{appointment.type}</Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card className="card-calm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                Confirmed Event Invitations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Confirmed Events</h3>
                    <p className="text-muted-foreground">Event invitations will appear here once confirmed</p>
                  </div>
                ) : (
                  events.map((event) => (
                    <div
                      key={event.id}
                      className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{event.event_title}</h4>
                          <p className="text-muted-foreground">Organiser: {event.organiser_name}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          Confirmed
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(event.event_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {event.event_time}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {event.venue}
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {event.audience_size} audience
                        </div>
                      </div>
                      {event.event_details && (
                        <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                          <p className="text-sm">{event.event_details}</p>
                        </div>
                      )}
                      {event.attachment_name && (
                        <div className="mt-3">
                          <Button variant="outline" size="sm" className="text-xs">
                            <FileText className="w-3 h-3 mr-1" />
                            {event.attachment_name}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
