"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Footer } from "@/components/ui/footer"
import { GraduationCap, CheckCircle, XCircle, ArrowLeft, Calendar, Clock, MapPin, Home } from "lucide-react"
import { StudentCalendar } from "@/components/student/student-calendar"
import { StudentCheckout } from "@/components/student/student-checkout"
import Link from "next/link"

type Step = "form" | "options" | "calendar" | "checkout" | "triage" | "success" | "declined"
type TriageResult = "approved" | "declined" | "uncertain"
type SessionType = "online-free" | "online-paid" | "in-person"

interface StudentFormData {
  firstName: string
  email: string
  phone: string
  purpose: string
}

export default function StudentPage() {
  const [step, setStep] = useState<Step>("form")
  const [formData, setFormData] = useState<StudentFormData>({
    firstName: "",
    email: "",
    phone: "",
    purpose: "",
  })
  const [sessionType, setSessionType] = useState<SessionType | null>(null)
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<any>(null)

  const goBack = () => {
    if (step === "options") setStep("form")
    else if (step === "calendar") setStep("options")
    else if (step === "checkout") setStep("calendar")
    else if (step === "triage") setStep("options")
    else if (step === "declined") setStep("options")
    else if (step === "success") setStep("form") // For testing
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep("options")
  }

  const handleOptionSelect = (type: SessionType) => {
    setSessionType(type)
    if (type === "online-free") {
      setStep("triage")
      setTimeout(() => {
        const results: TriageResult[] = ["approved", "declined", "uncertain"]
        const randomResult = results[Math.floor(Math.random() * results.length)]
        setTriageResult(randomResult)
        if (randomResult === "declined") {
          setStep("declined")
        } else if (randomResult === "approved") {
          setStep("calendar")
        }
      }, 2000)
    } else {
      setStep("calendar")
    }
  }

  const mockTriageApproval = () => {
    setTriageResult("approved")
    setStep("calendar")
  }

  const handleSlotSelect = async (slot: any) => {
    setSelectedSlot(slot)
    if (sessionType === "online-free") {
      await saveAppointment(slot)
      setStep("success")
    } else {
      setStep("checkout")
    }
  }

  const saveAppointment = async (slot: any) => {
    const { supabase } = await import("@/lib/supabase")

    const appointmentData = {
      type: sessionType === 'in-person' ? 'in-person' as const : 'student' as const,
      session_type: sessionType === 'online-free' ? 'free' as const : 'paid' as const,
      name: formData.firstName,
      email: formData.email,
      phone: formData.phone,
      company: null,
      date: slot.date,
      time: slot.time,
      status: 'pending' as const
    }

    const { error: appointmentError } = await supabase
      .from('appointments')
      .insert(appointmentData)

    if (appointmentError) {
      console.error('Error saving appointment:', appointmentError)
      return
    }

    const { error: slotError } = await supabase
      .from('time_slots')
      .update({ is_available: false })
      .eq('id', slot.id)

    if (slotError) {
      console.error('Error updating slot availability:', slotError)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Button asChild variant="outline" className="flex items-center gap-2 bg-transparent">
                <Link href="/">
                  <Home className="w-4 h-4" />
                  Back to Home
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="flex items-center gap-2 bg-transparent border-orange-200 text-orange-700 hover:bg-orange-50"
              >
                <Link href="/admin">
                  <div className="w-4 h-4 bg-orange-500 rounded-sm flex items-center justify-center">
                    <span className="text-white text-xs font-bold">A</span>
                  </div>
                  Admin Panel
                </Link>
              </Button>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="heading-font text-3xl font-bold text-foreground mb-4">Book a Student Appointment</h1>
            <p className="text-lg text-muted-foreground">
              Get personalized guidance on freelancing, AI, career direction, and more
            </p>
          </div>

          {/* Back Button */}
          {step !== "form" && (
            <Button onClick={goBack} variant="ghost" className="mb-6 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          )}

          {/* Step 1: Contact and Purpose */}
          {step === "form" && (
            <Card className="card-calm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Contact and Purpose
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number (with country code)</Label>
                    <Input
                      id="phone"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="purpose">Purpose / Description</Label>
                    <Textarea
                      id="purpose"
                      rows={4}
                      placeholder="Tell me briefly what you'd like guidance on (freelancing, AI, career direction, etc.)"
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <Button type="submit" className="btn-large btn-primary w-full">
                    Continue to Meeting Type
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Meeting Type */}
          {step === "options" && (
            <Card className="card-calm">
              <CardHeader>
                <CardTitle>Choose Meeting Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  onClick={() => handleOptionSelect("online-free")}
                  className="p-6 border-2 border-green-200 rounded-xl cursor-pointer hover:border-green-400 transition-colors bg-green-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-green-800">Online (Free)</h3>
                      <p className="text-green-600">Subject to AI approval before showing slots</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => handleOptionSelect("online-paid")}
                  className="p-6 border-2 border-blue-200 rounded-xl cursor-pointer hover:border-blue-400 transition-colors bg-blue-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-blue-800">Online (Paid)</h3>
                      <p className="text-blue-600">Direct paid booking, no AI triage</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => handleOptionSelect("in-person")}
                  className="p-6 border-2 border-purple-200 rounded-xl cursor-pointer hover:border-purple-400 transition-colors bg-purple-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-purple-800">In Person (Paid)</h3>
                      <p className="text-purple-600">Direct paid booking, no AI triage</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Triage Loading/Result */}
          {step === "triage" && (
            <Card className="card-calm text-center">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <GraduationCap className="w-8 h-8 text-primary animate-pulse" />
                  </div>
                  <h3 className="text-xl font-semibold">AI is reviewing your request...</h3>
                  <p className="text-muted-foreground">Evaluating your guidance needs and session fit</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Declined Screen */}
          {step === "declined" && (
            <Card className="card-calm text-center">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                  <h3 className="text-xl font-semibold text-red-700">Request not approved</h3>
                  <p className="text-muted-foreground">
                    Thank you for your interest. Due to limited availability, this meeting cannot be scheduled. You can
                    still get guidance anytime through irfanGPT or explore my company via XevenGPT.
                  </p>
                  <div className="flex gap-3 justify-center flex-wrap">
                    <Button asChild variant="outline">
                      <a href="https://irfangpt.com" target="_blank" rel="noopener noreferrer">
                        Explore irfanGPT
                      </a>
                    </Button>
                    <Button asChild variant="outline">
                      <a href="https://xevengpt.com" target="_blank" rel="noopener noreferrer">
                        Explore XevenGPT
                      </a>
                    </Button>
                    <Button asChild>
                      <a href="/">Go to Home</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Calendar Selection */}
          {step === "calendar" && <StudentCalendar sessionType={sessionType!} onBookingSelect={handleSlotSelect} />}

          {/* Checkout */}
          {step === "checkout" && sessionType && (
            <StudentCheckout
              sessionType={sessionType}
              formData={formData}
              selectedSlot={selectedSlot}
              onSuccess={() => setStep("success")}
            />
          )}

          {/* Success Screens */}
          {step === "success" && (
            <Card className="card-calm text-center">
              <CardContent className="p-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />

                {sessionType === "online-free" ? (
                  // Free Online Success
                  <div className="space-y-4">
                    <h3 className="text-2xl font-semibold">Request received</h3>
                    <p className="text-muted-foreground">
                      Your request has been sent to Irfan Malik. You will receive a confirmation email with the meeting
                      details if approved.
                    </p>
                    <div className="flex gap-3 justify-center flex-wrap">
                      <Button asChild>
                        <a href="/">Go to Home</a>
                      </Button>
                      <Button asChild variant="outline">
                        <a href="https://irfangpt.com" target="_blank" rel="noopener noreferrer">
                          Explore irfanGPT
                        </a>
                      </Button>
                      <Button asChild variant="outline">
                        <a href="https://xevengpt.com" target="_blank" rel="noopener noreferrer">
                          Explore XevenGPT
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : sessionType === "online-paid" ? (
                  // Online Paid Success
                  <div className="space-y-6">
                    <h3 className="text-2xl font-semibold">Booking confirmed</h3>

                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">March 15, 2024 at 2:00 PM</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-blue-600" />
                          <span>Online Session (Video Call)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span>30 minutes - $50</span>
                        </div>
                        <div className="mt-3 p-2 bg-blue-100 rounded">
                          <span className="text-sm font-medium text-blue-800">Zoom Link: </span>
                          <span className="text-sm text-blue-600">https://zoom.us/j/123456789</span>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex gap-2 justify-center flex-wrap">
                      <Button variant="outline" size="sm">
                        Add to Google
                      </Button>
                      <Button variant="outline" size="sm">
                        Add to Outlook
                      </Button>
                      <Button variant="outline" size="sm">
                        Download ICS
                      </Button>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      You will also receive these details by email along with reminders.
                    </p>

                    <Button onClick={goBack} className="btn-large btn-primary">
                      Book Another Session (Testing)
                    </Button>
                  </div>
                ) : (
                  // Paid In Person Success
                  <div className="space-y-6">
                    <h3 className="text-2xl font-semibold">Booking confirmed</h3>

                    <Card className="bg-purple-50 border-purple-200">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-purple-600" />
                          <span className="font-medium">March 15, 2024 at 2:00 PM</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-purple-600" />
                          <span>123 Business Center, Downtown</span>
                          <a href="#" className="text-purple-600 underline ml-2">
                            View Map
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-600" />
                          <span>30 minutes - $50</span>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex gap-2 justify-center flex-wrap">
                      <Button variant="outline" size="sm">
                        Add to Google
                      </Button>
                      <Button variant="outline" size="sm">
                        Add to Outlook
                      </Button>
                      <Button variant="outline" size="sm">
                        Download ICS
                      </Button>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      You will also receive these details by email along with reminders.
                    </p>

                    <Button onClick={goBack} className="btn-large btn-primary">
                      Book Another Session (Testing)
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
