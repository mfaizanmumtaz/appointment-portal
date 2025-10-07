"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Calendar, DollarSign, Users, MessageSquare, TrendingUp, RefreshCw, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Appointment, TimeSlot, StudentTriageLog } from "@/lib/types/database"
import { useOffline } from "@/hooks/use-offline"
import { OfflineStatus, ErrorBanner } from "@/components/ui/offline-status"


export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    weeklyAppointments: 0,
    upcomingMeetings: 0,
    todaySlots: 0,
    monthSlots: 0,
    paidAppointments: 0,
    freeAppointments: 0,
    businessTotal: 0,
    studentTotal: 0,
    inPersonTotal: 0,
    paidAvailable: 0,
    freeAvailable: 0,
    bookedSlots: 0,
    pendingAppointments: 0,
    weeklyRevenue: 0,
    previousWeekRevenue: 0,
    revenueGrowth: 0,
    aiApprovalRate: 0,
    showRate: 0,
    weeklyPaid: 0,
    weeklyFree: 0,
  })
  const [weeklyData, setWeeklyData] = useState<Array<{ day: string; paid: number; free: number }>>([])
  const [loading, setLoading] = useState(true)

  const {
    isOnline,
    error,
    lastUpdated,
    isRefreshing,
    setError,
    setLastUpdated,
    setIsRefreshing,
    executeWithOfflineCheck
  } = useOffline({ autoRefresh: false, refreshInterval: 30000 })

  useEffect(() => {
    executeWithOfflineCheck(fetchDashboardData)
  }, [])

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    await executeWithOfflineCheck(fetchDashboardData)
    setIsRefreshing(false)
  }

  const fetchDashboardData = async () => {
    setLoading(true)

    const { supabase } = await import("@/lib/supabase")

      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)

      // Previous week dates for comparison
      const prevWeekStart = new Date(weekStart)
      prevWeekStart.setDate(weekStart.getDate() - 7)
      const prevWeekEnd = new Date(weekEnd)
      prevWeekEnd.setDate(weekEnd.getDate() - 7)

      // Get ALL appointments from database
      const { data: allAppointments, error: allError } = await supabase
        .from('appointments')
        .select('*') as { data: Appointment[] | null; error: any }

      if (allError) {
        console.error('Error fetching all appointments:', allError)
        return
      }

      // Get this week's appointments
      const { data: weekAppointments, error: weekError } = await supabase
        .from('appointments')
        .select('*')
        .gte('date', weekStart.toISOString().split('T')[0])
        .lte('date', weekEnd.toISOString().split('T')[0]) as { data: Appointment[] | null; error: any }

      if (weekError) {
        console.error('Error fetching week appointments:', weekError)
        return
      }

      // Get previous week's appointments for comparison
      const { data: prevWeekAppointments, error: prevWeekError } = await supabase
        .from('appointments')
        .select('*')
        .gte('date', prevWeekStart.toISOString().split('T')[0])
        .lte('date', prevWeekEnd.toISOString().split('T')[0]) as { data: Appointment[] | null; error: any }

      if (prevWeekError) {
        console.error('Error fetching previous week appointments:', prevWeekError)
      }

      // Get student triage data for AI approval rate
      const { data: triageData, error: triageError } = await supabase
        .from('student_triage_log')
        .select('*') as { data: StudentTriageLog[] | null; error: any }

      if (triageError) {
        console.error('Error fetching triage data:', triageError)
      }

      // Get upcoming appointments (from today onwards)
      const { data: upcomingAppointments, error: upcomingError } = await supabase
        .from('appointments')
        .select('*')
        .gte('date', todayStr) as { data: Appointment[] | null; error: any }

      if (upcomingError) {
        console.error('Error fetching upcoming appointments:', upcomingError)
        return
      }

      // Get available slots for today
      const { data: todaySlots, error: todaySlotsError } = await supabase
        .from('time_slots')
        .select('*')
        .eq('date', todayStr)
        .eq('is_available', true) as { data: TimeSlot[] | null; error: any }

      if (todaySlotsError) {
        console.error('Error fetching today slots:', todaySlotsError)
      }

      // Get available slots for this month
      const { data: monthSlots, error: monthSlotsError } = await supabase
        .from('time_slots')
        .select('*')
        .gte('date', monthStart.toISOString().split('T')[0])
        .lte('date', monthEnd.toISOString().split('T')[0])
        .eq('is_available', true) as { data: TimeSlot[] | null; error: any }

      if (monthSlotsError) {
        console.error('Error fetching month slots:', monthSlotsError)
      }

      // Get all slots for status indicators
      const { data: allSlots, error: allSlotsError } = await supabase
        .from('time_slots')
        .select('*') as { data: TimeSlot[] | null; error: any }

      if (allSlotsError) {
        console.error('Error fetching all slots:', allSlotsError)
      }

      // Get pending appointments
      const { data: pendingAppts, error: pendingError } = await supabase
        .from('appointments')
        .select('*')
        .eq('status', 'pending') as { data: Appointment[] | null; error: any }

      if (pendingError) {
        console.error('Error fetching pending appointments:', pendingError)
      }

      const allPaidAppts = allAppointments?.filter(a => a.session_type === 'paid') || []
      const allFreeAppts = allAppointments?.filter(a => a.session_type === 'free') || []
      const totalRevenue = allPaidAppts.length * 150

      const allBusinessAppts = allAppointments?.filter(a => a.type === 'business') || []
      const allStudentAppts = allAppointments?.filter(a => a.type === 'student') || []
      const allInPersonAppts = allAppointments?.filter(a => a.type === 'in-person') || []

      const weekPaidAppts = weekAppointments?.filter(a => a.session_type === 'paid') || []
      const weekFreeAppts = weekAppointments?.filter(a => a.session_type === 'free') || []

      // Previous week calculations
      const prevWeekPaidAppts = prevWeekAppointments?.filter(a => a.session_type === 'paid') || []
      const weeklyRevenue = weekPaidAppts.length * 150
      const previousWeekRevenue = prevWeekPaidAppts.length * 150
      const revenueGrowth = previousWeekRevenue > 0
        ? Math.round(((weeklyRevenue - previousWeekRevenue) / previousWeekRevenue) * 100)
        : weeklyRevenue > 0 ? 100 : 0

      // AI Approval Rate calculation (from student triage data)
      const freeSessionTriages = triageData?.filter(t => t.ai_decision === 'approved') || []
      const totalTriages = triageData?.length || 0
      const aiApprovalRate = totalTriages > 0 ? Math.round((freeSessionTriages.length / totalTriages) * 100) : 0

      // Show Rate calculation (completed vs total non-cancelled appointments)
      const confirmedAppointments = allAppointments?.filter(a => a.status === 'confirmed') || []
      const completedAppointments = allAppointments?.filter(a => a.status === 'completed') || []
      const totalScheduledAppointments = confirmedAppointments.length + completedAppointments.length
      const showRate = totalScheduledAppointments > 0
        ? Math.round((completedAppointments.length / totalScheduledAppointments) * 100)
        : 0

      // Calculate status indicator counts
      const availableSlots = allSlots?.filter(s => s.is_available) || []
      const bookedSlots = allSlots?.filter(s => !s.is_available) || []
      
      // All available slots can be either paid or free (they're the same slots)
      const paidAvailable = availableSlots.length
      const freeAvailable = availableSlots.length
      const pendingAppointments = pendingAppts?.length || 0

      setStats({
        totalRevenue,
        totalBookings: allAppointments?.length || 0,
        weeklyAppointments: weekAppointments?.length || 0,
        upcomingMeetings: upcomingAppointments?.length || 0,
        todaySlots: todaySlots?.length || 0,
        monthSlots: monthSlots?.length || 0,
        paidAppointments: weekPaidAppts.length,
        freeAppointments: weekFreeAppts.length,
        businessTotal: allBusinessAppts.length,
        studentTotal: allStudentAppts.length,
        inPersonTotal: allInPersonAppts.length,
        paidAvailable,
        freeAvailable,
        bookedSlots: bookedSlots.length,
        pendingAppointments,
        weeklyRevenue,
        previousWeekRevenue,
        revenueGrowth,
        aiApprovalRate,
        showRate,
        weeklyPaid: weekPaidAppts.length,
        weeklyFree: weekFreeAppts.length,
      })

      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const dailyData = days.map((day, index) => {
        const dayDate = new Date(weekStart)
        dayDate.setDate(weekStart.getDate() + index)
        const dayStr = dayDate.toISOString().split('T')[0]

        const dayAppts = weekAppointments?.filter(a => a.date === dayStr) || []
        const paid = dayAppts.filter(a => a.session_type === 'paid').length
        const free = dayAppts.filter(a => a.session_type === 'free').length

        return { day, paid, free }
      })

      setWeeklyData(dailyData)
      setLastUpdated(new Date())
      setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
          <p className="text-slate-600">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-font text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground text-lg">Overview of your appointments and business metrics</p>
        </div>
        <OfflineStatus
          isOnline={isOnline}
          error={error}
          lastUpdated={lastUpdated}
          isRefreshing={isRefreshing}
          onRefresh={handleManualRefresh}
        />
      </div>

      <ErrorBanner error={error} />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold text-foreground">${stats.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-green-600 font-medium">+{stats.revenueGrowth}% from last week</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-3xl font-bold text-foreground">{stats.weeklyAppointments}</p>
                <p className="text-sm text-secondary font-medium">{stats.weeklyPaid} paid, {stats.weeklyFree} free</p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">AI Approval Rate</p>
                <p className="text-3xl font-bold text-foreground">{stats.aiApprovalRate}%</p>
                <p className="text-sm text-muted-foreground">Free sessions</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Show Rate</p>
                <p className="text-3xl font-bold text-foreground">{stats.showRate}%</p>
                <p className={`text-sm font-medium ${
                  stats.showRate >= 90 ? 'text-green-600' :
                  stats.showRate >= 80 ? 'text-blue-600' :
                  stats.showRate >= 70 ? 'text-yellow-600' :
                  stats.showRate > 0 ? 'text-red-600' : 'text-muted-foreground'
                }`}>
                  {stats.showRate >= 90 ? 'Excellent attendance' :
                   stats.showRate >= 80 ? 'Good attendance' :
                   stats.showRate >= 70 ? 'Fair attendance' :
                   stats.showRate > 0 ? 'Needs improvement' : 'No data yet'}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Enhanced dashboard with separate tabs for appointment types */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-muted rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg cursor-pointer">
            Overview
          </TabsTrigger>
          <TabsTrigger value="business" className="rounded-lg cursor-pointer">
            Business
          </TabsTrigger>
          <TabsTrigger value="student" className="rounded-lg cursor-pointer">
            Students
          </TabsTrigger>
          <TabsTrigger value="in-person" className="rounded-lg cursor-pointer">
            In-Person
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Weekly Bookings Chart */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <BarChart className="w-5 h-5" />
                  Weekly Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="paid" fill="hsl(var(--primary))" name="Paid" />
                    <Bar dataKey="free" fill="hsl(var(--secondary))" name="Free" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Session Types */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <TrendingUp className="w-5 h-5" />
                  Session Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Business Sessions</span>
                    <span className="font-semibold">{stats.businessTotal}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Student Sessions</span>
                    <span className="font-semibold">{stats.studentTotal}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">In-Person Sessions</span>
                    <span className="font-semibold">{stats.inPersonTotal}</span>
                  </div>
                  <hr className="border-muted" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Paid Sessions</span>
                    <span className="font-semibold text-green-600">{stats.paidAppointments}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Free Sessions</span>
                    <span className="font-semibold text-blue-600">{stats.freeAppointments}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="card-modern">
              <CardHeader>
                <CardTitle>Business Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Sessions:</span>
                  <span className="font-semibold">{stats.businessTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">This Week:</span>
                  <span className="font-semibold">{stats.businessTotal}</span>
                </div>
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        <TabsContent value="student" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="card-modern">
              <CardHeader>
                <CardTitle>Student Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Sessions:</span>
                  <span className="font-semibold">{stats.studentTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">This Week:</span>
                  <span className="font-semibold">{stats.studentTotal}</span>
                </div>
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        <TabsContent value="in-person" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="card-modern">
              <CardHeader>
                <CardTitle>In-Person Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Sessions:</span>
                  <span className="font-semibold">{stats.inPersonTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">This Week:</span>
                  <span className="font-semibold">{stats.inPersonTotal}</span>
                </div>
              </CardContent>
            </Card>

          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
