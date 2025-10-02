"use client"

import { supabase } from "@/lib/supabase"

export interface QuickReply {
  id: string
  message: string
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateQuickReplyData {
  message: string
  order_index?: number
  is_active?: boolean
}

export interface UpdateQuickReplyData {
  message?: string
  order_index?: number
  is_active?: boolean
}

// Fetch all quick replies for admin (including inactive)
export const fetchAllQuickReplies = async () => {
  try {
    console.log('📥 Fetching all quick replies...')

    const { data: replies, error } = await supabase
      .from('quick_replies')
      .select('*')
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching quick replies:', error)
      throw new Error(error.message)
    }

    console.log('✅ Quick replies fetched successfully:', replies?.length || 0, 'replies')
    return { success: true, data: replies || [] }

  } catch (error: any) {
    console.error('❌ Failed to fetch quick replies:', error)
    return { success: false, error: error.message, data: [] }
  }
}

// Fetch active quick replies for chat widget
export const fetchActiveQuickReplies = async () => {
  try {
    console.log('📥 Fetching active quick replies...')

    const { data: replies, error } = await supabase
      .from('quick_replies')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching active quick replies:', error)
      throw new Error(error.message)
    }

    console.log('✅ Active quick replies fetched successfully:', replies?.length || 0, 'replies')
    return { success: true, data: replies || [] }

  } catch (error: any) {
    console.error('❌ Failed to fetch active quick replies:', error)
    return { success: false, error: error.message, data: [] }
  }
}

// Create a new quick reply
export const createQuickReply = async (data: CreateQuickReplyData) => {
  try {
    console.log('📝 Creating quick reply:', data)

    const { data: reply, error } = await supabase
      .from('quick_replies')
      .insert([
        {
          message: data.message,
          order_index: data.order_index ?? 0,
          is_active: data.is_active ?? true
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating quick reply:', error)
      throw new Error(error.message)
    }

    console.log('✅ Quick reply created successfully:', reply)
    return { success: true, data: reply }

  } catch (error: any) {
    console.error('❌ Failed to create quick reply:', error)
    return { success: false, error: error.message }
  }
}

// Update a quick reply
export const updateQuickReply = async (replyId: string, updates: UpdateQuickReplyData) => {
  try {
    console.log('🔄 Updating quick reply:', replyId, updates)

    const updateData: any = {
      ...updates,
      updated_at: new Date().toISOString()
    }

    const { data: reply, error } = await supabase
      .from('quick_replies')
      .update(updateData)
      .eq('id', replyId)
      .select()
      .single()

    if (error) {
      console.error('Error updating quick reply:', error)
      throw new Error(error.message)
    }

    console.log('✅ Quick reply updated successfully:', reply)
    return { success: true, data: reply }

  } catch (error: any) {
    console.error('❌ Failed to update quick reply:', error)
    return { success: false, error: error.message }
  }
}

// Delete a quick reply
export const deleteQuickReply = async (replyId: string) => {
  try {
    console.log('🗑️ Deleting quick reply:', replyId)

    const { error } = await supabase
      .from('quick_replies')
      .delete()
      .eq('id', replyId)

    if (error) {
      console.error('Error deleting quick reply:', error)
      throw new Error(error.message)
    }

    console.log('✅ Quick reply deleted successfully')
    return { success: true }

  } catch (error: any) {
    console.error('❌ Failed to delete quick reply:', error)
    return { success: false, error: error.message }
  }
}

// Reorder quick replies
export const reorderQuickReplies = async (replyIds: string[]) => {
  try {
    console.log('🔄 Reordering quick replies:', replyIds)

    const updates = replyIds.map((id, index) => 
      supabase
        .from('quick_replies')
        .update({ order_index: index + 1 })
        .eq('id', id)
    )

    await Promise.all(updates)

    console.log('✅ Quick replies reordered successfully')
    return { success: true }

  } catch (error: any) {
    console.error('❌ Failed to reorder quick replies:', error)
    return { success: false, error: error.message }
  }
}
