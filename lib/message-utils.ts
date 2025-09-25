"use client"

import { supabase } from "@/lib/supabase"
import type { InstantMessage, MessageStatus } from "@/lib/types/database"

export interface CreateMessageData {
  name: string
  email: string
  phone?: string
  message: string
}

export interface UpdateMessageData {
  status?: MessageStatus
  admin_reply?: string
  replied_at?: string
}

// Create a new instant message
export const createInstantMessage = async (data: CreateMessageData) => {
  try {
    console.log('📝 Creating instant message:', data)

    const { data: message, error } = await supabase
      .from('instant_messages')
      .insert([
        {
          name: data.name,
          email: data.email,
          phone: data.phone,
          message: data.message,
          status: 'unread' as MessageStatus
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating message:', error)
      throw new Error(error.message)
    }

    console.log('✅ Message created successfully:', message)
    return { success: true, data: message }

  } catch (error) {
    console.error('❌ Failed to create message:', error)
    return { success: false, error: error.message }
  }
}

// Fetch all instant messages for admin
export const fetchInstantMessages = async () => {
  try {
    console.log('📥 Fetching instant messages...')

    const { data: messages, error } = await supabase
      .from('instant_messages')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching messages:', error)
      throw new Error(error.message)
    }

    console.log('✅ Messages fetched successfully:', messages?.length || 0, 'messages')
    return { success: true, data: messages || [] }

  } catch (error) {
    console.error('❌ Failed to fetch messages:', error)
    return { success: false, error: error.message, data: [] }
  }
}

// Update message status or add admin reply
export const updateInstantMessage = async (messageId: string, updates: UpdateMessageData) => {
  try {
    console.log('🔄 Updating message:', messageId, updates)

    const updateData: any = {
      ...updates
    }

    // If replying, set replied_at timestamp and status
    if (updates.admin_reply) {
      updateData.replied_at = new Date().toISOString()
      updateData.status = 'replied'
    }

    const { data: message, error } = await supabase
      .from('instant_messages')
      .update(updateData)
      .eq('id', messageId)
      .select()
      .single()

    if (error) {
      console.error('Error updating message:', error)
      throw new Error(error.message)
    }

    console.log('✅ Message updated successfully:', message)
    return { success: true, data: message }

  } catch (error) {
    console.error('❌ Failed to update message:', error)
    return { success: false, error: error.message }
  }
}

// Mark message as read
export const markMessageAsRead = async (messageId: string) => {
  return updateInstantMessage(messageId, { status: 'read' })
}

// Get unread messages count
export const getUnreadMessagesCount = async () => {
  try {
    const { count, error } = await supabase
      .from('instant_messages')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'unread')

    if (error) {
      console.error('Error getting unread count:', error)
      return { success: false, count: 0 }
    }

    return { success: true, count: count || 0 }

  } catch (error) {
    console.error('❌ Failed to get unread count:', error)
    return { success: false, count: 0 }
  }
}

// Subscribe to real-time message updates
export const subscribeToMessages = (callback: (payload: any) => void) => {
  console.log('🔄 Setting up real-time subscription for messages...')
  
  const subscription = supabase
    .channel('instant-messages')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'instant_messages'
    }, callback)
    .subscribe()

  return subscription
}
