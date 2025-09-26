"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Lock, GraduationCap, MapPin, Video } from "lucide-react"

interface StudentCheckoutProps {
  sessionType: "online-free" | "online-paid" | "in-person"
  formData: any
  selectedSlot: any
  onSuccess: (meetingDetails: { meetingUrl?: string; venueAddress?: string }) => void
}

export function StudentCheckout({ sessionType, formData, selectedSlot, onSuccess }: StudentCheckoutProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [generatedDetails, setGeneratedDetails] = useState<{ meetingUrl?: string; venueAddress?: string }>({})
  const price = sessionType === "in-person" ? 75 : sessionType === "online-paid" ? 50 : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    await saveAppointment()

    setTimeout(() => {
      setIsProcessing(false)
      // Pass the meeting details back to parent
      onSuccess(generatedDetails)
    }, 2000)
  }

  const saveAppointment = async () => {
    const { supabase } = await import("@/lib/supabase")

    // Import meeting utils for generating meeting details
    const { generateZoomLink, generateVenueAddress } = await import("@/lib/meeting-utils")

    // Generate meeting details based on session type
    let meetingUrl = null
    let venueAddress = null
    let meetingNotes = ""

    if (sessionType === 'online-paid') {
      const zoomDetails = generateZoomLink()
      meetingUrl = zoomDetails.url
      meetingNotes = `Online student session via Zoom. Duration: 30 minutes. Student rate: $50.`
    } else if (sessionType === 'in-person') {
      venueAddress = generateVenueAddress()
      meetingNotes = `In-person student session. Duration: 60 minutes. Student rate: $75. Please bring your laptop.`
    }

    const appointmentData = {
      type: sessionType === 'in-person' ? 'in-person' as const : 'student' as const,
      session_type: sessionType === 'online-free' ? 'free' as const : 'paid' as const,
      name: formData.firstName, // Fixed: use firstName consistently
      email: formData.email,
      phone: formData.phone,
      company: null,
      date: selectedSlot.date,
      time: selectedSlot.time,
      slot_id: selectedSlot.id, // NEW: Use foreign key relationship
      status: 'confirmed' as const,
      purpose: formData.purpose,
      meeting_type: sessionType === 'in-person' ? 'in-person' as const : 'online' as const,
      meeting_url: meetingUrl,
      venue_address: venueAddress,
      meeting_notes: meetingNotes
    }

    const { error: appointmentError } = await supabase
      .from('appointments')
      .insert(appointmentData)

    if (appointmentError) {
      console.error('Error saving appointment:', appointmentError)
      return
    }

    // Note: Slot will be automatically marked as unavailable by database trigger
    // No need to manually update is_available field anymore

    // Store generated details for success screen
    setGeneratedDetails({
      meetingUrl: meetingUrl,
      venueAddress: venueAddress
    })
  }

  if (sessionType === "online-free") {
    // Free online session - just confirmation
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
              <span>Free Online Student Session</span>
              <span className="font-semibold text-green-600">FREE</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Duration</span>
              <span>45 minutes</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Format</span>
              <span>Zoom video call</span>
            </div>
            <Separator />
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Zoom link will be sent 30 minutes before session</p>
              <p>• Session recording available upon request</p>
              <p>• 2-hour cancellation policy</p>
            </div>
            <Button onClick={onSuccess} className="w-full btn-large btn-primary">
              Confirm Free Session
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Paid sessions (online-paid or in-person)
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Complete Your Booking</h2>
        <p className="text-muted-foreground">
          {sessionType === "in-person"
            ? "Secure payment for your in-person session"
            : "Secure payment for your online session"}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Session Summary */}
        <Card className="card-calm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Session Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>{sessionType === "in-person" ? "In-Person Student Session" : "Online Student Session"}</span>
              <span className="font-semibold">${price}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Duration</span>
              <span>{sessionType === "in-person" ? "60 minutes" : "30 minutes"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {sessionType === "in-person" ? (
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
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>${price}</span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              {sessionType === "in-person" ? (
                <>
                  <p>• Venue details sent after payment</p>
                  <p>• Bring laptop for hands-on guidance</p>
                  <p>• 24-hour cancellation policy</p>
                  <p>• Student discount applied</p>
                </>
              ) : (
                <>
                  <p>• Zoom link sent after payment</p>
                  <p>• Recording available upon request</p>
                  <p>• 24-hour cancellation policy</p>
                  <p>• Student discount applied</p>
                </>
              )}
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
                <span>Student-friendly secure payment</span>
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
