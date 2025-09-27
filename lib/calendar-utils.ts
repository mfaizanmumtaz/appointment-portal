export const formatTime = (time24: string) => {
  const [hours, minutes] = time24.split(':')
  const hour12 = parseInt(hours) % 12 || 12
  const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM'
  return `${hour12}:${minutes} ${ampm}`
}

export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

export interface TimeSlot {
  id: string
  date: string
  time: string
  is_available: boolean
  slot_type: "business" | "student" | "both"
  session_type: "free" | "paid"
}

export interface BookingStats {
  totalBookings: number
  pendingApprovals: number
}

export const fetchTimeSlots = async (
  slotTypeFilter: string[],
  sessionTypeFilter?: "free" | "paid"
) => {
  try {
    const { supabase } = await import("@/lib/supabase")

    const today = new Date().toISOString().split('T')[0]

    let query = supabase
      .from('time_slots')
      .select('*')
      .gte('date', today)
      .in('slot_type', slotTypeFilter)
      .order('date', { ascending: true })
      .order('time', { ascending: true })

    if (sessionTypeFilter) {
      query = query.eq('session_type', sessionTypeFilter)
    }

    const { data: slots, error } = await query

    if (error) {
      console.error('Error fetching slots:', error)
      return []
    }

    return slots || []
  } catch (error) {
    console.error('Error:', error)
    return []
  }
}

export const fetchBookingStats = async (type: 'business' | 'student') => {
  try {
    const { supabase } = await import("@/lib/supabase")

    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*')
      .gte('date', weekStart.toISOString().split('T')[0])
      .eq('type', type)

    if (error) {
      console.error('Error fetching appointments:', error)
      return { totalBookings: 0, pendingApprovals: 0 }
    }

    const pending = appointments?.filter(a => a.status === 'pending') || []

    return {
      totalBookings: appointments?.length || 0,
      pendingApprovals: pending.length
    }
  } catch (error) {
    console.error('Error:', error)
    return { totalBookings: 0, pendingApprovals: 0 }
  }
}