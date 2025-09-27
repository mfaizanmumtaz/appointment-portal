"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Calendar, DollarSign, Users, MessageSquare, TrendingUp } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const weeklyData = [
  { day: "Mon", paid: 4, free: 2 },
  { day: "Tue", paid: 3, free: 4 },
  { day: "Wed", paid: 6, free: 1 },
  { day: "Thu", paid: 2, free: 3 },
  { day: "Fri", paid: 5, free: 2 },
  { day: "Sat", paid: 1, free: 1 },
  { day: "Sun", paid: 0, free: 0 },
]

const sessionTypeData = [
  { name: "Business Paid", value: 45, color: "#1f7a8c" },
  { name: "Business Free", value: 25, color: "#4fb0c6" },
  { name: "Student Paid", value: 20, color: "#94a3b8" },
  { name: "Student Free", value: 10, color: "#64748b" },
]

const timeSlotData = [
  { time: "9-11 AM", bookings: 8 },
  { time: "11-1 PM", bookings: 12 },
  { time: "1-3 PM", bookings: 6 },
  { time: "3-5 PM", bookings: 15 },
  { time: "5-7 PM", bookings: 9 },
]

export function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading-font text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground text-lg">Overview of your appointments and business metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold text-foreground">$3,250</p>
                <p className="text-sm text-green-600 font-medium">+12% from last week</p>
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
                <p className="text-3xl font-bold text-foreground">28</p>
                <p className="text-sm text-secondary font-medium">21 paid, 7 free</p>
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
                <p className="text-3xl font-bold text-foreground">73%</p>
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
                <p className="text-3xl font-bold text-foreground">94%</p>
                <p className="text-sm text-green-600 font-medium">Excellent attendance</p>
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
          <TabsTrigger value="overview" className="rounded-lg">
            Overview
          </TabsTrigger>
          <TabsTrigger value="business" className="rounded-lg">
            Business
          </TabsTrigger>
          <TabsTrigger value="student" className="rounded-lg">
            Students
          </TabsTrigger>
          <TabsTrigger value="in-person" className="rounded-lg">
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
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sessionTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {sessionTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
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
                  <span className="font-semibold">18</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid Sessions:</span>
                  <span className="font-semibold">15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Free Sessions:</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Revenue:</span>
                  <span className="font-semibold">$2,850</span>
                </div>
              </CardContent>
            </Card>

            <Card className="card-modern lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Business Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                    <div>
                      <p className="font-medium">TechCorp Consultation</p>
                      <p className="text-sm text-muted-foreground">Sarah Johnson - 60min</p>
                    </div>
                    <Badge variant="default">$250</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                    <div>
                      <p className="font-medium">Startup Strategy</p>
                      <p className="text-sm text-muted-foreground">Mike Chen - 30min</p>
                    </div>
                    <Badge variant="default">$150</Badge>
                  </div>
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
                  <span className="font-semibold">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid Sessions:</span>
                  <span className="font-semibold">5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Free Sessions:</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Revenue:</span>
                  <span className="font-semibold">$300</span>
                </div>
              </CardContent>
            </Card>

            <Card className="card-modern lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Student Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                    <div>
                      <p className="font-medium">AI Career Guidance</p>
                      <p className="text-sm text-muted-foreground">Lisa Wang - 30min</p>
                    </div>
                    <Badge variant="secondary">Free</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                    <div>
                      <p className="font-medium">ML Project Review</p>
                      <p className="text-sm text-muted-foreground">David Park - 60min</p>
                    </div>
                    <Badge variant="default">$80</Badge>
                  </div>
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
                  <span className="font-semibold">2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid Sessions:</span>
                  <span className="font-semibold">1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Free Sessions:</span>
                  <span className="font-semibold">1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Revenue:</span>
                  <span className="font-semibold">$100</span>
                </div>
              </CardContent>
            </Card>

            <Card className="card-modern lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent In-Person Meetings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                    <div>
                      <p className="font-medium">Workshop Planning</p>
                      <p className="text-sm text-muted-foreground">Robert Kim - 90min</p>
                    </div>
                    <Badge variant="default">$100</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                    <div>
                      <p className="font-medium">Coffee Chat</p>
                      <p className="text-sm text-muted-foreground">Emma Davis - 45min</p>
                    </div>
                    <Badge variant="secondary">Free</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
