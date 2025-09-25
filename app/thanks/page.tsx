"use client"

import { useSearchParams } from "next/navigation"
import { Navigation } from "@/components/ui/navigation"
import { Footer } from "@/components/ui/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Calendar, Video, MapPin, Clock, User, Mail, Phone, Download } from "lucide-react"
import Link from "next/link"

export default function ThanksPage() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId") || "demo123"

  // Mock booking data based on ID
  const mockBooking = {
    id: bookingId,
    type: bookingId.includes("student") ? "student" : "business",
    client: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    date: "January 16, 2024",
    time: "2:00 PM EST",
    duration: "60 minutes",
    format: bookingId.includes("student") ? "in-person" : "zoom",
    venue: "Downtown Office - 123 Tech Street, Suite 400",
    zoomLink: "https://zoom.us/j/123456789",
    price: bookingId.includes("student") ? "$75" : "$250",
    status: "confirmed",
  }

  const handleAddToGoogle = () => {
    const startDate = new Date("2024-01-16T14:00:00").toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    const endDate = new Date("2024-01-16T15:00:00").toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Consultation with Irfan Malik&dates=${startDate}/${endDate}&details=Booking ID: ${bookingId}&location=${
      mockBooking.format === "zoom" ? mockBooking.zoomLink : mockBooking.venue
    }`
    window.open(url, "_blank")
  }

  const handleAddToOutlook = () => {
    const startDate = new Date("2024-01-16T14:00:00").toISOString()
    const endDate = new Date("2024-01-16T15:00:00").toISOString()
    const url = `https://outlook.live.com/calendar/0/deeplink/compose?subject=Consultation with Irfan Malik&startdt=${startDate}&enddt=${endDate}&body=Booking ID: ${bookingId}&location=${
      mockBooking.format === "zoom" ? mockBooking.zoomLink : mockBooking.venue
    }`
    window.open(url, "_blank")
  }

  const handleDownloadICS = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Irfan Malik//Appointments Portal//EN
BEGIN:VEVENT
UID:${bookingId}@irfanmalik.com
DTSTAMP:20240115T120000Z
DTSTART:20240116T140000Z
DTEND:20240116T150000Z
SUMMARY:Consultation with Irfan Malik
DESCRIPTION:Booking ID: ${bookingId}
LOCATION:${mockBooking.format === "zoom" ? mockBooking.zoomLink : mockBooking.venue}
END:VEVENT
END:VCALENDAR`

    const blob = new Blob([icsContent], { type: "text/calendar" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `consultation-${bookingId}.ics`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="heading-font text-3xl font-bold text-foreground mb-2">Booking Confirmed!</h1>
            <p className="text-lg text-muted-foreground">Your consultation has been successfully scheduled</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Booking Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="card-calm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Session Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Client</p>
                        <p className="font-medium">{mockBooking.client}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Date & Time</p>
                        <p className="font-medium">
                          {mockBooking.date} at {mockBooking.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-medium">{mockBooking.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-semibold">
                        {mockBooking.price}
                      </Badge>
                      <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Meeting Details */}
              <Card className="card-calm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {mockBooking.format === "zoom" ? <Video className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                    {mockBooking.format === "zoom" ? "Zoom Meeting" : "In-Person Meeting"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockBooking.format === "zoom" ? (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Join Zoom Meeting</p>
                      <div className="p-3 bg-muted/30 rounded-xl">
                        <p className="font-mono text-sm break-all">{mockBooking.zoomLink}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Meeting link will also be sent via email 30 minutes before the session
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Meeting Location</p>
                      <div className="p-3 bg-muted/30 rounded-xl">
                        <p className="font-medium">{mockBooking.venue}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Detailed directions and parking information will be sent via email
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="card-calm">
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{mockBooking.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{mockBooking.phone}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You'll receive confirmation and reminder emails at the address above
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Actions Sidebar */}
            <div className="space-y-6">
              {/* Calendar Actions */}
              <Card className="card-calm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Add to Calendar
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={handleAddToGoogle}
                    variant="outline"
                    className="w-full justify-start rounded-xl bg-transparent"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Google Calendar
                  </Button>
                  <Button
                    onClick={handleAddToOutlook}
                    variant="outline"
                    className="w-full justify-start rounded-xl bg-transparent"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Outlook Calendar
                  </Button>
                  <Button
                    onClick={handleDownloadICS}
                    variant="outline"
                    className="w-full justify-start rounded-xl bg-transparent"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download .ics
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="card-calm">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start rounded-xl bg-transparent">
                    Reschedule Session
                  </Button>
                  <Button variant="outline" className="w-full justify-start rounded-xl bg-transparent">
                    Cancel Booking
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start rounded-xl bg-transparent">
                    <Link href="/chat/irfan">Ask AI Questions</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Booking Reference */}
              <Card className="card-calm">
                <CardHeader>
                  <CardTitle>Booking Reference</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-muted/30 rounded-xl text-center">
                    <p className="text-sm text-muted-foreground">Booking ID</p>
                    <p className="font-mono font-semibold">{bookingId}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">Save this ID for future reference</p>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card className="card-calm">
                <CardHeader>
                  <CardTitle>What's Next?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p>Check your email for confirmation details</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p>Add the session to your calendar</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p>Prepare any questions or materials</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p>Join the session at the scheduled time</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
