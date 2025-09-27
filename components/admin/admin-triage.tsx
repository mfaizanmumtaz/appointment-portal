"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Shield, User, Mail, MessageSquare, CheckCircle, AlertTriangle } from "lucide-react"
import { useOffline } from "@/hooks/use-offline"
import { OfflineStatus, ErrorBanner } from "@/components/ui/offline-status"

interface TriageEntry {
  id: string
  student_name: string
  student_email: string
  student_phone: string
  purpose: string
  ai_decision: "approved" | "declined" | "uncertain"
  ai_reasoning: string
  ai_confidence: number
  manual_review: boolean
  manual_decision?: "approved" | "declined"
  manual_notes?: string
  reviewed_by?: string
  reviewed_at?: string
  created_at: string
}

export function AdminTriage() {
  const [triageEntries, setTriageEntries] = useState<TriageEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null)
  const [reachBackMessage, setReachBackMessage] = useState("")

  const {
    isOnline,
    error,
    lastUpdated,
    isRefreshing,
    setLastUpdated,
    setIsRefreshing,
    executeWithOfflineCheck
  } = useOffline({ autoRefresh: true, refreshInterval: 30000 })

  useEffect(() => {
    executeWithOfflineCheck(fetchTriageEntries)

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (navigator.onLine) {
        executeWithOfflineCheck(fetchTriageEntries)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    await executeWithOfflineCheck(fetchTriageEntries)
    setIsRefreshing(false)
  }

  const fetchTriageEntries = async () => {
    setLoading(true)

    const { supabase } = await import("@/lib/supabase")

      const { data, error } = await supabase
        .from('student_triage_log')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching triage entries:', error)
        return
      }

      setTriageEntries(data || [])
      setLastUpdated(new Date())
      setLoading(false)
  }

  const handleReachBack = async (entryId: string) => {
    try {
      const { supabase } = await import("@/lib/supabase")

      const { error } = await supabase
        .from('student_triage_log')
        .update({
          manual_review: true,
          manual_decision: 'declined',
          manual_notes: reachBackMessage,
          reviewed_by: 'Admin',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', entryId)

      if (error) {
        console.error('Error updating triage entry:', error)
        return
      }

      // Update local state
      setTriageEntries((prev) =>
        prev.map((entry) =>
          entry.id === entryId
            ? {
                ...entry,
                manual_review: true,
                manual_decision: 'declined',
                manual_notes: reachBackMessage,
                reviewed_by: 'Admin',
                reviewed_at: new Date().toISOString()
              }
            : entry
        )
      )
      setSelectedEntry(null)
      setReachBackMessage("")
      // TODO: Here you would typically send an email to the user
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleApprove = async (entryId: string) => {
    try {
      const { supabase } = await import("@/lib/supabase")

      const { error } = await supabase
        .from('student_triage_log')
        .update({
          manual_review: true,
          manual_decision: 'approved',
          reviewed_by: 'Admin',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', entryId)

      if (error) {
        console.error('Error updating triage entry:', error)
        return
      }

      // Update local state
      setTriageEntries((prev) =>
        prev.map((entry) =>
          entry.id === entryId
            ? {
                ...entry,
                manual_review: true,
                manual_decision: 'approved',
                reviewed_by: 'Admin',
                reviewed_at: new Date().toISOString()
              }
            : entry
        )
      )
      setSelectedEntry(null)
      // TODO: Create appointment entry for manually approved cases
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const getStatusColor = (entry: TriageEntry) => {
    if (entry.manual_review) {
      switch (entry.manual_decision) {
        case "declined":
          return "bg-blue-100 text-blue-800"
        case "approved":
          return "bg-green-100 text-green-800"
        default:
          return "bg-gray-100 text-gray-800"
      }
    } else {
      switch (entry.ai_decision) {
        case "declined":
          return "bg-red-100 text-red-800"
        case "approved":
          return "bg-green-100 text-green-800"
        case "uncertain":
          return "bg-yellow-100 text-yellow-800"
        default:
          return "bg-gray-100 text-gray-800"
      }
    }
  }

  const getStatusIcon = (entry: TriageEntry) => {
    if (entry.manual_review) {
      switch (entry.manual_decision) {
        case "declined":
          return <Mail className="w-4 h-4" />
        case "approved":
          return <CheckCircle className="w-4 h-4" />
        default:
          return <Shield className="w-4 h-4" />
      }
    } else {
      switch (entry.ai_decision) {
        case "declined":
          return <AlertTriangle className="w-4 h-4" />
        case "approved":
          return <CheckCircle className="w-4 h-4" />
        case "uncertain":
          return <Shield className="w-4 h-4" />
        default:
          return <Shield className="w-4 h-4" />
      }
    }
  }

  const getStatusText = (entry: TriageEntry) => {
    if (entry.manual_review) {
      return entry.manual_decision === "declined" ? "Reached Back" : "Manually Approved"
    } else {
      return `AI ${entry.ai_decision}`
    }
  }

  const declinedEntries = triageEntries.filter((entry) =>
    entry.ai_decision === "declined" || (entry.manual_review && entry.manual_decision === "declined")
  )
  const approvedEntries = triageEntries.filter((entry) =>
    entry.ai_decision === "approved" || (entry.manual_review && entry.manual_decision === "approved")
  )
  const uncertainEntries = triageEntries.filter((entry) =>
    entry.ai_decision === "uncertain" && !entry.manual_review
  )
  const manuallyReviewedEntries = triageEntries.filter((entry) => entry.manual_review)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
          <p className="text-slate-600">Loading triage logs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-font text-3xl font-bold text-foreground mb-2">AI Triage Log</h1>
          <p className="text-muted-foreground">Review AI decisions and manually declined sessions</p>
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-calm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{declinedEntries.length}</p>
                <p className="text-sm text-muted-foreground">Declined</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-calm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{approvedEntries.length}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-calm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{uncertainEntries.length}</p>
                <p className="text-sm text-muted-foreground">Uncertain</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-calm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{manuallyReviewedEntries.length}</p>
                <p className="text-sm text-muted-foreground">Manual Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Triage Entries */}
      <div className="space-y-4">
        {triageEntries.length === 0 ? (
          <Card className="card-calm">
            <CardContent className="p-8 text-center">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Triage Entries</h3>
              <p className="text-muted-foreground">No AI triage decisions yet</p>
            </CardContent>
          </Card>
        ) : (
          triageEntries.map((entry) => (
            <Card key={entry.id} className="card-calm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {entry.student_name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(entry)}>
                      {getStatusIcon(entry)}
                      <span className="ml-1">{getStatusText(entry)}</span>
                    </Badge>
                    <Badge variant="outline">Student</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <span className="ml-2">{entry.student_email}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="ml-2">{entry.student_phone}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Submitted:</span>
                    <span className="ml-2">{new Date(entry.created_at).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Confidence:</span>
                    <span className="ml-2">{Math.round(entry.ai_confidence * 100)}%</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Original Request:</h4>
                  <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-xl">{entry.purpose}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    AI Decision:
                  </h4>
                  <p className={`text-sm p-3 rounded-xl border ${
                    entry.ai_decision === 'declined'
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : entry.ai_decision === 'approved'
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                  }`}>
                    <strong>Decision:</strong> {entry.ai_decision}
                    <br />
                    <strong>Reasoning:</strong> {entry.ai_reasoning}
                  </p>
                </div>

                {entry.manual_review && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Manual Review:
                    </h4>
                    <p className="text-sm bg-blue-50 p-3 rounded-xl border border-blue-200 text-blue-700">
                      <strong>Decision:</strong> {entry.manual_decision}
                      <br />
                      <strong>Reviewed by:</strong> {entry.reviewed_by}
                      <br />
                      <strong>Date:</strong> {entry.reviewed_at ? new Date(entry.reviewed_at).toLocaleString() : 'N/A'}
                      {entry.manual_notes && (
                        <>
                          <br />
                          <strong>Notes:</strong> {entry.manual_notes}
                        </>
                      )}
                    </p>
                  </div>
                )}

                {entry.ai_decision === "declined" && !entry.manual_review && (
                  <>
                    {selectedEntry === entry.id ? (
                      <div className="space-y-4 border-t border-border pt-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Reach Back Message (Optional)</label>
                          <Textarea
                            value={reachBackMessage}
                            onChange={(e) => setReachBackMessage(e.target.value)}
                            placeholder="Hi [Name], I reviewed your request and would like to discuss it further. Could you provide more details about..."
                            className="rounded-xl"
                            rows={4}
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button onClick={() => handleReachBack(entry.id)} className="btn-primary">
                            <Mail className="w-4 h-4 mr-2" />
                            Send & Reach Back
                          </Button>
                          <Button onClick={() => handleApprove(entry.id)} variant="outline">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve Directly
                          </Button>
                          <Button onClick={() => setSelectedEntry(null)} variant="outline">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <Button onClick={() => setSelectedEntry(entry.id)} variant="outline">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Reach Back
                        </Button>
                        <Button onClick={() => handleApprove(entry.id)} variant="outline">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
