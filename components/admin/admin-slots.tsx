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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar, Clock, DollarSign, Users, Plus, Edit, Trash2, CalendarDays, Eye, AlertTriangle, RefreshCw } from "lucide-react"
import { useOffline } from "@/hooks/use-offline"
import { OfflineStatus, ErrorBanner } from "@/components/ui/offline-status"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
  const { toast } = useToast()
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, slotId?: string, count?: number, type: 'single' | 'bulk'}>({isOpen: false, type: 'single'})

  const {
    isOnline,
    error,
    lastUpdated,
    isRefreshing,
    setLastUpdated,
    setIsRefreshing,
    executeWithOfflineCheck
  } = useOffline({ autoRefresh: false, refreshInterval: 30000 })
  const [showPreview, setShowPreview] = useState(false)
  const [selectedSlots, setSelectedSlots] = useState<string[]>([])
  const [previewSlots, setPreviewSlots] = useState<TimeSlot[]>([])
  const [conflictResolution, setConflictResolution] = useState<'skip' | 'delete-and-create'>('skip')

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
    executeWithOfflineCheck(fetchSlots)
  }, [])

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    await executeWithOfflineCheck(fetchSlots)
    setIsRefreshing(false)
  }

  const fetchSlots = async () => {
    setLoading(true)

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
    setLastUpdated(new Date())
    setLoading(false)
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
    console.log('handleCreateSlot called with:', newSlot)
    try {
      // Validate that slot is not in the past
      const now = new Date()
      const slotDateTime = new Date(`${newSlot.date}T${newSlot.time}`)

      if (slotDateTime <= now) {
        toast({
          title: "Invalid Time",
          description: "Cannot create slots in the past. Please select a future date and time.",
          variant: "destructive"
        })
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
        toast({
          title: "Slot Already Exists",
          description: `A ${newSlot.slot_type} ${newSlot.session_type} slot already exists for ${newSlot.date} at ${newSlot.time}!`,
          variant: "destructive"
        })
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
          toast({
            title: "Duplicate Slot",
            description: "A slot with this date, time, and type already exists!",
            variant: "destructive"
          })
        } else {
          toast({
            title: "Error Creating Slot",
            description: error.message,
            variant: "destructive"
          })
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
      toast({
        title: "Success",
        description: "Slot created successfully!",
        variant: "default"
      })
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "Failed to create slot",
        variant: "destructive"
      })
    }
  }

  const handleDeleteSlot = async (id: string) => {
    setDeleteConfirm({isOpen: true, slotId: id, type: 'single'})
  }

  const confirmDeleteSlot = async () => {
    const id = deleteConfirm.slotId
    if (!id) return

    setDeleteConfirm({isOpen: false, type: 'single'})

    try {
      const { supabase } = await import("@/lib/supabase")

      // Get the slot details first to clean up related triage logs
      const { data: slotData } = await supabase
        .from('time_slots')
        .select('date, time')
        .eq('id', id)
        .single()

      // Delete the slot first
      const { error: slotError } = await supabase
        .from('time_slots')
        .delete()
        .eq('id', id)

      if (slotError) {
        console.error('Error deleting slot:', slotError)
        toast({
          title: "Error Deleting Slot",
          description: slotError.message,
          variant: "destructive"
        })
        return
      }

      // Clean up related AI triage logs if slot existed
      if (slotData) {
        const { error: triageError } = await supabase
          .from('student_triage_log')
          .delete()
          .eq('created_at', slotData.date) // Clean up triage logs from the same date

        if (triageError) {
          console.warn('Warning: Could not clean up some triage logs:', triageError)
          // Don't fail the operation for this
        }
      }

      setSlots(slots.filter((slot) => slot.id !== id))
      toast({
        title: "Success",
        description: "Slot and related data deleted successfully!",
        variant: "default"
      })
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "Failed to delete slot",
        variant: "destructive"
      })
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
        toast({
          title: "Invalid Date Range",
          description: "Start date must be before end date",
          variant: "destructive"
        })
        return
      }

      if (bulkSettings.selectedDays.length === 0) {
        toast({
          title: "No Days Selected",
          description: "Please select at least one day",
          variant: "destructive"
        })
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

      if (generatedSlots.length > 0) {
        // Check existing appointments using date range to avoid URL length issues
        const startDate = new Date(bulkSettings.dateRange.start)
        const endDate = new Date(bulkSettings.dateRange.end)

        const { data: existingAppointments } = await supabase
          .from('appointments')
          .select('date, time, status')
          .gte('date', startDate.toISOString().split('T')[0])
          .lte('date', endDate.toISOString().split('T')[0])
          .in('status', ['confirmed', 'pending'])

        const appointmentConflicts = new Set(
          existingAppointments?.map(apt => `${apt.date}-${apt.time}`) || []
        )

        // Check existing slots using date range and then filter in memory for better performance
        const { data: existingSlots } = await supabase
          .from('time_slots')
          .select('date, time, slot_type, session_type')
          .gte('date', startDate.toISOString().split('T')[0])
          .lte('date', endDate.toISOString().split('T')[0])

        const slotConflicts = new Set()
        if (existingSlots) {
          for (const existingSlot of existingSlots) {
            slotConflicts.add(`${existingSlot.date}-${existingSlot.time}-${existingSlot.slot_type}-${existingSlot.session_type}`)
          }
        }

        // Mark conflicts in generated slots
        generatedSlots.forEach(slot => {
          const timeKey = `${slot.date}-${slot.time}`
          const exactSlotKey = `${slot.date}-${slot.time}-${slot.slot_type}-${slot.session_type}`

          if (appointmentConflicts.has(timeKey)) {
            slot.id = `conflict-appointment-${slot.id}`
          } else if (slotConflicts.has(exactSlotKey)) {
            slot.id = `conflict-slot-${slot.id}`
          }
        })
      }

      // Filter out any slots in the past
      const futureSlots = filterFutureDates(generatedSlots)

      setPreviewSlots(futureSlots)
      setShowPreview(true)
      setConflictResolution('skip') // Reset to default option

      if (futureSlots.length < generatedSlots.length) {
        const pastCount = generatedSlots.length - futureSlots.length
        toast({
          title: "Past Slots Filtered",
          description: `Filtered out ${pastCount} slots that would be in the past. Showing ${futureSlots.length} future slots.`,
          variant: "default"
        })
      }
    } catch (error) {
      console.error("Error generating bulk slots:", error)
      toast({
        title: "Error Generating Slots",
        description: "Please check your settings and try again.",
        variant: "destructive"
      })
    }
  }

  const confirmBulkCreation = async () => {
    try {
      const { supabase } = await import("@/lib/supabase")

      // Check for existing appointments that would conflict using date range
      const startDate = previewSlots.reduce((min, slot) =>
        slot.date < min ? slot.date : min, previewSlots[0]?.date || ''
      )
      const endDate = previewSlots.reduce((max, slot) =>
        slot.date > max ? slot.date : max, previewSlots[0]?.date || ''
      )

      const { data: existingAppointments } = await supabase
        .from('appointments')
        .select('date, time, status')
        .gte('date', startDate)
        .lte('date', endDate)
        .in('status', ['confirmed', 'pending'])

      // Check for existing time slots using date range approach for better performance
      const { data: allExistingSlots } = await supabase
        .from('time_slots')
        .select('id, date, time, slot_type, session_type')
        .gte('date', startDate)
        .lte('date', endDate)

      // Filter to only slots that exactly match our preview slots
      const existingSlots = []
      if (allExistingSlots) {
        for (const previewSlot of previewSlots) {
          const matchingSlot = allExistingSlots.find(existing =>
            existing.date === previewSlot.date &&
            existing.time === previewSlot.time &&
            existing.slot_type === previewSlot.slot_type &&
            existing.session_type === previewSlot.session_type
          )
          if (matchingSlot) {
            existingSlots.push(matchingSlot)
          }
        }
      }

      // Filter out slots that have confirmed/pending appointments
      const appointmentConflicts = new Set(
        existingAppointments?.map(apt => `${apt.date}-${apt.time}`) || []
      )

      // Filter out slots that already exist (exact match on date, time, slot_type, session_type)
      const slotConflicts = new Set(
        existingSlots?.map(slot => `${slot.date}-${slot.time}-${slot.slot_type}-${slot.session_type}`) || []
      )

      // If delete-and-create is selected, delete conflicting slots first
      if (conflictResolution === 'delete-and-create' && existingSlots && existingSlots.length > 0) {
        const conflictingSlotIds = existingSlots
          .filter(existingSlot => {
            const timeKey = `${existingSlot.date}-${existingSlot.time}`
            const exactSlotKey = `${existingSlot.date}-${existingSlot.time}-${existingSlot.slot_type}-${existingSlot.session_type}`
            return previewSlots.some(previewSlot => {
              const previewExactKey = `${previewSlot.date}-${previewSlot.time}-${previewSlot.slot_type}-${previewSlot.session_type}`
              return previewExactKey === exactSlotKey && !appointmentConflicts.has(timeKey)
            })
          })
          .map(slot => slot.id)

        if (conflictingSlotIds.length > 0) {
          const { error: deleteError } = await supabase
            .from('time_slots')
            .delete()
            .in('id', conflictingSlotIds)

          if (deleteError) {
            console.error('Error deleting conflicting slots:', deleteError)
            toast({
              title: "Error Deleting Conflicting Slots",
              description: deleteError.message,
              variant: "destructive"
            })
            return
          }

          // Remove deleted slots from local state
          setSlots(prev => prev.filter(slot => !conflictingSlotIds.includes(slot.id)))

          toast({
            title: "Conflicting Slots Deleted",
            description: `Deleted ${conflictingSlotIds.length} existing conflicting slots.`,
            variant: "default"
          })
        }
      }

      // Determine which slots to insert
      let slotsToInsert
      if (conflictResolution === 'delete-and-create') {
        // Include all slots that don't have appointment conflicts
        slotsToInsert = previewSlots
          .filter(slot => {
            const appointmentKey = `${slot.date}-${slot.time}`
            return !appointmentConflicts.has(appointmentKey)
          })
          .map(slot => ({
            date: slot.date,
            time: slot.time,
            is_available: true,
            slot_type: slot.slot_type,
            session_type: slot.session_type,
          }))
      } else {
        // Skip both appointment and slot conflicts
        slotsToInsert = previewSlots
          .filter(slot => {
            const timeKey = `${slot.date}-${slot.time}`
            const exactSlotKey = `${slot.date}-${slot.time}-${slot.slot_type}-${slot.session_type}`
            return !appointmentConflicts.has(timeKey) && !slotConflicts.has(exactSlotKey)
          })
          .map(slot => ({
            date: slot.date,
            time: slot.time,
            is_available: true,
            slot_type: slot.slot_type,
            session_type: slot.session_type,
          }))
      }

      if (slotsToInsert.length === 0) {
        const appointmentCount = previewSlots.filter(slot =>
          appointmentConflicts.has(`${slot.date}-${slot.time}`)
        ).length
        const duplicateCount = previewSlots.filter(slot =>
          slotConflicts.has(`${slot.date}-${slot.time}`)
        ).length

        let message = 'No new slots to create!'
        if (appointmentCount > 0) {
          message += ` ${appointmentCount} slots skipped due to existing appointments.`
        }
        if (duplicateCount > 0 && conflictResolution === 'skip') {
          message += ` ${duplicateCount} slots already exist.`
        }
        toast({
          title: "No Slots to Create",
          description: message,
          variant: "destructive"
        })
        return
      }

      // Insert new slots one by one to handle any remaining conflicts gracefully
      const insertedSlots = []
      const insertErrors = []

      for (const slotData of slotsToInsert) {
        try {
          const { data: insertedSlot, error: insertError } = await supabase
            .from('time_slots')
            .insert(slotData)
            .select()
            .single()

          if (insertError) {
            if (insertError.message.includes('duplicate key value') || insertError.message.includes('unique constraint')) {
              // Skip duplicate slots silently
              console.log(`Skipping duplicate slot: ${slotData.date} ${slotData.time} ${slotData.slot_type} ${slotData.session_type}`)
            } else {
              insertErrors.push(`${slotData.date} ${slotData.time}: ${insertError.message}`)
            }
          } else if (insertedSlot) {
            insertedSlots.push(insertedSlot)
          }
        } catch (err) {
          console.error('Error inserting slot:', err)
          insertErrors.push(`${slotData.date} ${slotData.time}: ${err.message || 'Unknown error'}`)
        }
      }

      if (insertErrors.length > 0) {
        console.warn('Some slots failed to insert:', insertErrors)
      }

      const data = insertedSlots
      const error = insertErrors.length === slotsToInsert.length ? new Error('All slots failed to insert') : null

      if (error) {
        console.error('Error creating bulk slots:', error)
        toast({
          title: "Error Creating Bulk Slots",
          description: error.message,
          variant: "destructive"
        })
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
      if (duplicateConflictCount > 0 && conflictResolution === 'skip') {
        message += ` (Skipped ${duplicateConflictCount} duplicate slots)`
      }
      if (insertErrors.length > 0) {
        message += ` (${insertErrors.length} slots had insertion issues - check console for details)`
      }

      setSlots([...slots, ...(data || [])])
      setPreviewSlots([])
      setShowPreview(false)
      setIsBulkCreating(false)
      toast({
        title: "Bulk Creation Successful",
        description: message,
        variant: "default"
      })

      // Refresh slots to get current state
      fetchSlots()
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "Failed to create bulk slots",
        variant: "destructive"
      })
    }
  }

  const bulkDeleteSelected = async () => {
    setDeleteConfirm({isOpen: true, count: selectedSlots.length, type: 'bulk'})
  }

  const confirmBulkDelete = async () => {
    setDeleteConfirm({isOpen: false, type: 'bulk'})

    try {
      const { supabase } = await import("@/lib/supabase")

      // Get date range of slots being deleted to clean up triage logs
      const slotsToDelete = slots.filter((slot) => selectedSlots.includes(slot.id))
      const dateRange = slotsToDelete.map(slot => slot.date)
      const minDate = Math.min(...dateRange.map(date => new Date(date).getTime()))
      const maxDate = Math.max(...dateRange.map(date => new Date(date).getTime()))

      // Delete the slots first
      const { error: slotsError } = await supabase
        .from('time_slots')
        .delete()
        .in('id', selectedSlots)

      if (slotsError) {
        console.error('Error bulk deleting slots:', slotsError)
        toast({
          title: "Error Deleting Slots",
          description: slotsError.message,
          variant: "destructive"
        })
        return
      }

      // Clean up AI triage logs in the date range of deleted slots
      if (dateRange.length > 0) {
        const startDate = new Date(minDate).toISOString().split('T')[0]
        const endDate = new Date(maxDate).toISOString().split('T')[0]

        const { error: triageError } = await supabase
          .from('student_triage_log')
          .delete()
          .gte('created_at', startDate)
          .lte('created_at', endDate + 'T23:59:59.999Z')

        if (triageError) {
          console.warn('Warning: Could not clean up some triage logs:', triageError)
          // Don't fail the operation for this
        }
      }

      const deletedCount = selectedSlots.length
      setSlots(slots.filter((slot) => !selectedSlots.includes(slot.id)))
      setSelectedSlots([])
      toast({
        title: "Success",
        description: `Successfully deleted ${deletedCount} slots and related data!`,
        variant: "default"
      })
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "Failed to delete slots",
        variant: "destructive"
      })
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
          <OfflineStatus
            isOnline={isOnline}
            error={error}
            lastUpdated={lastUpdated}
            isRefreshing={isRefreshing}
            onRefresh={handleManualRefresh}
            showRefreshButton={true}
          />
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

      <ErrorBanner error={error} />

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

            {/* Conflict Summary and Resolution */}
            {previewSlots.some(slot => slot.id.startsWith('conflict-')) && (
              <div className="mt-4 space-y-4">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">Conflicts Detected</span>
                  </div>
                  <div className="text-sm text-yellow-700 space-y-1">
                    {previewSlots.filter(slot => slot.id.startsWith('conflict-appointment-')).length > 0 && (
                      <div>• {previewSlots.filter(slot => slot.id.startsWith('conflict-appointment-')).length} slots have existing appointments (cannot be deleted)</div>
                    )}
                    {previewSlots.filter(slot => slot.id.startsWith('conflict-slot-')).length > 0 && (
                      <div>• {previewSlots.filter(slot => slot.id.startsWith('conflict-slot-')).length} slots already exist</div>
                    )}
                  </div>
                </div>

                {/* Conflict Resolution Options */}
                {previewSlots.filter(slot => slot.id.startsWith('conflict-slot-')).length > 0 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Label className="text-sm font-medium text-blue-800 mb-3 block">
                      How would you like to handle existing slot conflicts?
                    </Label>
                    <RadioGroup
                      value={conflictResolution}
                      onValueChange={(value: 'skip' | 'delete-and-create') => setConflictResolution(value)}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="skip" id="skip" />
                        <Label htmlFor="skip" className="text-sm text-blue-700">
                          Skip conflicting slots (safer option)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="delete-and-create" id="delete-and-create" />
                        <Label htmlFor="delete-and-create" className="text-sm text-blue-700">
                          Delete existing slots and create new ones (⚠️ will permanently delete {previewSlots.filter(slot => slot.id.startsWith('conflict-slot-')).length} existing slots)
                        </Label>
                      </div>
                    </RadioGroup>
                    <div className="mt-2 text-xs text-blue-600">
                      Note: Slots with existing appointments will always be skipped to prevent data loss.
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={confirmBulkCreation} className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                {conflictResolution === 'delete-and-create' && previewSlots.some(slot => slot.id.startsWith('conflict-slot-'))
                  ? 'Delete Conflicts & Create All Slots'
                  : 'Create All Slots'
                }
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm.isOpen} onOpenChange={(open) => setDeleteConfirm({...deleteConfirm, isOpen: open})}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteConfirm.type === 'single' ? 'Delete Slot' : 'Delete Multiple Slots'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirm.type === 'single'
                ? 'Delete this slot? WARNING: This will also cancel any related appointments automatically.'
                : `Delete ${deleteConfirm.count} selected slots? WARNING: This will also cancel any related appointments automatically.`
              }
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteConfirm.type === 'single' ? confirmDeleteSlot : confirmBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
