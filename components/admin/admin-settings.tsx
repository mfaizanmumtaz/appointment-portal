"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, DollarSign, Clock, MessageSquare, Bell, MapPin, Plus, X, RefreshCw, Trash2 } from "lucide-react"
import { AdminLocations } from "./admin-locations"
import { fetchQuickMessages, saveQuickMessages, type AdminQuickMessage } from "@/lib/quick-message-utils"
import { useToast } from "@/hooks/use-toast"

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
  
  const [quickMessages, setQuickMessages] = useState<string[]>([])
  const [isLoadingQuickMessages, setIsLoadingQuickMessages] = useState(true)
  const [isSavingQuickMessages, setIsSavingQuickMessages] = useState(false)
  const { toast } = useToast()

  // Load quick messages from database
  useEffect(() => {
    loadQuickMessages()
  }, [])

  const loadQuickMessages = async () => {
    setIsLoadingQuickMessages(true)
    const result = await fetchQuickMessages()
    if (result.success) {
      setQuickMessages(result.data.map(msg => msg.message))
    }
    setIsLoadingQuickMessages(false)
  }

  const handleSave = async () => {
    // Save regular settings (mock functionality for now)
    toast({
      title: "Settings Saved",
      description: "Your settings have been saved successfully.",
    })
  }

  const handleSaveQuickMessages = async () => {
    // Validate that all messages have content
    const emptyMessages = quickMessages.filter(msg => !msg.trim())
    if (emptyMessages.length > 0) {
      toast({
        title: "Validation Error",
        description: "All quick message fields are required. Please fill in all messages or remove empty ones.",
        variant: "destructive",
      })
      return
    }

    setIsSavingQuickMessages(true)
    const result = await saveQuickMessages(quickMessages)
    if (result.success) {
      toast({
        title: "Quick Messages Saved",
        description: "Your quick messages have been saved successfully.",
      })
    } else {
      toast({
        title: "Save Failed",
        description: "Failed to save quick messages. Please try again.",
        variant: "destructive",
      })
    }
    setIsSavingQuickMessages(false)
  }

  const handleDeleteQuickMessage = (index: number) => {
    const newMessages = quickMessages.filter((_, i) => i !== index)
    setQuickMessages(newMessages)
    toast({
      title: "Message Removed",
      description: "Quick message has been removed. Don't forget to save your changes.",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-font text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Configure your appointment system preferences</p>
      </div>

      <Tabs defaultValue="pricing" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="pricing" className="cursor-pointer">
            <DollarSign className="w-4 h-4 mr-2" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="availability" className="cursor-pointer">
            <Clock className="w-4 h-4 mr-2" />
            Availability
          </TabsTrigger>
          <TabsTrigger value="locations" className="cursor-pointer">
            <MapPin className="w-4 h-4 mr-2" />
            Locations
          </TabsTrigger>
          <TabsTrigger value="notifications" className="cursor-pointer">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="templates" className="cursor-pointer">
            <MessageSquare className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="quickMessages" className="cursor-pointer">
            <MessageSquare className="w-4 h-4 mr-2" />
            Quick Messages
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

        <TabsContent value="locations">
          <AdminLocations />
        </TabsContent>

        <TabsContent value="quickMessages">
          <Card className="card-calm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Quick Messages Configuration
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage quick reply messages that appear in the admin chat interface
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingQuickMessages ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading quick messages...</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {quickMessages.map((message, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        <Textarea
                          value={message}
                          onChange={(e) => {
                            const newMessages = [...quickMessages]
                            newMessages[index] = e.target.value
                            setQuickMessages(newMessages)
                          }}
                          className="flex-1 min-h-[60px] rounded-xl"
                          placeholder="Enter quick message... (required)"
                          disabled={isSavingQuickMessages}
                          required
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteQuickMessage(index)}
                          disabled={isSavingQuickMessages}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                          title="Delete this message"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setQuickMessages([...quickMessages, ""])
                      }}
                      className="flex-1 cursor-pointer"
                      disabled={isSavingQuickMessages}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Quick Message
                    </Button>
                    <Button
                      onClick={handleSaveQuickMessages}
                      disabled={isSavingQuickMessages}
                      className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                    >
                      {isSavingQuickMessages ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Settings className="w-4 h-4 mr-2" />
                          Save Quick Messages
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="btn-large btn-primary cursor-pointer">
          <Settings className="w-4 h-4 mr-2" />
          Save All Settings
        </Button>
      </div>
    </div>
  )
}
