"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Lock, Calendar, GraduationCap, MapPin, Video } from "lucide-react"

interface CheckoutConfig {
  type: "business" | "student"
  sessionType: "online-free" | "online-paid" | "in-person" | "business-plan"
  plan?: "30min" | "60min" | "6month"
  selectedSlot?: any
  formData?: any
  onSuccess: (meetingDetails?: { meetingUrl?: string; venueAddress?: string }) => void
}

const planDetails = {
  "30min": { name: "30-Minute Session", price: 150 },
  "60min": { name: "60-Minute Deep Dive", price: 250 },
  "6month": { name: "6-Month Consultancy", price: 2500 },
}

const getSessionPrice = (config: CheckoutConfig): number => {
  if (config.type === "business" && config.plan) {
    return planDetails[config.plan].price
  }

  if (config.type === "student") {
    if (config.selectedSlot?.session_type === 'free') return 0
    return config.sessionType === "in-person" ? 75 : 50
  }

  return 0
}

const getSessionName = (config: CheckoutConfig): string => {
  if (config.type === "business" && config.plan) {
    return planDetails[config.plan].name
  }

  if (config.type === "student") {
    if (config.sessionType === "in-person") return "In-Person Student Session"
    if (config.sessionType === "online-paid") return "Online Student Session"
    return "Free Online Student Session"
  }

  return "Session"
}

const getDuration = (config: CheckoutConfig): string => {
  if (config.type === "business") return "30-60 minutes"
  if (config.sessionType === "in-person") return "60 minutes"
  return config.selectedSlot?.session_type === 'free' ? "45 minutes" : "30 minutes"
}

const getSessionFeatures = (config: CheckoutConfig): string[] => {
  const isSlotFree = config.selectedSlot?.session_type === 'free'
  const sessionLocation = config.sessionType === 'in-person' ? 'venue details' : 'Zoom link'
  const cancellationPolicy = config.type === 'student' && isSlotFree ? '2-hour' : '24-hour'

  return [
    `${sessionLocation} will be sent after ${isSlotFree ? 'confirmation' : 'payment'}`,
    config.type === 'student' && config.sessionType === 'in-person'
      ? 'Bring laptop for hands-on guidance'
      : 'Recording available upon request',
    `${cancellationPolicy} cancellation policy`,
    ...(config.type === 'student' && !isSlotFree ? ['Student discount applied'] : [])
  ]
}

export function UnifiedCheckout(config: CheckoutConfig) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [generatedDetails, setGeneratedDetails] = useState<{ meetingUrl?: string; venueAddress?: string }>({})
  const { toast } = useToast()

  const price = getSessionPrice(config)
  const sessionName = getSessionName(config)
  const duration = getDuration(config)
  const features = getSessionFeatures(config)
  const isSlotFree = config.selectedSlot?.session_type === 'free'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      // Only save appointment for student sessions
      if (config.type === "student") {
        await saveStudentAppointment()
      }

      setTimeout(() => {
        setIsProcessing(false)
        config.onSuccess(config.type === "student" ? generatedDetails : undefined)
      }, 2000)
    } catch (error) {
      setIsProcessing(false)
      console.error('Booking error:', error)
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive"
      })
    }
  }

  const saveStudentAppointment = async () => {
    const { supabase } = await import("@/lib/supabase")
    const { generateZoomLink, generateVenueAddress } = await import("@/lib/meeting-utils")

    // First, atomically check and reserve the slot
    const { data: slotCheck, error: slotError } = await supabase
      .rpc('book_slot_atomically', {
        p_slot_id: config.selectedSlot.id,
        p_date: config.selectedSlot.date,
        p_time: config.selectedSlot.time,
        p_slot_type: config.selectedSlot.slot_type,
        p_session_type: config.selectedSlot.session_type
      })

    if (slotError || !slotCheck) {
      console.error('Slot booking failed:', slotError)
      // Release the slot if there was an error
      await supabase.rpc('release_slot_booking', { p_slot_id: config.selectedSlot.id })
      throw new Error('This slot is no longer available. Please select another time.')
    }

    let meetingUrl = null
    let venueAddress = null
    let meetingNotes = ""

    if (config.sessionType === 'online-paid') {
      const zoomDetails = generateZoomLink()
      meetingUrl = zoomDetails.url
      meetingNotes = `Online student session via Zoom. Duration: 30 minutes. Student rate: $50.`
    } else if (config.sessionType === 'in-person') {
      venueAddress = generateVenueAddress()
      meetingNotes = `In-person student session. Duration: 60 minutes. Student rate: $75. Please bring your laptop.`
    }

    const appointmentData = {
      type: config.sessionType === 'in-person' ? 'in-person' as const : 'student' as const,
      session_type: config.selectedSlot.session_type === 'free' ? 'free' as const : 'paid' as const,
      name: config.formData.firstName,
      email: config.formData.email,
      phone: config.formData.phone,
      company: null,
      date: config.selectedSlot.date,
      time: config.selectedSlot.time,
      slot_id: config.selectedSlot.id,
      status: config.selectedSlot.session_type === 'free' ? 'pending' as const : 'confirmed' as const,
      purpose: config.formData.purpose,
      meeting_type: config.sessionType === 'in-person' ? 'in-person' as const : 'online' as const,
      meeting_url: meetingUrl,
      venue_address: venueAddress,
      meeting_notes: meetingNotes
    }

    // Now create the appointment since slot is reserved
    const { error: appointmentError } = await supabase
      .from('appointments')
      .insert(appointmentData)

    if (appointmentError) {
      console.error('Error saving appointment:', appointmentError)
      // Release the slot if appointment creation failed
      await supabase.rpc('release_slot_booking', { p_slot_id: config.selectedSlot.id })
      throw new Error('Failed to create appointment. Please try again.')
    }

    // Finalize the booking
    await supabase.rpc('finalize_slot_booking', { p_slot_id: config.selectedSlot.id })

    setGeneratedDetails({
      meetingUrl: meetingUrl,
      venueAddress: venueAddress
    })
  }

  // Free session confirmation
  if (isSlotFree) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Confirm Your Free Session</h2>
          <p className="text-muted-foreground">No payment required - just confirm your booking</p>
        </div>

        <Card className="card-calm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Session Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>{sessionName}</span>
              <span className="font-semibold text-green-600">FREE</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Duration</span>
              <span>{duration}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Format</span>
              <span>{config.sessionType === 'in-person' ? 'In-person meeting' : 'Zoom video call'}</span>
            </div>
            <Separator />
            <div className="text-sm text-muted-foreground space-y-1">
              {features.map((feature, index) => (
                <p key={index}>• {feature}</p>
              ))}
            </div>
            <Button onClick={handleSubmit} disabled={isProcessing} className="w-full btn-large btn-primary">
              {isProcessing ? 'Confirming...' : 'Confirm Free Session'}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Paid session checkout
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Complete Your Booking</h2>
        <p className="text-muted-foreground">
          {config.type === "business"
            ? "Secure payment powered by Stripe"
            : config.sessionType === "in-person"
              ? "Secure payment for your in-person session"
              : "Secure payment for your online session"
          }
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Order/Session Summary */}
        <Card className="card-calm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {config.type === "business" ? (
                <>
                  <Calendar className="w-5 h-5" />
                  Order Summary
                </>
              ) : (
                <>
                  <GraduationCap className="w-5 h-5" />
                  Session Summary
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>{sessionName}</span>
              <span className="font-semibold">${price}</span>
            </div>

            {config.type === "student" && (
              <>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Duration</span>
                  <span>{duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {config.sessionType === "in-person" ? (
                    <>
                      <MapPin className="w-4 h-4" />
                      <span>Downtown Office or Campus</span>
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4" />
                      <span>Zoom video call</span>
                    </>
                  )}
                </div>
              </>
            )}

            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>${price}</span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              {features.map((feature, index) => (
                <p key={index}>• {feature}</p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card className="card-calm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input id="cardNumber" placeholder="1234 5678 9012 3456" className="rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input id="expiry" placeholder="MM/YY" className="rounded-xl" />
                </div>
                <div>
                  <Label htmlFor="cvc">CVC</Label>
                  <Input id="cvc" placeholder="123" className="rounded-xl" />
                </div>
              </div>
              <div>
                <Label htmlFor="name">Cardholder Name</Label>
                <Input id="name" placeholder="John Doe" className="rounded-xl" />
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="w-4 h-4" />
                <span>
                  {config.type === "student"
                    ? "Student-friendly secure payment"
                    : "Your payment information is secure and encrypted"
                  }
                </span>
              </div>

              <Button type="submit" disabled={isProcessing} className="w-full btn-large btn-primary">
                {isProcessing ? "Processing..." : `Pay $${price}`}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}