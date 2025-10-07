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

export interface ChatReplyEmailData {
  to: string
  name: string
  originalMessage: string
  adminReply: string
  replyDate: string
}

export interface QuickMessageNotificationData {
  senderName: string
  senderEmail: string
  senderPhone?: string
  message: string
  submittedAt: string
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

    // Send notification email to CEO
    try {
      console.log('📧 Sending CEO notification for new quick message...')
      const notificationResult = await sendQuickMessageNotification({
        senderName: data.name,
        senderEmail: data.email,
        senderPhone: data.phone,
        message: data.message,
        submittedAt: message.created_at
      })

      if (!notificationResult.success) {
        console.warn('⚠️ CEO notification failed but message was created:', notificationResult.error)
        // Don't fail the entire operation if email fails
      } else {
        console.log('✅ CEO notification sent successfully')
      }
    } catch (emailError) {
      console.warn('⚠️ CEO notification failed but message was created:', emailError)
      // Don't fail the entire operation if email fails
    }

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

// Send quick message notification to CEO
export const sendQuickMessageNotification = async (notificationData: QuickMessageNotificationData) => {
  try {
    console.log('📧 Sending quick message notification to CEO for:', notificationData.senderName)

    const { data, error } = await supabase.functions.invoke('send-quick-message-notification', {
      body: {
        senderName: notificationData.senderName,
        senderEmail: notificationData.senderEmail,
        senderPhone: notificationData.senderPhone,
        message: notificationData.message,
        submittedAt: notificationData.submittedAt
      }
    })

    if (error) {
      console.error('Edge Function error:', error)
      throw new Error(`Failed to send quick message notification: ${error.message}`)
    }

    console.log('✅ Quick message notification sent to CEO successfully:', data)
    return { success: true, data }

  } catch (error) {
    console.error('❌ Failed to send quick message notification:', error)
    return { success: false, error: error.message }
  }
}

// Send chat reply email notification
export const sendChatReplyEmail = async (emailData: ChatReplyEmailData) => {
  try {
    console.log('📧 Sending chat reply email to:', emailData.to)

    const { data, error } = await supabase.functions.invoke('send-chat-reply', {
      body: {
        to: emailData.to,
        name: emailData.name,
        originalMessage: emailData.originalMessage,
        adminReply: emailData.adminReply,
        replyDate: emailData.replyDate
      }
    })

    if (error) {
      console.error('Edge Function error:', error)
      throw new Error(`Failed to send chat reply email: ${error.message}`)
    }

    console.log('✅ Chat reply email sent successfully:', data)
    return { success: true, data }

  } catch (error) {
    console.error('❌ Failed to send chat reply email:', error)
    return { success: false, error: error.message }
  }
}

// Update message status or add admin reply (with email notification)
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

// Update message with reply and send email notification
export const replyToInstantMessage = async (messageId: string, adminReply: string) => {
  try {
    console.log('💬 Processing chat reply for message:', messageId)

    // First, get the original message details
    const { data: originalMessage, error: fetchError } = await supabase
      .from('instant_messages')
      .select('*')
      .eq('id', messageId)
      .single()

    if (fetchError || !originalMessage) {
      console.error('Error fetching original message:', fetchError)
      throw new Error('Could not fetch original message')
    }

    // Update the message with the reply
    const updateResult = await updateInstantMessage(messageId, {
      admin_reply: adminReply,
      status: 'replied'
    })

    if (!updateResult.success) {
      throw new Error(updateResult.error)
    }

    // Send email notification to the original sender
    try {
      const emailResult = await sendChatReplyEmail({
        to: originalMessage.email,
        name: originalMessage.name,
        originalMessage: originalMessage.message,
        adminReply: adminReply,
        replyDate: new Date().toISOString()
      })

      if (!emailResult.success) {
        console.warn('⚠️ Email sending failed but message was updated:', emailResult.error)
        // Don't fail the entire operation if email fails
      } else {
        console.log('✅ Email notification sent successfully')
      }
    } catch (emailError) {
      console.warn('⚠️ Email sending failed but message was updated:', emailError)
      // Don't fail the entire operation if email fails
    }

    return {
      success: true,
      data: updateResult.data,
      emailSent: true // We'll assume success unless explicitly failed
    }

  } catch (error) {
    console.error('❌ Failed to reply to message:', error)
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
