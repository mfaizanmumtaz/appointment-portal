"use client"

import { UnifiedCheckout } from "@/components/shared/unified-checkout"

interface BusinessCheckoutProps {
  plan: "30min" | "60min" | "6month"
  selectedSlot?: any
  onSuccess: () => void
}

export function BusinessCheckout({ plan, selectedSlot, onSuccess }: BusinessCheckoutProps) {
  return (
    <UnifiedCheckout
      type="business"
      sessionType="business-plan"
      plan={plan}
      selectedSlot={selectedSlot}
      onSuccess={onSuccess}
    />
  )
}
