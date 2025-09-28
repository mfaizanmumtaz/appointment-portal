"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Shield, User, Mail, MessageSquare, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react"

interface TriageEntry {
  id: string
  userName: string
  userEmail: string
  category: "business" | "student"
  reason: string
  aiReason: string
  submittedAt: string
  status: "refused" | "reached-back" | "approved"
  details: {
    company?: string
    school?: string
    purpose: string
  }
}

interface AccuracyStats {
  accuracy_percentage: number
  total_decisions: number
  correct_decisions: number
  total_declined: number
  total_approved: number
  total_uncertain: number
  total_manual_reviews: number
}

export function AdminTriage() {
  const [triageEntries, setTriageEntries] = useState<TriageEntry[]>([])
  const [accuracyStats, setAccuracyStats] = useState<AccuracyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null)
  const [reachBackMessage, setReachBackMessage] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    await Promise.all([
      fetchTriageEntries(),
      fetchAccuracyStats()
    ])
  }

  const fetchTriageEntries = async () => {
    try {
      setLoading(true)
      setError(null)

      const { supabase } = await import("@/lib/supabase")

      const { data, error } = await supabase
        .from('ai_triage_entries')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching triage entries:', error)
        setError('Failed to load triage entries')
        return
      }

      setTriageEntries(data || [])
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to load triage entries')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchAccuracyStats = async () => {
    try {
      const { supabase } = await import("@/lib/supabase")

      const { data, error } = await supabase.rpc('get_ai_accuracy_stats')

      if (error) {
        console.error('Error fetching accuracy stats:', error)
        return
      }

      if (data && data.length > 0) {
        setAccuracyStats(data[0])
      }
    } catch (err) {
      console.error('Error fetching accuracy stats:', err)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
  }

  const handleReachBack = async (entryId: string) => {
    try {
      const { supabase } = await import("@/lib/supabase")

      const { error } = await supabase.rpc('update_triage_entry_status', {
        entry_id: entryId,
        new_status: 'reached-back',
        admin_notes: reachBackMessage || null
      })

      if (error) {
        console.error('Error updating triage entry:', error)
        setError('Failed to update entry')
        return
      }

      // Update local state
      setTriageEntries((prev) =>
        prev.map((entry) => (entry.id === entryId ? { ...entry, status: "reached-back" as const } : entry)),
      )
      setSelectedEntry(null)
      setReachBackMessage("")
      // Refresh accuracy stats after admin action
      await fetchAccuracyStats()
      // TODO: Here you would typically send an email to the user
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to update entry')
    }
  }

  const handleApprove = async (entryId: string) => {
    try {
      const { supabase } = await import("@/lib/supabase")

      const { error } = await supabase.rpc('update_triage_entry_status', {
        entry_id: entryId,
        new_status: 'approved',
        admin_notes: null
      })

      if (error) {
        console.error('Error updating triage entry:', error)
        setError('Failed to update entry')
        return
      }

      // Get the approved entry details
      const approvedEntry = triageEntries.find(entry => entry.id === entryId)

      if (approvedEntry) {
        // Create appointment entry for manually approved case
        const { error: appointmentError } = await supabase
          .from('appointments')
          .insert({
            first_name: approvedEntry.userName.split(' ')[0] || approvedEntry.userName,
            last_name: approvedEntry.userName.split(' ').slice(1).join(' ') || '',
            email: approvedEntry.userEmail,
            phone: approvedEntry.details?.phone || 'Not provided',
            purpose: approvedEntry.details?.purpose || 'Manually approved student session',
            type: 'student',
            status: 'pending', // CEO still needs to confirm
            meeting_mode: 'online',
            duration: 45,
            date: null, // Will be set when user books a slot
            time: null,
            slot_id: null,
            meeting_notes: `Manually approved by admin. Original AI decision: declined. AI reasoning: ${approvedEntry.aiReason}`,
            created_at: new Date().toISOString()
          })

        if (appointmentError) {
          console.error('Error creating appointment:', appointmentError)
          setError('Approved entry but failed to create appointment record')
        } else {
          console.log('✅ Created appointment for approved entry')
        }
      }

      // Update local state
      setTriageEntries((prev) =>
        prev.map((entry) => (entry.id === entryId ? { ...entry, status: "approved" as const } : entry)),
      )
      setSelectedEntry(null)
      // Refresh accuracy stats after admin action
      await fetchAccuracyStats()
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to update entry')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "refused":
        return "bg-red-100 text-red-800"
      case "reached-back":
        return "bg-blue-100 text-blue-800"
      case "approved":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "refused":
        return <AlertTriangle className="w-4 h-4" />
      case "reached-back":
        return <Mail className="w-4 h-4" />
      case "approved":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Shield className="w-4 h-4" />
    }
  }

  const refusedEntries = triageEntries.filter((entry) => entry.status === "refused")

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
          <p className="text-muted-foreground">Review people who were auto-refused by AI filter</p>
          {error && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-calm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{triageEntries.filter((e) => e.status === "refused").length}</p>
                <p className="text-sm text-muted-foreground">Auto-Refused</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-calm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{triageEntries.filter((e) => e.status === "reached-back").length}</p>
                <p className="text-sm text-muted-foreground">Reached Back</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-calm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{triageEntries.filter((e) => e.status === "approved").length}</p>
                <p className="text-sm text-muted-foreground">Manually Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-calm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  {accuracyStats ? `${accuracyStats.accuracy_percentage}%` : '--'}
                </p>
                <p className="text-sm text-muted-foreground">
                  AI Accuracy
                  {accuracyStats && (
                    <span className="block text-xs text-muted-foreground/80">
                      {accuracyStats.correct_decisions}/{accuracyStats.total_decisions} correct
                    </span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Triage Entries */}
      <div className="space-y-4">
        {refusedEntries.length === 0 ? (
          <Card className="card-calm">
            <CardContent className="p-8 text-center">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Refused Requests</h3>
              <p className="text-muted-foreground">All recent requests have been approved by AI</p>
            </CardContent>
          </Card>
        ) : (
          refusedEntries.map((entry) => (
            <Card key={entry.id} className="card-calm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {entry.userName}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(entry.status)}>
                      {getStatusIcon(entry.status)}
                      <span className="ml-1">{entry.status.replace("-", " ")}</span>
                    </Badge>
                    <Badge variant="outline">{entry.category === "business" ? "Business" : "Student"}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <span className="ml-2">{entry.userEmail}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Submitted:</span>
                    <span className="ml-2">{entry.submittedAt}</span>
                  </div>
                  {entry.details.company && (
                    <div>
                      <span className="text-muted-foreground">Company:</span>
                      <span className="ml-2">{entry.details.company}</span>
                    </div>
                  )}
                  {entry.details.school && (
                    <div>
                      <span className="text-muted-foreground">School:</span>
                      <span className="ml-2">{entry.details.school}</span>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Original Request:</h4>
                  <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-xl">{entry.details.purpose}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    AI Refusal Reason:
                  </h4>
                  <p className="text-sm text-muted-foreground bg-red-50 p-3 rounded-xl border border-red-200">
                    <strong>Category:</strong> {entry.reason}
                    <br />
                    <strong>Analysis:</strong> {entry.aiReason}
                  </p>
                </div>

                {entry.status === "refused" && (
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
