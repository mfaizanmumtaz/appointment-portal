"use client"

import { UnifiedCalendar } from "@/components/shared/unified-calendar"

interface BusinessCalendarProps {
  onPlanSelect: (plan: "30min" | "60min" | "6month") => void
  isPaid: boolean
}

export function BusinessCalendar({ onPlanSelect, isPaid }: BusinessCalendarProps) {
  return (
    <UnifiedCalendar
      calendarType="business"
      isPaid={isPaid}
      onPlanSelect={onPlanSelect}
    />
  )
}
