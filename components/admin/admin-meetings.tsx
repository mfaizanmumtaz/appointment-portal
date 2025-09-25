"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Clock,
  User,
  Video,
  MapPin,
  Edit3,
  ExternalLink,
  Mail,
  Phone,
  Building,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react"
import type { Appointment, MeetingType } from "@/lib/types/database"

export function AdminMeetings() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [editingMeeting, setEditingMeeting] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending' | 'completed'>('all')

  // Form state for editing meeting details
  const [meetingForm, setMeetingForm] = useState({
    meeting_url: '',
    venue_address: '',
    meeting_notes: '',
    meeting_type: 'online' as MeetingType
  })

  useEffect(() => {
    fetchAppointments()

    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchAppointments()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    await fetchAppointments()
    setIsRefreshing(false)
  }

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const { supabase } = await import("@/lib/supabase")

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: true })
        .order('time', { ascending: true })

      if (error) {
        console.error('Error fetching appointments:', error)
        return
      }

      setAppointments(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateMeeting = async (appointmentId: string) => {
    try {
      const { supabase } = await import("@/lib/supabase")

      const updateData = {
        meeting_url: meetingForm.meeting_url || null,
        venue_address: meetingForm.venue_address || null,
        meeting_notes: meetingForm.meeting_notes || null,
        meeting_type: meetingForm.meeting_type
      }

      const { error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', appointmentId)

      if (error) {
        console.error('Error updating meeting:', error)
        alert(`Error: ${error.message}`)
        return
      }

      // Update local state
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId
            ? { ...apt, ...updateData }
            : apt
        )
      )

      setEditingMeeting(null)
      alert('Meeting details updated successfully!')
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to update meeting details')
    }
  }

  const openEditDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setMeetingForm({
      meeting_url: appointment.meeting_url || '',
      venue_address: appointment.venue_address || '',
      meeting_notes: appointment.meeting_notes || '',
      meeting_type: appointment.meeting_type || 'online'
    })
    setEditingMeeting(appointment.id)
  }

  const generateZoomLink = () => {
    // Generate a sample Zoom link (in real app, integrate with Zoom API)
    const meetingId = Math.floor(Math.random() * 1000000000)
    const zoomLink = `https://zoom.us/j/${meetingId}?pwd=abc123`
    setMeetingForm(prev => ({ ...prev, meeting_url: zoomLink }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true
    return apt.status === filter
  })

  const upcomingMeetings = appointments.filter(apt => {
    const today = new Date().toISOString().split('T')[0]
    return apt.date >= today && apt.status === 'confirmed'
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
          <p className="text-slate-600">Loading meetings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-font text-3xl font-bold text-foreground mb-2">Meeting Management</h1>
          <p className="text-muted-foreground">Manage Zoom links, venues, and meeting details</p>
        </div>
        <Button
          onClick={handleManualRefresh}
          variant="outline"
          size="sm"
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-modern">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{appointments.length}</div>
            <div className="text-sm text-muted-foreground">Total Appointments</div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{upcomingMeetings.length}</div>
            <div className="text-sm text-muted-foreground">Upcoming Meetings</div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {appointments.filter(a => a.meeting_type === 'online').length}
            </div>
            <div className="text-sm text-muted-foreground">Online Meetings</div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {appointments.filter(a => a.meeting_type === 'in-person').length}
            </div>
            <div className="text-sm text-muted-foreground">In-Person Meetings</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-muted rounded-xl">
          <TabsTrigger value="all">All ({appointments.length})</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed ({appointments.filter(a => a.status === 'confirmed').length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({appointments.filter(a => a.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({appointments.filter(a => a.status === 'completed').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <Card className="card-calm">
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No {filter === 'all' ? '' : filter} appointments</h3>
                <p className="text-muted-foreground">
                  {filter === 'all' ? 'No appointments found' : `No ${filter} appointments found`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredAppointments.map((appointment) => (
                <Card key={appointment.id} className="card-calm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3">
                        <User className="w-5 h-5" />
                        <div>
                          <div className="font-semibold">{appointment.name}</div>
                          <div className="text-sm text-muted-foreground font-normal">
                            {appointment.email}
                          </div>
                        </div>
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(appointment.status)}>
                          {getStatusIcon(appointment.status)}
                          <span className="ml-1 capitalize">{appointment.status}</span>
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {appointment.type}
                        </Badge>
                        <Badge variant={appointment.session_type === 'paid' ? 'default' : 'secondary'}>
                          {appointment.session_type === 'paid' ? 'Paid' : 'Free'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Meeting Details */}
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{new Date(appointment.date).toLocaleDateString()} at {appointment.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{appointment.phone}</span>
                        </div>
                        {appointment.company && (
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-muted-foreground" />
                            <span>{appointment.company}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {appointment.meeting_type === 'online' ? (
                            <Video className="w-4 h-4 text-blue-600" />
                          ) : (
                            <MapPin className="w-4 h-4 text-green-600" />
                          )}
                          <span className="capitalize">{appointment.meeting_type || 'Not set'}</span>
                        </div>
                        {appointment.meeting_url && (
                          <div className="flex items-center gap-2">
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            <a
                              href={appointment.meeting_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline truncate"
                            >
                              {appointment.meeting_url}
                            </a>
                          </div>
                        )}
                        {appointment.venue_address && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{appointment.venue_address}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {appointment.purpose && (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <div className="text-xs font-medium text-muted-foreground mb-1">Purpose:</div>
                        <div className="text-sm">{appointment.purpose}</div>
                      </div>
                    )}

                    {appointment.meeting_notes && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-xs font-medium text-blue-700 mb-1">Admin Notes:</div>
                        <div className="text-sm text-blue-900">{appointment.meeting_notes}</div>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(appointment)}
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit Meeting Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Edit Meeting Details</DialogTitle>
                          </DialogHeader>

                          {selectedAppointment && (
                            <div className="space-y-4">
                              {/* Client Info */}
                              <div className="p-4 bg-muted/30 rounded-lg">
                                <h4 className="font-medium mb-2">Client Information</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div><span className="text-muted-foreground">Name:</span> {selectedAppointment.name}</div>
                                  <div><span className="text-muted-foreground">Email:</span> {selectedAppointment.email}</div>
                                  <div><span className="text-muted-foreground">Phone:</span> {selectedAppointment.phone}</div>
                                  <div><span className="text-muted-foreground">Date:</span> {new Date(selectedAppointment.date).toLocaleDateString()} at {selectedAppointment.time}</div>
                                </div>
                              </div>

                              {/* Meeting Type */}
                              <div>
                                <Label>Meeting Type</Label>
                                <Select
                                  value={meetingForm.meeting_type}
                                  onValueChange={(value: MeetingType) =>
                                    setMeetingForm(prev => ({ ...prev, meeting_type: value }))
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="online">Online (Video Call)</SelectItem>
                                    <SelectItem value="in-person">In Person</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Meeting URL (for online meetings) */}
                              {meetingForm.meeting_type === 'online' && (
                                <div>
                                  <Label>Meeting URL (Zoom/Google Meet)</Label>
                                  <div className="flex gap-2">
                                    <Input
                                      value={meetingForm.meeting_url}
                                      onChange={(e) => setMeetingForm(prev => ({ ...prev, meeting_url: e.target.value }))}
                                      placeholder="https://zoom.us/j/123456789"
                                    />
                                    <Button type="button" variant="outline" onClick={generateZoomLink}>
                                      Generate Zoom
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* Venue Address (for in-person meetings) */}
                              {meetingForm.meeting_type === 'in-person' && (
                                <div>
                                  <Label>Venue Address</Label>
                                  <Textarea
                                    value={meetingForm.venue_address}
                                    onChange={(e) => setMeetingForm(prev => ({ ...prev, venue_address: e.target.value }))}
                                    placeholder="123 Business Ave, Suite 100, City, State 12345"
                                    rows={3}
                                  />
                                </div>
                              )}

                              {/* Meeting Notes */}
                              <div>
                                <Label>Admin Notes (Internal)</Label>
                                <Textarea
                                  value={meetingForm.meeting_notes}
                                  onChange={(e) => setMeetingForm(prev => ({ ...prev, meeting_notes: e.target.value }))}
                                  placeholder="Internal notes about this meeting..."
                                  rows={3}
                                />
                              </div>

                              <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setEditingMeeting(null)}>
                                  Cancel
                                </Button>
                                <Button onClick={() => handleUpdateMeeting(selectedAppointment.id)}>
                                  Save Changes
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}