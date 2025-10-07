"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  FileText,
  Download,
  Mail,
  CalendarDays,
  RefreshCw,
} from "lucide-react"
import { fetchEventInvitations, confirmEventInvitation, rejectEventInvitation, subscribeToEventInvitations, sendEventConfirmationEmail, sendEventRejectionEmail } from "@/lib/event-utils"
import type { EventInvitation } from "@/lib/types/database"
import { useToast } from "@/hooks/use-toast"

// Use EventInvitation type from database types
type EventRequest = EventInvitation & {
  eventTitle: string // Map from event_title
  organiserName: string // Map from organiser_name
  audienceSize: string // Map from audience_size
  travelExpenses: string // Map from travel_expenses
  eventDetails: string // Map from event_details
  submittedAt: string // Map from created_at
  rejectionReason?: string // Map from rejection_reason
  attachment?: string // Map from attachment_name
  attachmentUrl?: string // Map from attachment_url
}


export function AdminEvents() {
  const [events, setEvents] = useState<EventRequest[]>([])
  const [selectedEvent, setSelectedEvent] = useState<EventRequest | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [eventToReject, setEventToReject] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Helper function to safely format dates
  const formatDate = (dateString: string) => {
    if (!dateString) return "No date set"
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Invalid date"
    return date.toLocaleDateString()
  }

  // Helper function to safely format dates with options
  const formatDateWithOptions = (dateString: string, options: Intl.DateTimeFormatOptions) => {
    if (!dateString) return "No date set"
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Invalid date"
    return date.toLocaleDateString("en-US", options)
  }

  // Helper function to safely get date parts
  const getDatePart = (dateString: string, part: 'date' | 'month') => {
    if (!dateString) return "?"
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "?"
    return part === 'date' ? date.getDate().toString() : date.toLocaleDateString("en-US", { month: "short" })
  }

  // Handle attachment download
  const handleAttachmentDownload = async (attachmentUrl: string, filename: string) => {
    try {
      // Open the attachment URL in a new tab for viewing/downloading
      window.open(attachmentUrl, '_blank')
      
      toast({
        title: "Opening Attachment",
        description: `Opening ${filename} in a new tab.`,
      })
    } catch (error) {
      console.error('Error opening attachment:', error)
      toast({
        title: "Error",
        description: "Failed to open attachment. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Load events from Supabase
  useEffect(() => {
    loadEvents()
    
    // Set up real-time subscription
    const subscription = subscribeToEventInvitations((payload) => {
      console.log('Real-time event invitation update:', payload)
      loadEvents() // Reload events when changes occur
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const result = await fetchEventInvitations()
      
      if (result.success) {
        // Map database fields to component expected format
        const mappedEvents: EventRequest[] = result.data.map((invitation: EventInvitation) => ({
          ...invitation,
          eventTitle: invitation.event_title,
          organiserName: invitation.organiser_name,
          audienceSize: invitation.audience_size,
          travelExpenses: invitation.travel_expenses,
          eventDetails: invitation.event_details,
          submittedAt: new Date(invitation.created_at).toLocaleString(),
          rejectionReason: invitation.rejection_reason,
          attachment: invitation.attachment_name,
          attachmentUrl: invitation.attachment_url,
        }))
        
        setEvents(mappedEvents)
        setError(null)
      } else {
        setError(result.error)
      }
    } catch (err) {
      console.error('Error loading events:', err)
      setError('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (eventId: string) => {
    try {
      const result = await confirmEventInvitation(eventId)
      
      if (result.success) {
        // Update local state
        setEvents((prev) =>
          prev.map((event) => (event.id === eventId ? { ...event, status: "confirmed" as const } : event)),
        )
        
        // Send confirmation email
        const confirmedEvent = events.find(e => e.id === eventId)
        if (confirmedEvent) {
          const emailResult = await sendEventConfirmationEmail(confirmedEvent)
          if (emailResult.success) {
            toast({
              title: "Event Confirmed Successfully! ✅",
              description: `Event "${confirmedEvent.event_title}" has been confirmed and confirmation email sent to ${confirmedEvent.organiser_name}.`,
            })
          } else {
            toast({
              title: "Event Confirmed ⚠️",
              description: "Event confirmed but failed to send email. Please contact the organiser manually.",
              variant: "destructive",
            })
          }
        } else {
          toast({
            title: "Event Confirmed",
            description: "Event has been confirmed successfully.",
          })
        }
      } else {
        toast({
          title: "Confirmation Failed",
          description: "Failed to confirm event. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error confirming event:', error)
      toast({
        title: "Confirmation Error",
        description: "An error occurred while confirming the event. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRejectClick = (eventId: string) => {
    setEventToReject(eventId)
    setShowRejectDialog(true)
  }

  const handleRejectSubmit = async () => {
    if (eventToReject && rejectionReason.trim()) {
      try {
        const result = await rejectEventInvitation(eventToReject, rejectionReason)
        
        if (result.success) {
          // Update local state
          setEvents((prev) =>
            prev.map((event) =>
              event.id === eventToReject
                ? { ...event, status: "rejected" as const, rejectionReason: rejectionReason }
                : event,
            ),
          )
          
          // Send rejection email
          const rejectedEvent = events.find(e => e.id === eventToReject)
          if (rejectedEvent) {
            const emailResult = await sendEventRejectionEmail(rejectedEvent, rejectionReason)
            if (emailResult.success) {
              toast({
                title: "Event Rejected Successfully ❌",
                description: `Event "${rejectedEvent.event_title}" has been rejected and rejection email sent to ${rejectedEvent.organiser_name}.`,
              })
            } else {
              toast({
                title: "Event Rejected ⚠️",
                description: "Event rejected but failed to send email. Please contact the organiser manually.",
                variant: "destructive",
              })
            }
          } else {
            toast({
              title: "Event Rejected",
              description: "Event has been rejected successfully.",
            })
          }
          
          setShowRejectDialog(false)
          setRejectionReason("")
          setEventToReject(null)
        } else {
          toast({
            title: "Rejection Failed",
            description: "Failed to reject event. Please try again.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error rejecting event:', error)
        toast({
          title: "Rejection Error",
          description: "An error occurred while rejecting the event. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleViewDetails = (event: EventRequest) => {
    setSelectedEvent(event)
    setShowDetailsDialog(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const pendingEvents = events.filter((e) => e.status === "pending")
  const upcomingEvents = events
    .filter((e) => {
      if (e.status !== "confirmed") return false
      if (!e.event_date) return false
      const eventDate = new Date(e.event_date)
      return !isNaN(eventDate.getTime()) && eventDate >= new Date()
    })
    .sort((a, b) => {
      const dateA = new Date(a.event_date)
      const dateB = new Date(b.event_date)
      if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0
      return dateA.getTime() - dateB.getTime()
    })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
          <p className="text-slate-600">Loading event invitations...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="heading-font text-3xl font-bold text-foreground mb-2">Event Management</h1>
          <p className="text-muted-foreground">Manage event invitations and speaking engagements</p>
        </div>
        <Card className="card-calm">
          <CardContent className="p-8 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Events</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadEvents} variant="outline" className="cursor-pointer">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="heading-font text-3xl font-bold text-foreground mb-2">Event Management</h1>
          <p className="text-muted-foreground">Manage event invitations and speaking engagements</p>
        </div>
        <Button
          onClick={loadEvents}
          variant="outline"
          size="sm"
          className="cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                <p className="text-3xl font-bold text-foreground">{pendingEvents.length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Upcoming Events</p>
                <p className="text-3xl font-bold text-foreground">{upcomingEvents.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CalendarDays className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
                <p className="text-3xl font-bold text-foreground">
                  {events.filter((e) => e.status === "confirmed").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <p className="text-3xl font-bold text-foreground">
                  {events.filter((e) => e.status === "rejected").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2 cursor-pointer">
            <Clock className="w-4 h-4" />
            Pending ({pendingEvents.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center gap-2 cursor-pointer">
            <Calendar className="w-4 h-4" />
            Upcoming ({upcomingEvents.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2 cursor-pointer">
            <CalendarDays className="w-4 h-4" />
            All Events ({events.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Requests Tab */}
        <TabsContent value="pending" className="space-y-4">
          {pendingEvents.length === 0 ? (
            <Card className="card-calm">
              <CardContent className="p-8 text-center">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Pending Requests</h3>
                <p className="text-muted-foreground">All event invitations have been reviewed</p>
              </CardContent>
            </Card>
          ) : (
            pendingEvents.map((event) => (
              <Card key={event.id} className="card-calm hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewDetails(event)}>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{event.eventTitle}</CardTitle>
                        {event.attachment && (
                          <FileText className="w-4 h-4 text-blue-600" title="Has attachment" />
                        )}
                      </div>
                      <p className="text-muted-foreground">{event.organiserName}</p>
                    </div>
                    <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{formatDate(event.event_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{event.event_time || "No time set"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{event.audienceSize}</span>
                    </div>
                  </div>

                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground line-clamp-2">{event.eventDetails}</p>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Travel Expenses:</span>
                    <Badge variant="outline">{event.travelExpenses}</Badge>
                    {event.attachment && event.attachmentUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 ml-4 text-blue-600 hover:text-blue-800"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAttachmentDownload(event.attachmentUrl!, event.attachment!)
                        }}
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        <span className="text-sm">{event.attachment}</span>
                      </Button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 pt-4 border-t">
                    <Button onClick={() => handleViewDetails(event)} variant="outline" className="flex-1 sm:flex-none cursor-pointer">
                      View Details
                    </Button>
                    <Button
                      onClick={() => handleConfirm(event.id)}
                      className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirm
                    </Button>
                    <Button
                      onClick={() => handleRejectClick(event.id)}
                      variant="destructive"
                      className="flex-1 sm:flex-none cursor-pointer"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Upcoming Events Calendar Tab */}
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingEvents.length === 0 ? (
            <Card className="card-calm">
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Upcoming Events</h3>
                <p className="text-muted-foreground">No confirmed events scheduled</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {upcomingEvents.map((event) => (
                <Card
                  key={event.id}
                  className="card-calm hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleViewDetails(event)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 bg-blue-100 rounded-xl flex flex-col items-center justify-center">
                          <span className="text-3xl font-bold text-blue-600">
                            {getDatePart(event.event_date, 'date')}
                          </span>
                          <span className="text-xs text-blue-600 uppercase">
                            {getDatePart(event.event_date, 'month')}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-semibold mb-1">{event.eventTitle}</h3>
                            <p className="text-muted-foreground">{event.organiserName}</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{event.event_time || "No time set"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="truncate">{event.venue}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>{event.audienceSize} attendees</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* All Events Tab */}
        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {events.map((event) => (
              <Card
                key={event.id}
                className="card-calm hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleViewDetails(event)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">{event.eventTitle}</h3>
                      <p className="text-muted-foreground">{event.organiserName}</p>
                    </div>
                    <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{formatDate(event.event_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{event.event_time || "No time set"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{event.audienceSize}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Event Invitation</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this event invitation.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={5}
              className="rounded-xl"
            />
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button
              onClick={handleRejectSubmit}
              disabled={!rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedEvent && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl mb-2">{selectedEvent.eventTitle}</DialogTitle>
                    <DialogDescription className="text-base">{selectedEvent.organiserName}</DialogDescription>
                  </div>
                  <Badge className={getStatusColor(selectedEvent.status)}>{selectedEvent.status}</Badge>
                </div>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">Date</span>
                    </div>
                    <p className="text-base">
                      {formatDateWithOptions(selectedEvent.event_date, {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">Time</span>
                    </div>
                    <p className="text-base">{selectedEvent.event_time || "No time set"}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">Venue</span>
                  </div>
                  <p className="text-base">{selectedEvent.venue}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">Audience Size</span>
                    </div>
                    <p className="text-base">{selectedEvent.audienceSize}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span className="font-medium">Travel Expenses</span>
                    </div>
                    <Badge variant="outline" className="text-base">
                      {selectedEvent.travelExpenses}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground">Event Details</h4>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-sm leading-relaxed">{selectedEvent.eventDetails}</p>
                  </div>
                </div>

                {selectedEvent.attachment && selectedEvent.attachmentUrl && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground">Attachment</h4>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start bg-transparent hover:bg-blue-50 cursor-pointer"
                      onClick={() => handleAttachmentDownload(selectedEvent.attachmentUrl!, selectedEvent.attachment!)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      {selectedEvent.attachment}
                      <Download className="w-4 h-4 ml-auto" />
                    </Button>
                  </div>
                )}

                {selectedEvent.rejectionReason && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-red-600">Rejection Reason</h4>
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                      <p className="text-sm text-red-800">{selectedEvent.rejectionReason}</p>
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  <p>Submitted: {selectedEvent.submittedAt}</p>
                </div>
              </div>
              {selectedEvent.status === "pending" && (
                <DialogFooter className="flex gap-2">
                  <Button
                    onClick={() => {
                      handleConfirm(selectedEvent.id)
                      setShowDetailsDialog(false)
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Event
                  </Button>
                  <Button
                    onClick={() => {
                      setShowDetailsDialog(false)
                      handleRejectClick(selectedEvent.id)
                    }}
                    variant="destructive"
                    className="flex-1 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Event
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
