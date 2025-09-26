"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Footer } from "@/components/ui/footer"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  MapPin,
  Video,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Home,
} from "lucide-react"
import Link from "next/link"
import { MeetingDetails } from "@/components/ui/meeting-details"
import { generateZoomLink, generateVenueAddress, sendMeetingEmail } from "@/lib/meeting-utils"

type Step = "contact" | "meeting-type" | "calendar" | "payment" | "confirmation"
type MeetingMode = "online" | "in-person"
type Duration = 15 | 30 | 60
type SlotType = "paid" | "free"
type SlotState = "available" | "booked" | "pending"

interface BookingData {
  firstName: string
  email: string
  phone: string
  purpose: string
  meetingMode: MeetingMode | null
  duration: Duration | null
  selectedSlot: TimeSlot | null
}

interface TimeSlot {
  id: string
  date: string
  time: string
  type: SlotType
  state: SlotState
  price?: number
}


export default function BusinessPage() {
  const [step, setStep] = useState<Step>("contact")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [stats, setStats] = useState({
    totalBookingsThisWeek: 0,
    upcomingMeetings: 0,
    slotsAvailableToday: 0,
    slotsThisMonth: 0,
  })
  const [bookingData, setBookingData] = useState<BookingData>({
    firstName: "",
    email: "",
    phone: "",
    purpose: "",
    meetingMode: null,
    duration: null,
    selectedSlot: null,
  })

  // Store generated meeting details to show to user
  const [generatedMeetingDetails, setGeneratedMeetingDetails] = useState<{
    meetingUrl?: string
    venueAddress?: string
  }>({})

  useEffect(() => {
    fetchStats()

    // Refresh stats every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchStats()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (step === "calendar") {
      fetchAvailableSlots()
    }
  }, [step, selectedDate])

  const fetchStats = async () => {
    try {
      const { supabase } = await import("@/lib/supabase")

      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]

      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)

      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)

      // Get business bookings for this week
      const { data: weekBookings } = await supabase
        .from('appointments')
        .select('*')
        .eq('type', 'business')
        .gte('date', weekStart.toISOString().split('T')[0])
        .lte('date', weekEnd.toISOString().split('T')[0])

      // Get upcoming business meetings from today onwards
      const { data: upcomingAppts } = await supabase
        .from('appointments')
        .select('*')
        .eq('type', 'business')
        .gte('date', todayStr)
        .order('date', { ascending: true })

      // Get available slots for today
      const { data: todaySlots } = await supabase
        .from('time_slots')
        .select('*')
        .eq('date', todayStr)
        .eq('is_available', true)
        .in('slot_type', ['business', 'both'])

      // Get available slots for this month
      const { data: monthSlots } = await supabase
        .from('time_slots')
        .select('*')
        .gte('date', monthStart.toISOString().split('T')[0])
        .lte('date', monthEnd.toISOString().split('T')[0])
        .eq('is_available', true)
        .in('slot_type', ['business', 'both'])

      setStats({
        totalBookingsThisWeek: weekBookings?.length || 0,
        upcomingMeetings: upcomingAppts?.length || 0,
        slotsAvailableToday: todaySlots?.length || 0,
        slotsThisMonth: monthSlots?.length || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchAvailableSlots = async () => {
    setLoading(true)
    try {
      const { supabase } = await import("@/lib/supabase")

      const startDate = new Date(selectedDate)
      startDate.setDate(1)
      const endDate = new Date(selectedDate)
      endDate.setMonth(endDate.getMonth() + 1)
      endDate.setDate(0)

      const { data: slots, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('is_available', true)
        .in('slot_type', ['business', 'both'])
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true })
        .order('time', { ascending: true })

      if (error) {
        console.error('Error fetching slots:', error)
        setAvailableSlots([])
        return
      }

      const formattedSlots: TimeSlot[] = (slots || []).map(slot => ({
        id: slot.id,
        date: slot.date,
        time: slot.time,
        type: 'paid',
        state: 'available' as const,
        price: 150
      }))

      setAvailableSlots(formattedSlots)
    } catch (error) {
      console.error('Error:', error)
      setAvailableSlots([])
    } finally {
      setLoading(false)
    }
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep("meeting-type")
  }

  const handleMeetingTypeSubmit = () => {
    if (bookingData.meetingMode && bookingData.duration) {
      setStep("calendar")
    }
  }

  const handleSlotSelect = async (slot: TimeSlot) => {
    setBookingData({ ...bookingData, selectedSlot: slot })
    if (slot.type === "paid") {
      setStep("payment")
    } else {
      await saveAppointment(slot)
      setStep("confirmation")
    }
  }

  const saveAppointment = async (slot: TimeSlot) => {
    const { supabase } = await import("@/lib/supabase")

    // Auto-generate meeting details based on type
    let meetingUrl = null
    let venueAddress = null

    if (bookingData.meetingMode === 'online') {
      const zoomDetails = generateZoomLink()
      meetingUrl = zoomDetails.url
    } else if (bookingData.meetingMode === 'in-person') {
      venueAddress = generateVenueAddress()
    }

    // Store for display on confirmation page
    setGeneratedMeetingDetails({
      meetingUrl: meetingUrl || undefined,
      venueAddress: venueAddress || undefined
    })

    const appointmentData = {
      type: 'business' as const,
      session_type: slot.type === 'paid' ? 'paid' as const : 'free' as const,
      name: bookingData.firstName,
      email: bookingData.email,
      phone: bookingData.phone,
      company: null,
      date: slot.date,
      time: slot.time,
      slot_id: slot.id, // NEW: Use foreign key relationship
      status: 'confirmed' as const, // Auto-confirm all bookings if slot was made available
      meeting_type: bookingData.meetingMode,
      meeting_url: meetingUrl,
      venue_address: venueAddress,
      meeting_notes: `Auto-generated meeting details for ${bookingData.meetingMode} session`,
      purpose: bookingData.purpose
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

    // Send instant email with meeting details
    const ENABLE_EMAIL_SENDING = false // TODO: Set to true when Edge Function is fixed

    if (ENABLE_EMAIL_SENDING) {
      try {
        await sendMeetingEmail({
          to: bookingData.email,
          name: bookingData.firstName,
          date: slot.date,
          time: slot.time,
          meetingType: bookingData.meetingMode!,
          meetingUrl: meetingUrl || undefined,
          venueAddress: venueAddress || undefined,
          duration: bookingData.duration || undefined
        })

        console.log('📧 Meeting confirmation email sent successfully')
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError)
        // Don't fail the booking if email fails
      }
    } else {
      console.log('📧 Email sending disabled - appointment created successfully without email')
    }
  }

  const getAvailableSlots = () => {
    return availableSlots.filter(
      (slot) =>
        slot.state === "available" &&
        (bookingData.duration === 15 || bookingData.duration === 30 || bookingData.duration === 60),
    )
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const navigateToToday = () => {
    setSelectedDate(new Date())
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <main className="flex-1 py-6 sm:py-12">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
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
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 sm:mb-4">Book a Business Consultation</h1>
            <p className="text-base sm:text-lg text-slate-600 px-2">
              Get expert guidance on AI implementation and business strategy
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center mb-6 sm:mb-8 overflow-x-auto">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-max px-4">
              {[
                { key: "contact", label: "Contact", icon: "1" },
                { key: "meeting-type", label: "Meeting", icon: "2" },
                { key: "calendar", label: "Schedule", icon: "3" },
                { key: "payment", label: "Payment", icon: "4" },
                { key: "confirmation", label: "Done", icon: "5" },
              ].map((item, index) => (
                <div key={item.key} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                        step === item.key
                          ? "bg-blue-600 text-white"
                          : index < ["contact", "meeting-type", "calendar", "payment", "confirmation"].indexOf(step)
                            ? "bg-green-500 text-white"
                            : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {index < ["contact", "meeting-type", "calendar", "payment", "confirmation"].indexOf(step)
                        ? "✓"
                        : item.icon}
                    </div>
                    <span className="text-xs text-slate-600 mt-1 hidden sm:block">{item.label}</span>
                  </div>
                  {index < 4 && <div className="w-4 sm:w-8 h-0.5 bg-slate-200 mx-1 sm:mx-2" />}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Contact and Purpose */}
          {step === "contact" && (
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-slate-900 text-lg sm:text-xl">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-xs sm:text-sm">1</span>
                  </div>
                  Contact and Purpose
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <form onSubmit={handleContactSubmit} className="space-y-4 sm:space-y-6">
                  <div>
                    <Label htmlFor="firstName" className="text-slate-700 font-medium text-sm sm:text-base">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      value={bookingData.firstName}
                      onChange={(e) => setBookingData({ ...bookingData, firstName: e.target.value })}
                      className="mt-1 h-10 sm:h-11 border-slate-300"
                      placeholder="Enter your first name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-slate-700 font-medium text-sm sm:text-base">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={bookingData.email}
                      onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                      className="mt-1 h-10 sm:h-11 border-slate-300"
                      placeholder="your.email@company.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-slate-700 font-medium text-sm sm:text-base">
                      Phone Number with Country Code
                    </Label>
                    <Input
                      id="phone"
                      value={bookingData.phone}
                      onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                      className="mt-1 h-10 sm:h-11 border-slate-300"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="purpose" className="text-slate-700 font-medium text-sm sm:text-base">
                      Purpose or Description
                    </Label>
                    <Textarea
                      id="purpose"
                      rows={4}
                      value={bookingData.purpose}
                      onChange={(e) => setBookingData({ ...bookingData, purpose: e.target.value })}
                      className="mt-1 text-sm sm:text-base border-slate-300"
                      placeholder="Tell me what you want to discuss in 3 to 5 sentences"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 h-11 sm:h-12 text-sm sm:text-base"
                  >
                    Continue
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Meeting Type and Duration */}
          {step === "meeting-type" && (
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-slate-900 text-lg sm:text-xl">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-xs sm:text-sm">2</span>
                  </div>
                  Meeting Type and Duration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 pt-0">
                <div>
                  <Label className="text-slate-700 font-medium mb-3 block text-sm sm:text-base">Meeting Mode</Label>
                  <RadioGroup
                    value={bookingData.meetingMode || ""}
                    onValueChange={(value) => setBookingData({ ...bookingData, meetingMode: value as MeetingMode })}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 p-3 sm:p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                      <RadioGroupItem value="online" id="online" />
                      <Label htmlFor="online" className="flex items-center gap-2 cursor-pointer text-sm sm:text-base">
                        <Video className="w-4 h-4 text-blue-600" />
                        Online (Video Call)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 sm:p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                      <RadioGroupItem value="in-person" id="in-person" />
                      <Label
                        htmlFor="in-person"
                        className="flex items-center gap-2 cursor-pointer text-sm sm:text-base"
                      >
                        <MapPin className="w-4 h-4 text-green-600" />
                        In Person
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-slate-700 font-medium mb-3 block text-sm sm:text-base">Duration</Label>
                  <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3">
                    {[15, 30, 60].map((duration) => (
                      <Button
                        key={duration}
                        type="button"
                        variant={bookingData.duration === duration ? "default" : "outline"}
                        onClick={() => setBookingData({ ...bookingData, duration: duration as Duration })}
                        className="flex items-center justify-center gap-2 py-3 h-11 sm:h-auto text-sm sm:text-base"
                      >
                        <Clock className="w-4 h-4" />
                        {duration} min
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep("contact")}
                    className="sm:w-auto h-11 sm:h-12 text-sm sm:text-base"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                  <Button
                    onClick={handleMeetingTypeSubmit}
                    disabled={!bookingData.meetingMode || !bookingData.duration}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 h-11 sm:h-12 text-sm sm:text-base"
                  >
                    View Available Times
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Calendar */}
          {step === "calendar" && (
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-slate-900 text-lg sm:text-xl">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-xs sm:text-sm">3</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span>Available Times</span>
                    <span className="text-sm sm:text-base text-slate-600">
                      {bookingData.meetingMode === "online" ? "Online" : "In Person"} ({bookingData.duration} min)
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Calendar Navigation Controls */}
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center justify-between mb-4 p-3 bg-slate-50 rounded-lg">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth("prev")}
                      className="flex items-center gap-1 h-8 sm:h-9"
                    >
                      <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Prev</span>
                    </Button>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-600" />
                      <span className="font-semibold text-slate-900 text-sm sm:text-base">
                        {formatMonthYear(selectedDate)}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth("next")}
                      className="flex items-center gap-1 h-8 sm:h-9"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      variant="link"
                      onClick={navigateToToday}
                      className="text-blue-600 text-xs sm:text-sm h-auto p-0"
                    >
                      Go to Today
                    </Button>
                  </div>
                </div>

                {/* Counters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                  <div className="bg-slate-50 p-2 sm:p-3 rounded-lg text-center">
                    <div className="text-lg sm:text-2xl font-bold text-slate-900">{stats.totalBookingsThisWeek || 0}</div>
                    <div className="text-xs sm:text-sm text-slate-600">Total bookings this week</div>
                  </div>
                  <div className="bg-slate-50 p-2 sm:p-3 rounded-lg text-center">
                    <div className="text-lg sm:text-2xl font-bold text-slate-900">{stats.upcomingMeetings || 0}</div>
                    <div className="text-xs sm:text-sm text-slate-600">Upcoming meetings</div>
                  </div>
                  <div className="bg-blue-50 p-2 sm:p-3 rounded-lg text-center">
                    <div className="text-lg sm:text-2xl font-bold text-blue-600">{stats.slotsAvailableToday || 0}</div>
                    <div className="text-xs sm:text-sm text-slate-600">Slots available today</div>
                  </div>
                  <div className="bg-green-50 p-2 sm:p-3 rounded-lg text-center">
                    <div className="text-lg sm:text-2xl font-bold text-green-600">{stats.slotsThisMonth || 0}</div>
                    <div className="text-xs sm:text-sm text-slate-600">Slots this month</div>
                  </div>
                </div>

                {/* Color Legend */}
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded"></div>
                    <span className="text-xs sm:text-sm text-slate-600">Paid Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded"></div>
                    <span className="text-xs sm:text-sm text-slate-600">Free Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-slate-400 rounded"></div>
                    <span className="text-xs sm:text-sm text-slate-600">Booked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-amber-500 rounded"></div>
                    <span className="text-xs sm:text-sm text-slate-600">Pending</span>
                  </div>
                </div>

                {/* Time Zone */}
                <div className="mb-4 sm:mb-6 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs sm:text-sm text-slate-700 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                      Times shown in: <strong className="ml-1">Eastern Time (EST)</strong>
                    </span>
                    <Button
                      variant="link"
                      className="text-blue-600 p-0 sm:ml-2 h-auto text-xs sm:text-sm self-start sm:self-auto"
                    >
                      Change
                    </Button>
                  </p>
                </div>

                {/* Back Button */}
                <div className="mb-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep("meeting-type")}
                    className="flex items-center gap-1 h-10 sm:h-11 text-sm sm:text-base"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Meeting Type
                  </Button>
                </div>

                {/* Available Slots */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900 text-base sm:text-lg">Available Time Slots</h3>
                  {loading ? (
                    <div className="text-center py-8 text-slate-600">Loading slots...</div>
                  ) : getAvailableSlots().length === 0 ? (
                    <div className="text-center py-8 text-slate-600">No available slots found for this month</div>
                  ) : (
                  <div className="grid gap-2 sm:gap-3">
                    {getAvailableSlots().map((slot) => (
                      <Button
                        key={slot.id}
                        variant="outline"
                        onClick={() => handleSlotSelect(slot)}
                        disabled={slot.state !== "available"}
                        className={`p-3 sm:p-4 h-auto justify-between text-left ${
                          slot.type === "paid"
                            ? "border-blue-200 hover:bg-blue-50"
                            : "border-green-200 hover:bg-green-50"
                        } ${slot.state !== "available" ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <div
                            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${slot.type === "paid" ? "bg-blue-500" : "bg-green-500"}`}
                          ></div>
                          <div className="text-left min-w-0 flex-1">
                            <div className="font-medium text-xs sm:text-sm truncate">
                              {new Date(slot.date).toLocaleDateString()} at {slot.time}
                            </div>
                            <div className="text-xs text-slate-600">
                              {bookingData.meetingMode === "online" ? "Online" : "In Person"} • {bookingData.duration}{" "}
                              min
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {slot.type === "paid" ? (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                              ${slot.price}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                              Free
                            </Badge>
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Payment (for paid slots) */}
          {step === "payment" && bookingData.selectedSlot?.type === "paid" && (
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-slate-900 text-lg sm:text-xl">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                  </div>
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 pt-0">
                <div className="bg-slate-50 p-3 sm:p-4 rounded-lg space-y-2 sm:space-y-3">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-slate-600">Name:</span>
                    <span className="font-medium truncate ml-2">{bookingData.firstName}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-slate-600">Email:</span>
                    <span className="font-medium truncate ml-2">{bookingData.email}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-slate-600">Phone:</span>
                    <span className="font-medium truncate ml-2">{bookingData.phone}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-slate-600">Date & Time:</span>
                    <span className="font-medium text-right ml-2">
                      {new Date(bookingData.selectedSlot.date).toLocaleDateString()} at {bookingData.selectedSlot.time}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-slate-600">Mode:</span>
                    <span className="font-medium capitalize">{bookingData.meetingMode}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-slate-600">Duration:</span>
                    <span className="font-medium">{bookingData.duration} minutes</span>
                  </div>
                  <hr className="border-slate-200" />
                  <div className="flex justify-between text-base sm:text-lg font-semibold">
                    <span>Total:</span>
                    <span>${bookingData.selectedSlot.price}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep("calendar")}
                    className="sm:w-auto h-11 sm:h-auto text-sm sm:text-base"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                  <Button
                    onClick={async () => {
                      if (bookingData.selectedSlot) {
                        try {
                          setIsProcessing(true)
                          await saveAppointment(bookingData.selectedSlot)
                          setStep("confirmation")
                        } catch (error) {
                          console.error('Failed to save appointment:', error)
                          alert('Failed to save appointment. Please try again.')
                        } finally {
                          setIsProcessing(false)
                        }
                      }
                    }}
                    disabled={isProcessing}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 h-11 sm:h-auto text-sm sm:text-base disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Pay Now'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Confirmation */}
          {step === "confirmation" && (
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardContent className="p-4 sm:p-8 text-center">
                {bookingData.selectedSlot?.type === "paid" ? (
                  <>
                    <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-3 sm:mb-4">
                      Booking Confirmed!
                    </h3>
                    <div className="bg-slate-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 text-left">
                      <div className="space-y-2 text-sm sm:text-base">
                        <div>
                          <strong>Date & Time:</strong> {new Date(bookingData.selectedSlot.date).toLocaleDateString()}{" "}
                          at {bookingData.selectedSlot.time} (EST)
                        </div>
                        <div>
                          <strong>Duration:</strong> {bookingData.duration} minutes
                        </div>
                        <div>
                          <strong>Mode:</strong> {bookingData.meetingMode === "online" ? "Online" : "In Person"}
                        </div>
                        {/* Show generated meeting details */}
                        {bookingData.meetingMode === "online" && generatedMeetingDetails.meetingUrl && (
                          <div className="break-all">
                            <strong>Zoom Link:</strong>{" "}
                            <a
                              href={generatedMeetingDetails.meetingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {generatedMeetingDetails.meetingUrl}
                            </a>
                          </div>
                        )}
                        {bookingData.meetingMode === "in-person" && generatedMeetingDetails.venueAddress && (
                          <div>
                            <strong>Venue:</strong>
                            <div className="mt-1 text-sm whitespace-pre-line">
                              {generatedMeetingDetails.venueAddress}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm sm:text-base px-2">
                      {bookingData.meetingMode === "online"
                        ? "A confirmation email with the Zoom link has been sent to your inbox"
                        : "A confirmation email with venue details has been sent to your inbox"}
                    </p>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-blue-500 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-3 sm:mb-4">Request Received</h3>
                    <div className="bg-slate-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 text-left">
                      <div className="space-y-2 text-sm sm:text-base">
                        <div>
                          <strong>Name:</strong> {bookingData.firstName}
                        </div>
                        <div className="break-all">
                          <strong>Email:</strong> {bookingData.email}
                        </div>
                        <div>
                          <strong>Requested Time:</strong>{" "}
                          {bookingData.selectedSlot && new Date(bookingData.selectedSlot.date).toLocaleDateString()} at{" "}
                          {bookingData.selectedSlot?.time}
                        </div>
                        <div>
                          <strong>Mode:</strong> {bookingData.meetingMode === "online" ? "Online" : "In Person"}
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-600 mb-4 sm:mb-6 text-sm sm:text-base px-2">
                      Your request has been sent to Irfan Malik. You will receive meeting confirmation by email if
                      approved. If not approved, you will receive guidance and alternate options.
                    </p>
                  </>
                )}

                <div className="mb-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(bookingData.selectedSlot?.type === "paid" ? "payment" : "calendar")}
                    className="flex items-center gap-1 h-10 sm:h-11 text-sm sm:text-base"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    asChild
                    className="bg-blue-600 hover:bg-blue-700 text-white h-11 sm:h-auto text-sm sm:text-base"
                  >
                    <a href="/">Go to Home</a>
                  </Button>
                  <Button asChild variant="outline" className="h-11 sm:h-auto text-sm sm:text-base bg-transparent">
                    <a href="https://irfangpt.com" target="_blank" rel="noopener noreferrer">
                      Chat with IrfanGPT
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="h-11 sm:h-auto text-sm sm:text-base bg-transparent">
                    <a href="https://xevengpt.com" target="_blank" rel="noopener noreferrer">
                      Know more about Xeven
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
