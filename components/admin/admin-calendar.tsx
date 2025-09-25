"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, User, DollarSign, Video, MapPin, RefreshCw } from "lucide-react"


interface Appointment {
  id: string
  type: string
  session_type: string
  name: string
  email: string
  phone: string
  company?: string | null
  date: string
  time: string
  status: string
  created_at: string
}

export function AdminCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchAppointments()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAppointments()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    await fetchAppointments()
    setIsRefreshing(false)
  }

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const { supabase } = await import("@/lib/supabase")

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .in('status', ['confirmed', 'pending'])
        .order('date', { ascending: true })
        .order('time', { ascending: true })

      if (error) {
        console.error('Error fetching appointments:', error)
        return
      }

      setAppointments(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAppointmentsByType = (type: "paid" | "free") => {
    return appointments.filter((apt) => (type === "paid" ? apt.session_type === "paid" : apt.session_type === "free"))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "business":
        return "border-l-primary"
      case "student":
        return "border-l-secondary"
      case "in-person":
        return "border-l-accent"
      default:
        return "border-l-gray-300"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
          <p className="text-slate-600">Loading appointments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-font text-3xl font-bold text-foreground mb-2">Calendar</h1>
          <p className="text-muted-foreground">Manage your appointments and schedule</p>
        </div>
        <Button
          onClick={handleManualRefresh}
          variant="outline"
          size="sm"
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="paid" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="paid" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Paid Sessions ({getAppointmentsByType("paid").length})
          </TabsTrigger>
          <TabsTrigger value="free" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Free Sessions ({getAppointmentsByType("free").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="paid" className="space-y-4">
          <Card className="card-calm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Paid Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getAppointmentsByType("paid").length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No paid appointments</p>
                ) : (
                  getAppointmentsByType("paid").map((appointment) => (
                    <div
                      key={appointment.id}
                      className={`p-4 border-l-4 ${getTypeColor(appointment.type)} bg-muted/30 rounded-r-xl`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{appointment.name}</span>
                          <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-semibold">
                            Paid
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {appointment.time}
                        </div>
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4" />
                          {new Date(appointment.date).toLocaleDateString()}
                        </div>
                        <div>{appointment.email}</div>
                        <div className="flex gap-2">
                          <Badge variant="outline">{appointment.type}</Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="free" className="space-y-4">
          <Card className="card-calm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Free Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getAppointmentsByType("free").length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No free appointments</p>
                ) : (
                  getAppointmentsByType("free").map((appointment) => (
                    <div
                      key={appointment.id}
                      className={`p-4 border-l-4 ${getTypeColor(appointment.type)} bg-muted/30 rounded-r-xl`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{appointment.name}</span>
                          <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Free</Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {appointment.time}
                        </div>
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4" />
                          {new Date(appointment.date).toLocaleDateString()}
                        </div>
                        <div>{appointment.email}</div>
                        <div className="flex gap-2">
                          <Badge variant="outline">{appointment.type}</Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
