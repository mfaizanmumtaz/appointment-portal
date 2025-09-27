"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, DollarSign, Users, Plus, Edit, Trash2, CalendarDays, Eye, AlertTriangle, RefreshCw } from "lucide-react"

interface TimeSlot {
  id: string
  date: string
  time: string
  is_available: boolean
  slot_type: "business" | "student" | "both"
  session_type: "free" | "paid"
  created_at: string
}

interface BulkCreationSettings {
  dateRange: {
    start: string
    end: string
  }
  timeWindow: {
    start: string
    end: string
  }
  selectedDays: string[]
  slotType: "business" | "student" | "both"
  sessionType: "free" | "paid"
}


const weekdays = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
]

export function AdminSlots() {
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isBulkCreating, setIsBulkCreating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [selectedSlots, setSelectedSlots] = useState<string[]>([])
  const [previewSlots, setPreviewSlots] = useState<TimeSlot[]>([])

  const [newSlot, setNewSlot] = useState({
    date: new Date().toISOString().split('T')[0],
    time: "09:00",
    slot_type: "business" as "business" | "student" | "both",
    session_type: "free" as "free" | "paid",
  })

  // Helper to get minimum date/time for validation
  const getMinDateTime = () => {
    const now = new Date()
    return {
      minDate: now.toISOString().split('T')[0],
      minTime: now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0')
    }
  }

  useEffect(() => {
    fetchSlots()
  }, [])

  const fetchSlots = async () => {
    setLoading(true)
    try {
      const { supabase } = await import("@/lib/supabase")

      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .order('date', { ascending: true })
        .order('time', { ascending: true })

      if (error) {
        console.error('Error fetching slots:', error)
        return
      }

      setSlots(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const today = new Date()
  const nextWeek = new Date()
  nextWeek.setDate(today.getDate() + 7)

  const [bulkSettings, setBulkSettings] = useState<BulkCreationSettings>({
    dateRange: {
      start: today.toISOString().split("T")[0],
      end: nextWeek.toISOString().split("T")[0],
    },
    timeWindow: {
      start: "09:00",
      end: "17:00",
    },
    selectedDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    slotType: "business",
    sessionType: "free",
  })

  // Filter out past dates from bulk generation
  const filterFutureDates = (slots: TimeSlot[]) => {
    const now = new Date()
    return slots.filter(slot => {
      const slotDateTime = new Date(`${slot.date}T${slot.time}`)
      return slotDateTime > now
    })
  }

  const handleCreateSlot = async () => {
    try {
      // Validate that slot is not in the past
      const now = new Date()
      const slotDateTime = new Date(`${newSlot.date}T${newSlot.time}`)

      if (slotDateTime <= now) {
        alert('Cannot create slots in the past. Please select a future date and time.')
        return
      }

      const { supabase } = await import("@/lib/supabase")

      // Check if slot already exists
      const { data: existingSlot } = await supabase
        .from('time_slots')
        .select('id')
        .eq('date', newSlot.date)
        .eq('time', newSlot.time)
        .eq('slot_type', newSlot.slot_type)
        .eq('session_type', newSlot.session_type)
        .single()

      if (existingSlot) {
        alert(`A ${newSlot.slot_type} ${newSlot.session_type} slot already exists for ${newSlot.date} at ${newSlot.time}!`)
        return
      }

      // Create new slot
      const { data, error } = await supabase
        .from('time_slots')
        .insert({
          date: newSlot.date,
          time: newSlot.time,
          is_available: true,
          slot_type: newSlot.slot_type,
          session_type: newSlot.session_type,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating slot:', error)
        if (error.message.includes('duplicate key value')) {
          alert('A slot with this date, time, and type already exists!')
        } else {
          alert(`Error: ${error.message}`)
        }
        return
      }

      // Refresh slots to get current state
      await fetchSlots()
      setNewSlot({
        date: new Date().toISOString().split('T')[0],
        time: "09:00",
        slot_type: "business",
        session_type: "free",
      })
      setIsCreating(false)
      alert('Slot created successfully!')
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to create slot')
    }
  }

  const handleDeleteSlot = async (id: string) => {
    if (!confirm('Delete this slot? WARNING: This will also cancel any related appointments automatically.')) return

    try {
      const { supabase } = await import("@/lib/supabase")

      const { error } = await supabase
        .from('time_slots')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting slot:', error)
        alert(`Error: ${error.message}`)
        return
      }

      setSlots(slots.filter((slot) => slot.id !== id))
      alert('Slot deleted successfully!')
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to delete slot')
    }
  }

  const getCategorySlots = (slotType: "business" | "student" | "both") => {
    try {
      if (slotType === "both") {
        return slots.filter((slot) => slot.slot_type === "both")
      }
      return slots.filter((slot) => slot.slot_type === slotType || slot.slot_type === "both")
    } catch (error) {
      console.error("Error filtering slots:", error)
      return []
    }
  }

  const generateBulkSlots = async () => {
    try {
      const generatedSlots: TimeSlot[] = []
      const startDate = new Date(bulkSettings.dateRange.start)
      const endDate = new Date(bulkSettings.dateRange.end)

      if (startDate > endDate) {
        alert("Invalid date range: start date must be before end date")
        return
      }

      if (bulkSettings.selectedDays.length === 0) {
        alert("Please select at least one day")
        return
      }

      const currentDate = new Date(startDate)
      let iterationCount = 0
      const maxIterations = 365

      while (currentDate <= endDate && iterationCount < maxIterations) {
        iterationCount++
        const dayName = currentDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()

        if (bulkSettings.selectedDays.includes(dayName)) {
          const dateStr = currentDate.toISOString().split("T")[0]
          const startHour = Number.parseInt(bulkSettings.timeWindow.start.split(":")[0])
          const startMin = Number.parseInt(bulkSettings.timeWindow.start.split(":")[1])
          const endHour = Number.parseInt(bulkSettings.timeWindow.end.split(":")[0])
          const endMin = Number.parseInt(bulkSettings.timeWindow.end.split(":")[1])

          if (startHour >= endHour) {
            currentDate.setDate(currentDate.getDate() + 1)
            continue
          }

          for (let hour = startHour; hour < endHour; hour++) {
            for (let min = 0; min < 60; min += 30) {
              if (hour === startHour && min < startMin) continue
              if (hour === endHour - 1 && min >= endMin) break

              generatedSlots.push({
                id: `preview-${dateStr}-${hour}-${min}`,
                date: dateStr,
                time: `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`,
                is_available: true,
                slot_type: bulkSettings.slotType,
                session_type: bulkSettings.sessionType,
                created_at: new Date().toISOString(),
              })
            }
          }
        }

        currentDate.setDate(currentDate.getDate() + 1)
      }

      // Check for conflicts with existing appointments and slots
      const { supabase } = await import("@/lib/supabase")

      const slotQueries = generatedSlots.map(slot =>
        `(date = '${slot.date}' AND time = '${slot.time}')`
      ).join(' OR ')

      if (slotQueries) {
        // Check existing appointments
        const { data: existingAppointments } = await supabase
          .from('appointments')
          .select('date, time, status')
          .or(slotQueries)
          .in('status', ['confirmed', 'pending'])

        // Check existing slots
        const { data: existingSlots } = await supabase
          .from('time_slots')
          .select('date, time, slot_type, session_type')
          .or(slotQueries)

        const appointmentConflicts = new Set(
          existingAppointments?.map(apt => `${apt.date}-${apt.time}`) || []
        )

        const slotConflicts = new Set(
          existingSlots?.map(slot => `${slot.date}-${slot.time}-${slot.slot_type}-${slot.session_type}`) || []
        )

        // Mark conflicts in generated slots
        generatedSlots.forEach(slot => {
          const timeKey = `${slot.date}-${slot.time}`
          const slotKey = `${slot.date}-${slot.time}-${slot.slot_type}-${slot.session_type}`

          if (appointmentConflicts.has(timeKey)) {
            slot.id = `conflict-appointment-${slot.id}`
          } else if (slotConflicts.has(slotKey)) {
            slot.id = `conflict-slot-${slot.id}`
          }
        })
      }

      // Filter out any slots in the past
      const futureSlots = filterFutureDates(generatedSlots)

      setPreviewSlots(futureSlots)
      setShowPreview(true)

      if (futureSlots.length < generatedSlots.length) {
        const pastCount = generatedSlots.length - futureSlots.length
        alert(`Filtered out ${pastCount} slots that would be in the past. Showing ${futureSlots.length} future slots.`)
      }
    } catch (error) {
      console.error("Error generating bulk slots:", error)
      alert("Error generating slots. Please check your settings and try again.")
    }
  }

  const confirmBulkCreation = async () => {
    try {
      const { supabase } = await import("@/lib/supabase")

      // Check for existing appointments that would conflict
      const slotQueries = previewSlots.map(slot =>
        `(date = '${slot.date}' AND time = '${slot.time}')`
      ).join(' OR ')

      const { data: existingAppointments } = await supabase
        .from('appointments')
        .select('date, time, status')
        .or(slotQueries)
        .in('status', ['confirmed', 'pending'])

      // Check for existing time slots that would conflict
      const slotCheckQueries = previewSlots.map(slot =>
        `(date = '${slot.date}' AND time = '${slot.time}' AND slot_type = '${slot.slot_type}' AND session_type = '${slot.session_type}')`
      ).join(' OR ')

      const { data: existingSlots } = await supabase
        .from('time_slots')
        .select('date, time, slot_type, session_type')
        .or(slotCheckQueries)

      // Filter out slots that have confirmed/pending appointments
      const appointmentConflicts = new Set(
        existingAppointments?.map(apt => `${apt.date}-${apt.time}`) || []
      )

      // Filter out slots that already exist
      const slotConflicts = new Set(
        existingSlots?.map(slot => `${slot.date}-${slot.time}-${slot.slot_type}-${slot.session_type}`) || []
      )

      const slotsToInsert = previewSlots
        .filter(slot => {
          const appointmentKey = `${slot.date}-${slot.time}`
          const slotKey = `${slot.date}-${slot.time}-${slot.slot_type}-${slot.session_type}`
          return !appointmentConflicts.has(appointmentKey) && !slotConflicts.has(slotKey)
        })
        .map(slot => ({
          date: slot.date,
          time: slot.time,
          is_available: true,
          slot_type: slot.slot_type,
          session_type: slot.session_type,
        }))

      if (slotsToInsert.length === 0) {
        const appointmentCount = previewSlots.filter(slot => 
          appointmentConflicts.has(`${slot.date}-${slot.time}`)
        ).length
        const duplicateCount = previewSlots.filter(slot =>
          slotConflicts.has(`${slot.date}-${slot.time}-${slot.slot_type}-${slot.session_type}`)
        ).length

        let message = 'No new slots to create!'
        if (appointmentCount > 0) {
          message += ` ${appointmentCount} slots skipped due to existing appointments.`
        }
        if (duplicateCount > 0) {
          message += ` ${duplicateCount} slots already exist.`
        }
        alert(message)
        return
      }

      // Insert new slots (no duplicates since we pre-filtered)
      const { data, error } = await supabase
        .from('time_slots')
        .insert(slotsToInsert)
        .select()

      if (error) {
        console.error('Error creating bulk slots:', error)
        alert(`Error: ${error.message}`)
        return
      }

      const appointmentConflictCount = previewSlots.filter(slot => 
        appointmentConflicts.has(`${slot.date}-${slot.time}`)
      ).length
      const duplicateConflictCount = previewSlots.filter(slot =>
        slotConflicts.has(`${slot.date}-${slot.time}-${slot.slot_type}-${slot.session_type}`)
      ).length

      let message = `Successfully created ${data?.length || 0} slots!`

      if (appointmentConflictCount > 0) {
        message += ` (Skipped ${appointmentConflictCount} slots due to existing appointments)`
      }
      if (duplicateConflictCount > 0) {
        message += ` (Skipped ${duplicateConflictCount} duplicate slots)`
      }

      setSlots([...slots, ...(data || [])])
      setPreviewSlots([])
      setShowPreview(false)
      setIsBulkCreating(false)
      alert(message)

      // Refresh slots to get current state
      fetchSlots()
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to create bulk slots')
    }
  }

  const bulkDeleteSelected = async () => {
    if (!confirm(`Delete ${selectedSlots.length} selected slots? WARNING: This will also cancel any related appointments automatically.`)) return

    try {
      const { supabase } = await import("@/lib/supabase")

      const { error } = await supabase
        .from('time_slots')
        .delete()
        .in('id', selectedSlots)

      if (error) {
        console.error('Error bulk deleting slots:', error)
        alert(`Error: ${error.message}`)
        return
      }

      setSlots(slots.filter((slot) => !selectedSlots.includes(slot.id)))
      setSelectedSlots([])
      alert(`Successfully deleted ${selectedSlots.length} slots!`)
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to delete slots')
    }
  }

  const toggleSlotSelection = (slotId: string) => {
    try {
      setSelectedSlots((prev) => (prev.includes(slotId) ? prev.filter((id) => id !== slotId) : [...prev, slotId]))
    } catch (error) {
      console.error("[v0] Error toggling slot selection:", error)
    }
  }

  const selectAllSlots = () => {
    try {
      setSelectedSlots(slots.map((slot) => slot.id))
    } catch (error) {
      console.error("[v0] Error selecting all slots:", error)
    }
  }

  const clearSelection = () => {
    try {
      setSelectedSlots([])
    } catch (error) {
      console.error("[v0] Error clearing selection:", error)
    }
  }


  const SlotCard = ({ slot }: { slot: TimeSlot }) => {
    return (
      <Card className={`card-calm ${selectedSlots.includes(slot.id) ? "ring-2 ring-primary" : ""}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedSlots.includes(slot.id)}
                onCheckedChange={() => toggleSlotSelection(slot.id)}
              />
              <Clock className="w-4 h-4 text-primary" />
              <span className="font-medium">
                {new Date(slot.date).toLocaleDateString()} - {slot.time}
              </span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleDeleteSlot(slot.id)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={slot.is_available ? "default" : "secondary"}>
              {slot.is_available ? "Available" : "Unavailable"}
            </Badge>
            <Badge variant="outline">{slot.slot_type}</Badge>
            <Badge variant={slot.session_type === "paid" ? "default" : "secondary"}>
              {slot.session_type === "paid" ? "Paid" : "Free"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
          <p className="text-slate-600">Loading slots...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-font text-3xl font-bold text-foreground mb-2">Slot Management</h1>
          <p className="text-muted-foreground">Create and manage appointment slots for different categories</p>
        </div>
        <div className="flex gap-3">
          {selectedSlots.length > 0 && (
            <>
              <Button onClick={bulkDeleteSelected} variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected ({selectedSlots.length})
              </Button>
              <Button onClick={clearSelection} variant="outline" size="sm">
                Clear Selection
              </Button>
            </>
          )}
          <Button onClick={fetchSlots} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setIsBulkCreating(true)} className="btn-primary">
            <CalendarDays className="w-4 h-4 mr-2" />
            Bulk Create
          </Button>
          <Button onClick={() => setIsCreating(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Single Slot
          </Button>
        </div>
      </div>

      {isBulkCreating && (
        <Card className="card-calm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Bulk Slot Creation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date Range Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  min={getMinDateTime().minDate}
                  value={bulkSettings.dateRange.start}
                  onChange={(e) =>
                    setBulkSettings((prev) => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  min={bulkSettings.dateRange.start || getMinDateTime().minDate}
                  value={bulkSettings.dateRange.end}
                  onChange={(e) =>
                    setBulkSettings((prev) => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: e.target.value },
                    }))
                  }
                />
              </div>
            </div>

            {/* Quick Date Range Presets */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const start = new Date()
                  const end = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  setBulkSettings((prev) => ({
                    ...prev,
                    dateRange: {
                      start: start.toISOString().split("T")[0],
                      end: end.toISOString().split("T")[0],
                    },
                  }))
                }}
              >
                Next Week
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const start = new Date()
                  const end = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
                  setBulkSettings((prev) => ({
                    ...prev,
                    dateRange: {
                      start: start.toISOString().split("T")[0],
                      end: end.toISOString().split("T")[0],
                    },
                  }))
                }}
              >
                Next 2 Weeks
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const start = new Date()
                  const end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                  setBulkSettings((prev) => ({
                    ...prev,
                    dateRange: {
                      start: start.toISOString().split("T")[0],
                      end: end.toISOString().split("T")[0],
                    },
                  }))
                }}
              >
                Next Month
              </Button>
            </div>

            {/* Day Selection */}
            <div>
              <Label className="mb-3 block">Select Days</Label>
              <div className="grid grid-cols-4 gap-3">
                {weekdays.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      checked={bulkSettings.selectedDays.includes(day.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setBulkSettings((prev) => ({
                            ...prev,
                            selectedDays: [...prev.selectedDays, day.value],
                          }))
                        } else {
                          setBulkSettings((prev) => ({
                            ...prev,
                            selectedDays: prev.selectedDays.filter((d) => d !== day.value),
                          }))
                        }
                      }}
                    />
                    <Label className="text-sm">{day.label}</Label>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setBulkSettings((prev) => ({
                      ...prev,
                      selectedDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
                    }))
                  }
                >
                  Weekdays Only
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setBulkSettings((prev) => ({
                      ...prev,
                      selectedDays: ["saturday", "sunday"],
                    }))
                  }
                >
                  Weekends Only
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setBulkSettings((prev) => ({
                      ...prev,
                      selectedDays: weekdays.map((d) => d.value),
                    }))
                  }
                >
                  All Days
                </Button>
              </div>
            </div>

            {/* Slot Type Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Slot Type</Label>
                <Select
                  value={bulkSettings.slotType}
                  onValueChange={(value) =>
                    setBulkSettings((prev) => ({
                      ...prev,
                      slotType: value as any,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="both">Both (Business & Student)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Session Type</Label>
                <Select
                  value={bulkSettings.sessionType}
                  onValueChange={(value) =>
                    setBulkSettings((prev) => ({
                      ...prev,
                      sessionType: value as any,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Time Window */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={bulkSettings.timeWindow.start}
                  onChange={(e) =>
                    setBulkSettings((prev) => ({
                      ...prev,
                      timeWindow: { ...prev.timeWindow, start: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={bulkSettings.timeWindow.end}
                  onChange={(e) =>
                    setBulkSettings((prev) => ({
                      ...prev,
                      timeWindow: { ...prev.timeWindow, end: e.target.value },
                    }))
                  }
                />
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Slots will be created every 30 minutes between the start and end times.
            </p>

            <div className="flex gap-3">
              <Button onClick={generateBulkSlots} className="btn-primary">
                <Eye className="w-4 h-4 mr-2" />
                Preview Slots
              </Button>
              <Button onClick={() => setIsBulkCreating(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showPreview && (
        <Card className="card-calm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Preview Generated Slots ({previewSlots.length} slots)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {previewSlots.some((slot) =>
              slots.some(
                (existing) =>
                  existing.date === slot.date && existing.time === slot.time && existing.slot_type === slot.slot_type,
              ),
            ) && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">Warning: Some slots conflict with existing appointments</span>
              </div>
            )}

            <div className="max-h-60 overflow-y-auto space-y-2">
              {previewSlots.slice(0, 10).map((slot) => {
                const isAppointmentConflict = slot.id.startsWith('conflict-appointment-')
                const isSlotConflict = slot.id.startsWith('conflict-slot-')
                const hasConflict = isAppointmentConflict || isSlotConflict

                return (
                  <div key={slot.id} className={`flex items-center justify-between p-2 border rounded ${
                    hasConflict ? 'border-red-300 bg-red-50' : 'border-border'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {new Date(slot.date).toLocaleDateString()} - {slot.time}
                      </span>
                      {hasConflict && (
                        <Badge variant="destructive" className="text-xs">
                          {isAppointmentConflict ? 'Has Appointment' : 'Slot Exists'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{slot.slot_type}</Badge>
                      <Badge variant={slot.session_type === "paid" ? "default" : "secondary"} className="text-xs">
                        {slot.session_type === "paid" ? "Paid" : "Free"}
                      </Badge>
                    </div>
                  </div>
                )
              })}
              {previewSlots.length > 10 && (
                <p className="text-sm text-muted-foreground text-center">
                  ... and {previewSlots.length - 10} more slots
                </p>
              )}
            </div>

            {/* Conflict Summary */}
            {previewSlots.some(slot => slot.id.startsWith('conflict-')) && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Conflicts Detected</span>
                </div>
                <div className="text-sm text-yellow-700 space-y-1">
                  {previewSlots.filter(slot => slot.id.startsWith('conflict-appointment-')).length > 0 && (
                    <div>• {previewSlots.filter(slot => slot.id.startsWith('conflict-appointment-')).length} slots have existing appointments</div>
                  )}
                  {previewSlots.filter(slot => slot.id.startsWith('conflict-slot-')).length > 0 && (
                    <div>• {previewSlots.filter(slot => slot.id.startsWith('conflict-slot-')).length} slots already exist</div>
                  )}
                  <div className="mt-1 text-xs">Conflicting slots will be skipped during creation.</div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={confirmBulkCreation} className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create All Slots
              </Button>
              <Button onClick={() => setShowPreview(false)} variant="outline">
                Back to Edit
              </Button>
              <Button
                onClick={() => {
                  setShowPreview(false)
                  setIsBulkCreating(false)
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Selection Controls */}
      {slots.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-4">
            <Button onClick={selectAllSlots} variant="outline" size="sm">
              Select All ({slots.length})
            </Button>
            {selectedSlots.length > 0 && (
              <span className="text-sm text-muted-foreground">{selectedSlots.length} selected</span>
            )}
          </div>
          <div className="text-sm text-muted-foreground">Total slots: {slots.length}</div>
        </div>
      )}

      {isCreating && (
        <Card className="card-calm">
          <CardHeader>
            <CardTitle>Create New Slot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  min={getMinDateTime().minDate}
                  value={newSlot.date}
                  onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                />
              </div>
              <div>
                <Label>Time</Label>
                <Input
                  type="time"
                  min={newSlot.date === getMinDateTime().minDate ? getMinDateTime().minTime : "00:00"}
                  value={newSlot.time}
                  onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
                />
              </div>
              <div>
                <Label>Slot Type</Label>
                <Select
                  value={newSlot.slot_type}
                  onValueChange={(value) => setNewSlot({ ...newSlot, slot_type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Session Type</Label>
                <Select
                  value={newSlot.session_type}
                  onValueChange={(value) => setNewSlot({ ...newSlot, session_type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleCreateSlot} className="btn-primary">
                Create Slot
              </Button>
              <Button onClick={() => setIsCreating(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="student">Student</TabsTrigger>
          <TabsTrigger value="both">Both</TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getCategorySlots("business").map((slot) => (
              <SlotCard key={slot.id} slot={slot} />
            ))}
          </div>
          {getCategorySlots("business").length === 0 && (
            <Card className="card-calm">
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No business slots created yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="student" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getCategorySlots("student").map((slot) => (
              <SlotCard key={slot.id} slot={slot} />
            ))}
          </div>
          {getCategorySlots("student").length === 0 && (
            <Card className="card-calm">
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No student slots created yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="both" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getCategorySlots("both").map((slot) => (
              <SlotCard key={slot.id} slot={slot} />
            ))}
          </div>
          {getCategorySlots("both").length === 0 && (
            <Card className="card-calm">
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No shared slots created yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
