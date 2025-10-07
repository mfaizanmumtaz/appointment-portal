import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userMessage, adminReply } = await req.json()

    if (!userMessage || !adminReply) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: userMessage and adminReply' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize OpenAI with API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant helping to enhance and improve business communication messages. Your task is to:

1. Fix any grammar, spelling, or punctuation errors
2. Improve clarity and professional tone
3. Ensure the message is polite, helpful, and maintains the original intent
4. Keep the enhanced message concise but comprehensive
5. Maintain a warm, professional tone appropriate for business consultation services

Context: This is a reply from a CEO/business consultant to a client inquiry. The original user message provides context for what the client was asking about.

Important guidelines:
- Keep the core message and intent intact
- Make it sound more professional and polished
- Ensure proper business etiquette
- Fix any grammatical issues
- Improve sentence structure if needed
- Keep it concise but complete

Only return the enhanced message text, nothing else.`
          },
          {
            role: 'user',
            content: `Original client message: "${userMessage}"

CEO's draft reply: "${adminReply}"

Please enhance the CEO's reply to make it more professional, grammatically correct, and well-structured while maintaining the original intent and tone.`
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error('OpenAI API error:', errorText)
      throw new Error(`OpenAI API error: ${openaiResponse.status}`)
    }

    const data = await openaiResponse.json()
    const enhancedMessage = data.choices[0]?.message?.content

    if (!enhancedMessage) {
      throw new Error('No enhanced message received from OpenAI')
    }

    console.log('✅ Message enhanced successfully')
    console.log('Original:', adminReply)
    console.log('Enhanced:', enhancedMessage)

    return new Response(
      JSON.stringify({ 
        success: true, 
        enhancedMessage: enhancedMessage.trim() 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Error enhancing message:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
