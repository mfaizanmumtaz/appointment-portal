import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, x-supabase-api-version',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

interface EnhanceRequest {
  userMessage: string
  adminReply: string
}

interface EnhanceResponse {
  enhancedMessage: string
  changes: string[]
}

serve(async (req) => {
  // Always return 200 for OPTIONS with CORS headers
  if (req.method === 'OPTIONS') {
    console.log('🔄 CORS preflight request received')
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      console.log(`❌ Method ${req.method} not allowed`)
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('🚀 Message Enhancement Edge Function started')

    // Get OpenAI API key from environment variables
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

    if (!OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not found in environment')
      throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY environment variable')
    }

    console.log('✅ OpenAI API key found')

    const enhanceData: EnhanceRequest = await req.json()

    // Validate required fields
    if (!enhanceData.userMessage || !enhanceData.adminReply) {
      throw new Error('Missing required fields: userMessage, adminReply')
    }

    console.log(`🤖 Enhancing message for user inquiry`)
    console.log(`📥 Original reply length: ${enhanceData.adminReply.length} characters`)

    // Construct AI prompt for message enhancement
    const prompt = `You are a professional writing assistant helping a CEO/business consultant improve their email responses.

USER'S ORIGINAL MESSAGE:
"${enhanceData.userMessage}"

CEO'S DRAFT REPLY:
"${enhanceData.adminReply}"

YOUR TASK:
Please enhance the CEO's draft reply by:
1. Fixing any grammar mistakes
2. Improving clarity and professionalism
3. Ensuring proper punctuation and sentence structure
4. Maintaining the original tone and intent
5. Keeping it concise and professional
6. Making it warm yet professional

IMPORTANT GUIDELINES:
- Keep the same core message and meaning
- Don't make it overly formal or stiff
- Don't add unnecessary information
- Maintain a friendly, helpful tone
- Keep it professional but approachable
- Don't change the overall length significantly

Please respond with a JSON object containing:
- enhancedMessage: The improved version of the message
- changes: Array of strings briefly describing what was improved (e.g., "Fixed grammar", "Improved clarity", "Enhanced professionalism")

Focus on making it sound polished while keeping the CEO's personal voice.`

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional writing assistant that helps improve business communications. Always respond with valid JSON containing enhancedMessage and changes fields.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.3, // Lower temperature for consistent improvements
        response_format: { type: "json_object" }
      }),
    })

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch (e) {
        errorData = { error: { message: 'Failed to parse error response' } }
      }
      console.error('OpenAI API error:', errorData)
      console.error('Response status:', response.status)

      // Return original message if API fails
      return new Response(JSON.stringify({
        success: false,
        error: `OpenAI API unavailable (${response.status})`,
        enhancedMessage: enhanceData.adminReply, // Fallback to original
        changes: ['API unavailable - using original message']
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const aiResponse = await response.json()
    const aiContent = aiResponse.choices[0]?.message?.content

    if (!aiContent) {
      throw new Error('No response from OpenAI API')
    }

    // Parse AI response
    let enhanceResult: EnhanceResponse
    try {
      console.log('🔍 Raw AI response content:', aiContent)
      enhanceResult = JSON.parse(aiContent)
      console.log('✅ Parsed AI response')
      console.log(`📤 Enhanced reply length: ${enhanceResult.enhancedMessage?.length || 0} characters`)
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', aiContent)
      console.error('❌ Parse error:', parseError)

      // Fallback to original message
      enhanceResult = {
        enhancedMessage: enhanceData.adminReply,
        changes: ['AI parsing failed - using original message']
      }
      console.log('🔄 Using fallback response')
    }

    // Validate response structure
    if (!enhanceResult.enhancedMessage) {
      console.log('⚠️ AI response missing enhancedMessage, using original')
      enhanceResult.enhancedMessage = enhanceData.adminReply
      enhanceResult.changes = ['AI response incomplete - using original message']
    }

    if (!enhanceResult.changes || !Array.isArray(enhanceResult.changes)) {
      enhanceResult.changes = ['Message enhanced']
    }

    console.log(`✅ Message Enhancement Complete`)
    console.log(`📝 Changes made: ${enhanceResult.changes.join(', ')}`)

    return new Response(JSON.stringify({
      success: true,
      enhancedMessage: enhanceResult.enhancedMessage,
      changes: enhanceResult.changes
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ Message enhancement failed:', error)

    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      enhancedMessage: '', // Return empty, client should handle gracefully
      changes: []
    }), {
      status: 200, // Don't break user flow
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

// Log when function is ready
console.log('✨ Message Enhancement Edge Function ready and listening...')
