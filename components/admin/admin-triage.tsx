"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Shield, User, Mail, MessageSquare, CheckCircle, AlertTriangle } from "lucide-react"

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

const mockTriageData: TriageEntry[] = [
  {
    id: "1",
    userName: "John Smith",
    userEmail: "john@spamcompany.com",
    category: "business",
    reason: "Potential spam/promotional content detected",
    aiReason:
      "Request contains multiple promotional keywords and generic business language typically associated with spam",
    submittedAt: "2024-01-15 10:30 AM",
    status: "refused",
    details: {
      company: "Generic Marketing Co",
      purpose:
        "We want to discuss amazing opportunities for your business growth and marketing solutions that will revolutionize your success!",
    },
  },
  {
    id: "2",
    userName: "Lisa Wang",
    userEmail: "lisa.wang@university.edu",
    category: "student",
    reason: "Insufficient information provided",
    aiReason: "Request lacks specific learning goals and appears too vague for a productive consultation",
    submittedAt: "2024-01-15 11:45 AM",
    status: "refused",
    details: {
      school: "State University",
      purpose: "I want to learn about AI stuff and maybe get some help with things.",
    },
  },
  {
    id: "3",
    userName: "Michael Brown",
    userEmail: "m.brown@techstartup.io",
    category: "business",
    reason: "Request outside expertise area",
    aiReason: "Request focuses on hardware engineering which is outside the consultant's AI/software expertise",
    submittedAt: "2024-01-15 02:15 PM",
    status: "reached-back",
    details: {
      company: "TechStartup Inc",
      purpose: "Need help with circuit board design and hardware optimization for our IoT devices.",
    },
  },
]

export function AdminTriage() {
  const [triageEntries, setTriageEntries] = useState<TriageEntry[]>(mockTriageData)
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null)
  const [reachBackMessage, setReachBackMessage] = useState("")

  const handleReachBack = (entryId: string) => {
    setTriageEntries((prev) =>
      prev.map((entry) => (entry.id === entryId ? { ...entry, status: "reached-back" as const } : entry)),
    )
    setSelectedEntry(null)
    setReachBackMessage("")
    // Here you would typically send an email to the user
  }

  const handleApprove = (entryId: string) => {
    setTriageEntries((prev) =>
      prev.map((entry) => (entry.id === entryId ? { ...entry, status: "approved" as const } : entry)),
    )
    setSelectedEntry(null)
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-font text-3xl font-bold text-foreground mb-2">AI Triage Log</h1>
        <p className="text-muted-foreground">Review people who were auto-refused by AI filter</p>
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
                <p className="text-2xl font-bold">87%</p>
                <p className="text-sm text-muted-foreground">AI Accuracy</p>
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
