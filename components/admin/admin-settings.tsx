"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, DollarSign, Clock, MessageSquare, Bell } from "lucide-react"

export function AdminSettings() {
  const [settings, setSettings] = useState({
    pricing: {
      businessConsultation30: 150,
      businessConsultation60: 250,
      businessConsultancy6Month: 2500,
      studentInPerson: 75,
    },
    availability: {
      mondayStart: "09:00",
      mondayEnd: "17:00",
      tuesdayStart: "09:00",
      tuesdayEnd: "17:00",
      wednesdayStart: "09:00",
      wednesdayEnd: "17:00",
      thursdayStart: "09:00",
      thursdayEnd: "17:00",
      fridayStart: "09:00",
      fridayEnd: "17:00",
      weekendAvailable: false,
    },
    buffers: {
      betweenSessions: 15,
      beforeFirstSession: 30,
      afterLastSession: 15,
    },
    notifications: {
      emailReminders: true,
      smsReminders: false,
      newBookingAlerts: true,
      paymentAlerts: true,
    },
    templates: {
      confirmationEmail: "Thank you for booking a session with Irfan Malik...",
      reminderEmail: "This is a reminder about your upcoming session...",
      declineEmail: "Thank you for your interest. Unfortunately...",
    },
  })

  const handleSave = () => {
    // Mock save functionality
    alert("Settings saved successfully!")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-font text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Configure your appointment system preferences</p>
      </div>

      <Tabs defaultValue="pricing" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pricing">
            <DollarSign className="w-4 h-4 mr-2" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="availability">
            <Clock className="w-4 h-4 mr-2" />
            Availability
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="templates">
            <MessageSquare className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pricing">
          <Card className="card-calm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Business Consultations</h3>
                  <div>
                    <Label htmlFor="business30">30-Minute Session ($)</Label>
                    <Input
                      id="business30"
                      type="number"
                      value={settings.pricing.businessConsultation30}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          pricing: { ...settings.pricing, businessConsultation30: Number(e.target.value) },
                        })
                      }
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="business60">60-Minute Session ($)</Label>
                    <Input
                      id="business60"
                      type="number"
                      value={settings.pricing.businessConsultation60}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          pricing: { ...settings.pricing, businessConsultation60: Number(e.target.value) },
                        })
                      }
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="business6month">6-Month Consultancy ($)</Label>
                    <Input
                      id="business6month"
                      type="number"
                      value={settings.pricing.businessConsultancy6Month}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          pricing: { ...settings.pricing, businessConsultancy6Month: Number(e.target.value) },
                        })
                      }
                      className="rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold">Student Sessions</h3>
                  <div>
                    <Label htmlFor="studentInPerson">In-Person Session ($)</Label>
                    <Input
                      id="studentInPerson"
                      type="number"
                      value={settings.pricing.studentInPerson}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          pricing: { ...settings.pricing, studentInPerson: Number(e.target.value) },
                        })
                      }
                      className="rounded-xl"
                    />
                  </div>
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <p className="text-sm text-muted-foreground">
                      <strong>Note:</strong> Free sessions (online student and AI-triaged business) are always $0
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability">
          <Card className="card-calm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Availability & Buffers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Weekly Schedule</h3>
                <div className="grid gap-4">
                  {["monday", "tuesday", "wednesday", "thursday", "friday"].map((day) => (
                    <div key={day} className="flex items-center gap-4">
                      <div className="w-24 capitalize">{day}</div>
                      <Input
                        type="time"
                        value={settings.availability[`${day}Start` as keyof typeof settings.availability] as string}
                        className="rounded-xl w-32"
                      />
                      <span>to</span>
                      <Input
                        type="time"
                        value={settings.availability[`${day}End` as keyof typeof settings.availability] as string}
                        className="rounded-xl w-32"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center space-x-2 mt-4">
                  <Switch
                    id="weekend"
                    checked={settings.availability.weekendAvailable}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        availability: { ...settings.availability, weekendAvailable: checked },
                      })
                    }
                  />
                  <Label htmlFor="weekend">Available on weekends</Label>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Buffer Times (minutes)</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="betweenSessions">Between Sessions</Label>
                    <Input
                      id="betweenSessions"
                      type="number"
                      value={settings.buffers.betweenSessions}
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="beforeFirst">Before First Session</Label>
                    <Input
                      id="beforeFirst"
                      type="number"
                      value={settings.buffers.beforeFirstSession}
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="afterLast">After Last Session</Label>
                    <Input
                      id="afterLast"
                      type="number"
                      value={settings.buffers.afterLastSession}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="card-calm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailReminders">Email Reminders</Label>
                    <p className="text-sm text-muted-foreground">Send email reminders to clients</p>
                  </div>
                  <Switch
                    id="emailReminders"
                    checked={settings.notifications.emailReminders}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, emailReminders: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="smsReminders">SMS Reminders</Label>
                    <p className="text-sm text-muted-foreground">Send SMS reminders to clients</p>
                  </div>
                  <Switch
                    id="smsReminders"
                    checked={settings.notifications.smsReminders}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, smsReminders: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="newBookingAlerts">New Booking Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified of new bookings</p>
                  </div>
                  <Switch
                    id="newBookingAlerts"
                    checked={settings.notifications.newBookingAlerts}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, newBookingAlerts: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="paymentAlerts">Payment Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified of successful payments</p>
                  </div>
                  <Switch
                    id="paymentAlerts"
                    checked={settings.notifications.paymentAlerts}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, paymentAlerts: checked },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card className="card-calm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Email Templates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="confirmationEmail">Confirmation Email</Label>
                <Textarea
                  id="confirmationEmail"
                  value={settings.templates.confirmationEmail}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      templates: { ...settings.templates, confirmationEmail: e.target.value },
                    })
                  }
                  className="rounded-xl mt-2"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="reminderEmail">Reminder Email</Label>
                <Textarea
                  id="reminderEmail"
                  value={settings.templates.reminderEmail}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      templates: { ...settings.templates, reminderEmail: e.target.value },
                    })
                  }
                  className="rounded-xl mt-2"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="declineEmail">Decline Email</Label>
                <Textarea
                  id="declineEmail"
                  value={settings.templates.declineEmail}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      templates: { ...settings.templates, declineEmail: e.target.value },
                    })
                  }
                  className="rounded-xl mt-2"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="btn-large btn-primary">
          <Settings className="w-4 h-4 mr-2" />
          Save All Settings
        </Button>
      </div>
    </div>
  )
}
