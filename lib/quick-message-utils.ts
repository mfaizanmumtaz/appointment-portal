"use client"

import { supabase } from "@/lib/supabase"

export interface AdminQuickMessage {
  id: string
  message: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// Fetch all active quick messages
export const fetchQuickMessages = async () => {
  try {
    console.log('📥 Fetching quick messages...')

    const { data: messages, error } = await supabase
      .from('admin_quick_messages')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching quick messages:', error)
      throw new Error(error.message)
    }

    console.log('✅ Quick messages fetched successfully:', messages?.length || 0, 'messages')
    return { success: true, data: messages || [] }

  } catch (error) {
    console.error('❌ Failed to fetch quick messages:', error)
    return { success: false, error: error.message, data: [] }
  }
}

// Save quick messages (replace all)
export const saveQuickMessages = async (messages: string[]) => {
  try {
    console.log('💾 Saving quick messages...', messages)

    // First, delete all existing messages
    const { error: deleteError } = await supabase
      .from('admin_quick_messages')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (deleteError) {
      console.error('Error deleting existing quick messages:', deleteError)
      throw new Error(deleteError.message)
    }

    // Insert new messages
    const messagesToInsert = messages
      .filter(msg => msg.trim().length > 0) // Filter out empty messages
      .map((message, index) => ({
        message: message.trim(),
        sort_order: index + 1,
        is_active: true
      }))

    if (messagesToInsert.length > 0) {
      const { data, error: insertError } = await supabase
        .from('admin_quick_messages')
        .insert(messagesToInsert)
        .select()

      if (insertError) {
        console.error('Error inserting quick messages:', insertError)
        throw new Error(insertError.message)
      }

      console.log('✅ Quick messages saved successfully:', data?.length || 0, 'messages')
      return { success: true, data: data || [] }
    } else {
      console.log('✅ No valid messages to save')
      return { success: true, data: [] }
    }

  } catch (error) {
    console.error('❌ Failed to save quick messages:', error)
    return { success: false, error: error.message }
  }
}

// Add a new quick message
export const addQuickMessage = async (message: string) => {
  try {
    console.log('➕ Adding quick message:', message)

    // Get the highest sort order
    const { data: maxData, error: maxError } = await supabase
      .from('admin_quick_messages')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)

    if (maxError) {
      console.error('Error getting max sort order:', maxError)
      throw new Error(maxError.message)
    }

    const maxSortOrder = maxData?.[0]?.sort_order || 0

    const { data, error } = await supabase
      .from('admin_quick_messages')
      .insert([{
        message: message.trim(),
        sort_order: maxSortOrder + 1,
        is_active: true
      }])
      .select()
      .single()

    if (error) {
      console.error('Error adding quick message:', error)
      throw new Error(error.message)
    }

    console.log('✅ Quick message added successfully:', data)
    return { success: true, data }

  } catch (error) {
    console.error('❌ Failed to add quick message:', error)
    return { success: false, error: error.message }
  }
}

// Update a quick message
export const updateQuickMessage = async (id: string, message: string) => {
  try {
    console.log('🔄 Updating quick message:', id, message)

    const { data, error } = await supabase
      .from('admin_quick_messages')
      .update({
        message: message.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating quick message:', error)
      throw new Error(error.message)
    }

    console.log('✅ Quick message updated successfully:', data)
    return { success: true, data }

  } catch (error) {
    console.error('❌ Failed to update quick message:', error)
    return { success: false, error: error.message }
  }
}

// Delete a quick message
export const deleteQuickMessage = async (id: string) => {
  try {
    console.log('🗑️ Deleting quick message:', id)

    const { error } = await supabase
      .from('admin_quick_messages')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting quick message:', error)
      throw new Error(error.message)
    }

    console.log('✅ Quick message deleted successfully')
    return { success: true }

  } catch (error) {
    console.error('❌ Failed to delete quick message:', error)
    return { success: false, error: error.message }
  }
}

// Subscribe to real-time quick message updates
export const subscribeToQuickMessages = (callback: (payload: any) => void) => {
  console.log('🔄 Setting up real-time subscription for quick messages...')
  
  const subscription = supabase
    .channel('admin-quick-messages')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'admin_quick_messages'
    }, callback)
    .subscribe()

  return subscription
}
