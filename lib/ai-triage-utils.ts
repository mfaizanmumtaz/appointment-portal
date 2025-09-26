"use client"

import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/types/database"

export interface StudentTriageData {
  name: string
  email: string
  phone: string
  purpose: string
}

export interface TriageResult {
  decision: 'approved' | 'declined' | 'uncertain'
  reasoning: string
  confidence: number
}

export interface TriageResponse {
  success: boolean
  result: TriageResult
  error?: string
  student?: {
    name: string
    email: string
  }
}

/**
 * Call the AI triage edge function to evaluate a student's mentorship request
 */
export const evaluateStudentRequest = async (studentData: StudentTriageData): Promise<TriageResponse> => {
  try {
    console.log('🤖 Sending student request for AI evaluation:', studentData.name)

    const { data, error } = await supabase.functions.invoke('ai-triage-student', {
      body: {
        name: studentData.name,
        email: studentData.email,
        phone: studentData.phone,
        purpose: studentData.purpose
      }
    })

    if (error) {
      console.error('Edge function error:', error)
      throw new Error(error.message || 'AI triage service unavailable')
    }

    if (!data) {
      throw new Error('No response from AI triage service')
    }

    console.log('✅ AI Triage completed:', data.result?.decision)
    return data as TriageResponse

  } catch (error) {
    console.error('❌ AI triage evaluation failed:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'AI evaluation failed'
    
    // Return a fallback response to keep user flow working
    return {
      success: false,
      error: errorMessage,
      result: {
        decision: 'uncertain',
        reasoning: 'AI evaluation temporarily unavailable. Your request will be reviewed manually by our team.',
        confidence: 0.5
      }
    }
  }
}

/**
 * Save triage result to database for admin review and analytics
 */
export const saveTriageResult = async (
  studentData: StudentTriageData, 
  triageResult: TriageResult
) => {
  try {
    console.log('💾 Saving triage result to database')

    const insertData = {
      student_name: studentData.name,
      student_email: studentData.email,
      student_phone: studentData.phone,
      purpose: studentData.purpose,
      ai_decision: triageResult.decision,
      ai_reasoning: triageResult.reasoning,
      ai_confidence: triageResult.confidence,
      manual_review: false
    }

    const { error } = await supabase
      .from('student_triage_log')
      .insert(insertData as any)

    if (error) {
      console.error('Error saving triage result:', error)
      // Don't throw error - this is just for logging
    } else {
      console.log('✅ Triage result saved to database')
    }

  } catch (error) {
    console.error('Failed to save triage result:', error)
    // Don't throw error - this is just for logging
  }
}

/**
 * Format the AI reasoning for display to users
 */
export const formatTriageReasoning = (reasoning: string): string => {
  // Clean up the reasoning text for user display
  return reasoning
    .replace(/✅|❌|🤔/g, '') // Remove emojis
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

/**
 * Get user-friendly message based on triage decision
 */
export const getTriageMessage = (decision: 'approved' | 'declined' | 'uncertain'): string => {
  switch (decision) {
    case 'approved':
      return 'Great! Your request has been approved. You can now select a time slot for your free mentorship session.'
    
    case 'declined':
      return 'Thank you for your interest. Due to limited availability and session focus, this request cannot be approved for a free session. You can still get guidance through our paid consultation options.'
    
    case 'uncertain':
      return 'Your request is under review. Our team will evaluate it manually and get back to you via email within 24 hours.'
    
    default:
      return 'Your request is being processed. Please check back later.'
  }
}
