"use client"

import { UnifiedCalendar } from "@/components/shared/unified-calendar"

interface StudentCalendarProps {
  sessionType: "online-free" | "online-paid" | "in-person"
  onBookingSelect: (slot: any) => void
  isDeclined?: boolean
}

export function StudentCalendar({ sessionType, onBookingSelect, isDeclined = false }: StudentCalendarProps) {
  return (
    <UnifiedCalendar
      calendarType="student"
      sessionType={sessionType}
      onBookingSelect={onBookingSelect}
      isDeclined={isDeclined}
    />
  )
}
