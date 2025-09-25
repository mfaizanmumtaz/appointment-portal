"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, Clock, MessageSquare, User, Video, MapPin } from "lucide-react"
import type { MeetingType } from "@/lib/types/database"


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
  meeting_type?: MeetingType | null
  meeting_url?: string | null
  venue_address?: string | null
  meeting_notes?: string | null
  purpose?: string | null
  created_at: string
}

export function AdminRequests() {
  const [requests, setRequests] = useState<Appointment[]>([])
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null)
  const [responseNote, setResponseNote] = useState("")
  const [loading, setLoading] = useState(true)

  // Meeting details for approval
  const [meetingDetails, setMeetingDetails] = useState({
    meeting_type: 'online' as MeetingType,
    meeting_url: '',
    venue_address: '',
    meeting_notes: ''
  })

  useEffect(() => {
    fetchPendingAppointments()
  }, [])

  const fetchPendingAppointments = async () => {
    setLoading(true)
    try {
      const { supabase } = await import("@/lib/supabase")

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching requests:', error)
        return
      }

      setRequests(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId: string) => {
    try {
      const { supabase } = await import("@/lib/supabase")

      const updateData = {
        status: 'confirmed',
        meeting_type: meetingDetails.meeting_type,
        meeting_url: meetingDetails.meeting_url || null,
        venue_address: meetingDetails.venue_address || null,
        meeting_notes: meetingDetails.meeting_notes || null
      }

      const { error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', requestId)

      if (error) {
        console.error('Error approving request:', error)
        return
      }

      setRequests((prev) => prev.filter((req) => req.id !== requestId))
      setSelectedRequest(null)
      setResponseNote("")
      setMeetingDetails({
        meeting_type: 'online',
        meeting_url: '',
        venue_address: '',
        meeting_notes: ''
      })
      alert('Request approved and meeting details saved!')
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to approve request')
    }
  }

  const generateZoomLink = () => {
    const meetingId = Math.floor(Math.random() * 1000000000)
    const zoomLink = `https://zoom.us/j/${meetingId}?pwd=abc123`
    setMeetingDetails(prev => ({ ...prev, meeting_url: zoomLink }))
  }

  const handleDecline = async (requestId: string) => {
    try {
      const { supabase } = await import("@/lib/supabase")

      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', requestId)

      if (error) {
        console.error('Error declining request:', error)
        return
      }

      setRequests((prev) => prev.filter((req) => req.id !== requestId))
      setSelectedRequest(null)
      setResponseNote("")
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "declined":
        return "bg-red-100 text-red-800"
      case "uncertain":
        return "bg-yellow-100 text-yellow-800"
      case "pending":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "business-free":
        return "border-l-primary"
      case "student-free":
        return "border-l-secondary"
      default:
        return "border-l-gray-300"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading requests...</p>
      </div>
    )
  }

  const pendingRequests = requests

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-font text-3xl font-bold text-foreground mb-2">Requests Queue</h1>
        <p className="text-muted-foreground">Review and manage free session requests</p>
      </div>

      <div className="grid gap-6">
        {pendingRequests.length === 0 ? (
          <Card className="card-calm">
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Pending Requests</h3>
              <p className="text-muted-foreground">All requests have been reviewed</p>
            </CardContent>
          </Card>
        ) : (
          pendingRequests.map((request) => (
            <Card key={request.id} className="card-calm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {request.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                    <Badge variant="outline">{request.type === "business" ? "Business" : request.type === "student" ? "Student" : "In-Person"}</Badge>
                    <Badge variant="outline">{request.session_type === "paid" ? "Paid" : "Free"}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <span className="ml-2">{request.email}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="ml-2">{request.phone}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <span className="ml-2">{new Date(request.date).toLocaleDateString()} at {request.time}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Submitted:</span>
                    <span className="ml-2">{new Date(request.created_at).toLocaleString()}</span>
                  </div>
                  {request.company && (
                    <div>
                      <span className="text-muted-foreground">Company:</span>
                      <span className="ml-2">{request.company}</span>
                    </div>
                  )}
                </div>

                {selectedRequest === request.id ? (
                  <div className="space-y-4 border-t border-border pt-4">
                    {/* Meeting Details Section */}
                    <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        Set Meeting Details (Required for Approval)
                      </h4>

                      {/* Meeting Type */}
                      <div>
                        <Label>Meeting Type</Label>
                        <Select
                          value={meetingDetails.meeting_type}
                          onValueChange={(value: MeetingType) =>
                            setMeetingDetails(prev => ({ ...prev, meeting_type: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="online">
                              <div className="flex items-center gap-2">
                                <Video className="w-4 h-4" />
                                Online (Video Call)
                              </div>
                            </SelectItem>
                            <SelectItem value="in-person">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                In Person
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Meeting URL for online meetings */}
                      {meetingDetails.meeting_type === 'online' && (
                        <div>
                          <Label>Meeting URL (Required)</Label>
                          <div className="flex gap-2">
                            <Input
                              value={meetingDetails.meeting_url}
                              onChange={(e) => setMeetingDetails(prev => ({ ...prev, meeting_url: e.target.value }))}
                              placeholder="https://zoom.us/j/123456789"
                              required
                            />
                            <Button type="button" variant="outline" onClick={generateZoomLink}>
                              Generate Zoom
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Venue Address for in-person meetings */}
                      {meetingDetails.meeting_type === 'in-person' && (
                        <div>
                          <Label>Venue Address (Required)</Label>
                          <Textarea
                            value={meetingDetails.venue_address}
                            onChange={(e) => setMeetingDetails(prev => ({ ...prev, venue_address: e.target.value }))}
                            placeholder="123 Business Ave, Suite 100, City, State 12345"
                            rows={3}
                            required
                          />
                        </div>
                      )}

                      {/* Meeting Notes */}
                      <div>
                        <Label>Admin Notes (Optional)</Label>
                        <Textarea
                          value={meetingDetails.meeting_notes}
                          onChange={(e) => setMeetingDetails(prev => ({ ...prev, meeting_notes: e.target.value }))}
                          placeholder="Internal notes about this meeting..."
                          rows={2}
                        />
                      </div>
                    </div>

                    {/* Response Note */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Response Note to Client (Optional)</label>
                      <Textarea
                        value={responseNote}
                        onChange={(e) => setResponseNote(e.target.value)}
                        placeholder="Add a note for the client..."
                        className="rounded-xl"
                        rows={2}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleApprove(request.id)}
                        className="btn-primary"
                        disabled={
                          meetingDetails.meeting_type === 'online' ? !meetingDetails.meeting_url :
                          meetingDetails.meeting_type === 'in-person' ? !meetingDetails.venue_address :
                          false
                        }
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve with Meeting Details
                      </Button>
                      <Button onClick={() => handleDecline(request.id)} variant="destructive">
                        <XCircle className="w-4 h-4 mr-2" />
                        Decline Request
                      </Button>
                      <Button onClick={() => setSelectedRequest(null)} variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Button onClick={() => setSelectedRequest(request.id)} variant="outline">
                      <Clock className="w-4 h-4 mr-2" />
                      Review Request
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <Card className="card-calm">
        <CardHeader>
          <CardTitle>Queue Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {requests.length}
              </p>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {requests.filter((r) => r.session_type === "free").length}
              </p>
              <p className="text-sm text-muted-foreground">Free Sessions</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
