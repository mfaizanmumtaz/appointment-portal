"use client"

import { useState, useEffect } from "react"
import { ExternalLink, MapPin } from "lucide-react"

interface MeetingDetailsProps {
  appointmentEmail: string
  appointmentDate: string
  appointmentTime: string
  meetingMode: "online" | "in-person" | null
}

interface AppointmentDetails {
  meeting_url?: string | null
  venue_address?: string | null
  meeting_notes?: string | null
}

export function MeetingDetails({ appointmentEmail, appointmentDate, appointmentTime, meetingMode }: MeetingDetailsProps) {
  const [details, setDetails] = useState<AppointmentDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMeetingDetails()
  }, [appointmentEmail, appointmentDate, appointmentTime])

  const fetchMeetingDetails = async () => {
    try {
      const { supabase } = await import("@/lib/supabase")

      const { data, error } = await supabase
        .from('appointments')
        .select('meeting_url, venue_address, meeting_notes')
        .eq('email', appointmentEmail)
        .eq('date', appointmentDate)
        .eq('time', appointmentTime)
        .eq('status', 'confirmed')
        .single()

      if (error) {
        console.error('Error fetching meeting details:', error)
        setDetails(null)
      } else {
        setDetails(data)
      }
    } catch (error) {
      console.error('Error:', error)
      setDetails(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">
        <strong>Meeting Details:</strong> Loading...
      </div>
    )
  }

  if (!details) {
    return (
      <div className="text-sm text-muted-foreground">
        <strong>Meeting Details:</strong> Will be provided after approval
      </div>
    )
  }

  return (
    <>
      {meetingMode === "online" && details.meeting_url && (
        <div className="break-all">
          <strong>Zoom Link:</strong>{" "}
          <a
            href={details.meeting_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            Join Meeting
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
      {meetingMode === "online" && !details.meeting_url && (
        <div className="text-sm text-muted-foreground">
          <strong>Zoom Link:</strong> Will be provided closer to meeting time
        </div>
      )}
      {meetingMode === "in-person" && details.venue_address && (
        <div>
          <strong>Venue:</strong> {details.venue_address}
        </div>
      )}
      {meetingMode === "in-person" && !details.venue_address && (
        <div className="text-sm text-muted-foreground">
          <strong>Venue:</strong> Address will be provided after confirmation
        </div>
      )}
    </>
  )
}