"use client"

import { UnifiedCheckout } from "@/components/shared/unified-checkout"

interface StudentCheckoutProps {
  sessionType: "online-free" | "online-paid" | "in-person"
  formData: any
  selectedSlot: any
  onSuccess: (meetingDetails: { meetingUrl?: string; venueAddress?: string }) => void
}

export function StudentCheckout({ sessionType, formData, selectedSlot, onSuccess }: StudentCheckoutProps) {
  return (
    <UnifiedCheckout
      type="student"
      sessionType={sessionType}
      formData={formData}
      selectedSlot={selectedSlot}
      onSuccess={onSuccess}
    />
  )
}
