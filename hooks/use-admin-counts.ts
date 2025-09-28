"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

interface AdminCounts {
  totalAppointments: number
  pendingRequests: number
  triageEntries: number
  unreadChats: number
  todaysSessions: number
  thisWeekSessions: number
}

export function useAdminCounts() {
  const [counts, setCounts] = useState<AdminCounts>({
    totalAppointments: 0,
    pendingRequests: 0,
    triageEntries: 0,
    unreadChats: 0,
    todaysSessions: 0,
    thisWeekSessions: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCounts = async () => {
    try {
      setError(null)

      // Get today's date range
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      // Get this week's date range (Monday to Sunday)
      const startOfWeek = new Date(today)
      const day = today.getDay()
      const diff = today.getDate() - day + (day === 0 ? -6 : 1) // Monday
      startOfWeek.setDate(diff)
      startOfWeek.setHours(0, 0, 0, 0)

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 7)

      // Fetch all counts in parallel
      const [
        appointmentsResult,
        pendingResult,
        triageResult,
        todayResult,
        weekResult
      ] = await Promise.all([
        // Total appointments (calendar badge)
        supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .in('status', ['pending', 'confirmed']),

        // Pending requests (requests queue badge)
        supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending'),

        // AI triage entries (triage badge)
        supabase
          .from('ai_triage_entries')
          .select('id', { count: 'exact', head: true }),

        // Today's sessions (quick stats)
        supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'confirmed')
          .gte('date', today.toISOString().split('T')[0])
          .lt('date', tomorrow.toISOString().split('T')[0]),

        // This week's sessions (quick stats)
        supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'confirmed')
          .gte('date', startOfWeek.toISOString().split('T')[0])
          .lt('date', endOfWeek.toISOString().split('T')[0])
      ])

      setCounts({
        totalAppointments: appointmentsResult.count || 0,
        pendingRequests: pendingResult.count || 0,
        triageEntries: triageResult.count || 0,
        unreadChats: 0, // Placeholder - implement if chat system has unread tracking
        todaysSessions: todayResult.count || 0,
        thisWeekSessions: weekResult.count || 0
      })

    } catch (err) {
      console.error('Error fetching admin counts:', err)
      setError('Failed to fetch counts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCounts()
  }, [])

  return { counts, loading, error, refetch: fetchCounts }
}