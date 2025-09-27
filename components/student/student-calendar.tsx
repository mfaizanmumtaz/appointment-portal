"use client"

import { UnifiedCalendar } from "@/components/shared/unified-calendar"

interface StudentCalendarProps {
  sessionType: "online-free" | "online-paid" | "in-person"
  onBookingSelect: (slot: any) => void
}

export function StudentCalendar({ sessionType, onBookingSelect }: StudentCalendarProps) {
  return (
    <UnifiedCalendar
      calendarType="student"
      sessionType={sessionType}
      onBookingSelect={onBookingSelect}
    />
  )
}
