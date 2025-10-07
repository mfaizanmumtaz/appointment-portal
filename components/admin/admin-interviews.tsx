"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, Eye, CheckCircle, XCircle, Clock, Linkedin, Youtube, Facebook, RefreshCw, Calendar, Mail, Phone, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { sendInterviewApprovalEmail, sendInterviewRejectionEmail } from "@/lib/interview-utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface InterviewRequest {
  id: string
  podcaster_name: string
  email: string
  phone: string
  linkedin_url: string
  youtube_link: string
  facebook_link: string
  agenda: string
  preferred_date: string | null
  notes: string | null
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  admin_notes: string | null
  responded_at: string | null
  created_at: string
}

export function AdminInterviews() {
  const [interviews, setInterviews] = useState<InterviewRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInterview, setSelectedInterview] = useState<InterviewRequest | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchInterviews()
  }, [])

  const fetchInterviews = async () => {
    setLoading(true)
    try {
      const { supabase } = await import("@/lib/supabase")

      const { data, error } = await (supabase as any)
        .from('interview_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching interviews:', error)
        return
      }

      setInterviews(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: 'approved' | 'rejected' | 'completed') => {
    try {
      const { supabase } = await import("@/lib/supabase")
      const interview = interviews.find(i => i.id === id)
      
      if (!interview) return

      const { error } = await (supabase as any)
        .from('interview_requests')
        .update({ 
          status,
          admin_notes: adminNotes || null,
          responded_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) {
        console.error('Error updating interview:', error)
        toast({
          title: "Error",
          description: "Failed to update interview status",
          variant: "destructive"
        })
        return
      }

      // Send email notifications for approval/rejection
      if (status === 'approved') {
        try {
          await sendInterviewApprovalEmail(interview)
          toast({
            title: "Success",
            description: `Interview approved and confirmation email sent to ${interview.podcaster_name}!`,
            variant: "default"
          })
        } catch (emailError) {
          console.error('Email error:', emailError)
          toast({
            title: "Partial Success",
            description: "Interview approved but failed to send email. Please contact manually.",
            variant: "default"
          })
        }
      } else if (status === 'rejected') {
        try {
          await sendInterviewRejectionEmail(interview, adminNotes || "Unfortunately, we cannot accommodate this request at this time.")
          toast({
            title: "Success",
            description: `Interview rejected and notification email sent to ${interview.podcaster_name}!`,
            variant: "default"
          })
        } catch (emailError) {
          console.error('Email error:', emailError)
          toast({
            title: "Partial Success",
            description: "Interview rejected but failed to send email. Please contact manually.",
            variant: "default"
          })
        }
      } else {
        toast({
          title: "Success",
          description: `Interview ${status} successfully!`,
          variant: "default"
        })
      }

      setInterviews(prev => prev.map(i => 
        i.id === id 
          ? { ...i, status, admin_notes: adminNotes || null, responded_at: new Date().toISOString() }
          : i
      ))

      setShowDetailModal(false)
      setSelectedInterview(null)
      setAdminNotes("")
      
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "Failed to update interview status",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-orange-600 border-orange-300"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-300"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-300"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      case 'completed':
        return <Badge variant="outline" className="text-blue-600 border-blue-300"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const handleViewDetails = (interview: InterviewRequest) => {
    setSelectedInterview(interview)
    setAdminNotes(interview.admin_notes || "")
    setShowDetailModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
          <p className="text-slate-600">Loading interviews...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-font text-3xl font-bold text-foreground mb-2">Interview Requests</h1>
          <p className="text-muted-foreground">Manage podcast and interview requests</p>
        </div>
        <Button onClick={fetchInterviews} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-calm">
          <CardContent className="p-4 text-center">
            <Mic className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{interviews.length}</p>
            <p className="text-sm text-muted-foreground">Total Requests</p>
          </CardContent>
        </Card>
        <Card className="card-calm">
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <p className="text-2xl font-bold">{interviews.filter(i => i.status === 'pending').length}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="card-calm">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold">{interviews.filter(i => i.status === 'approved').length}</p>
            <p className="text-sm text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card className="card-calm">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold">{interviews.filter(i => i.status === 'completed').length}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Interviews List */}
      <div className="grid gap-4">
        {interviews.length > 0 ? (
          interviews.map((interview) => (
            <Card key={interview.id} className="card-calm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{interview.podcaster_name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {interview.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {interview.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <a href={interview.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                        <Linkedin className="w-4 h-4" />
                      </a>
                      <a href={interview.youtube_link} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-800">
                        <Youtube className="w-4 h-4" />
                      </a>
                      <a href={interview.facebook_link} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900">
                        <Facebook className="w-4 h-4" />
                      </a>
                      {interview.preferred_date && (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(interview.preferred_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <p className="text-sm line-clamp-2 text-muted-foreground">{interview.agenda}</p>
                    
                    <div className="flex items-center justify-between">
                      {getStatusBadge(interview.status)}
                      <p className="text-xs text-muted-foreground">
                        {new Date(interview.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleViewDetails(interview)}
                    variant="outline"
                    size="sm"
                    className="bg-transparent"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="card-calm">
            <CardContent className="p-8 text-center">
              <Mic className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Interview Requests</h3>
              <p className="text-muted-foreground">Interview requests will appear here when submitted.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Interview Request Details
            </DialogTitle>
            <DialogDescription>
              Review and manage this interview request
            </DialogDescription>
          </DialogHeader>

          {selectedInterview && (
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="space-y-3">
                <h4 className="font-semibold">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {selectedInterview.podcaster_name}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {selectedInterview.email}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {selectedInterview.phone}
                  </div>
                  {selectedInterview.preferred_date && (
                    <div>
                      <span className="font-medium">Preferred Date:</span> {new Date(selectedInterview.preferred_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-3">
                <h4 className="font-semibold">Social Channels</h4>
                <div className="flex gap-4">
                  <a href={selectedInterview.linkedin_url} target="_blank" rel="noopener noreferrer" 
                     className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm">
                    <Linkedin className="w-4 h-4" />
                    LinkedIn Profile
                  </a>
                  <a href={selectedInterview.youtube_link} target="_blank" rel="noopener noreferrer"
                     className="flex items-center gap-2 text-red-600 hover:text-red-800 text-sm">
                    <Youtube className="w-4 h-4" />
                    YouTube Channel
                  </a>
                  <a href={selectedInterview.facebook_link} target="_blank" rel="noopener noreferrer"
                     className="flex items-center gap-2 text-blue-700 hover:text-blue-900 text-sm">
                    <Facebook className="w-4 h-4" />
                    Facebook Page
                  </a>
                </div>
              </div>

              {/* Agenda */}
              <div className="space-y-2">
                <h4 className="font-semibold">Interview Agenda</h4>
                <p className="text-sm bg-muted p-3 rounded-lg">{selectedInterview.agenda}</p>
              </div>

              {/* Notes */}
              {selectedInterview.notes && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Additional Notes</h4>
                  <p className="text-sm bg-muted p-3 rounded-lg">{selectedInterview.notes}</p>
                </div>
              )}

              {/* Admin Notes */}
              <div className="space-y-2">
                <Label htmlFor="adminNotes">Admin Notes</Label>
                <Textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this request..."
                  className="rounded-xl"
                  rows={3}
                />
              </div>

              {/* Current Status */}
              <div className="space-y-2">
                <h4 className="font-semibold">Current Status</h4>
                {getStatusBadge(selectedInterview.status)}
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDetailModal(false)}
            >
              Close
            </Button>
            {selectedInterview && selectedInterview.status === 'pending' && (
              <>
                <Button
                  onClick={() => updateStatus(selectedInterview.id, 'rejected')}
                  variant="outline"
                  className="text-red-600 hover:text-red-700 bg-transparent"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => updateStatus(selectedInterview.id, 'approved')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
            {selectedInterview && selectedInterview.status === 'approved' && (
              <Button
                onClick={() => updateStatus(selectedInterview.id, 'completed')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark Completed
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
