import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, x-supabase-api-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

interface TriageRequest {
  name: string
  email: string
  phone: string
  purpose: string
}

interface TriageResponse {
  decision: 'approved' | 'declined' | 'uncertain'
  reasoning: string
  confidence: number
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    })
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    // Get OpenAI API key from environment variables
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY environment variable')
    }

    const triageData: TriageRequest = await req.json()

    // Validate required fields
    if (!triageData.name || !triageData.email || !triageData.purpose) {
      throw new Error('Missing required fields: name, email, purpose')
    }

    console.log(`🤖 AI Triage for student: ${triageData.name} - ${triageData.email}`)

    // Construct AI prompt for student session evaluation
    const prompt = `You are an AI assistant helping to evaluate student requests for free mentorship sessions with a senior AI/tech professional.

CONTEXT:
- This is for FREE student mentorship sessions (45 minutes)
- The mentor specializes in: AI, machine learning, programming, career guidance, freelancing, tech industry insights
- Limited slots available, so we need to prioritize genuine students with relevant learning goals
- We want to help students who will benefit most from personalized guidance

STUDENT INFORMATION:
Name: ${triageData.name}
Email: ${triageData.email}
Phone: ${triageData.phone || 'Not provided'}
Purpose/Description: "${triageData.purpose}"

EVALUATION CRITERIA:
APPROVE if the request shows:
✅ Clear learning objectives (career guidance, skill development, AI/tech learning)
✅ Student-appropriate topics (internships, portfolio advice, technology learning, career planning)
✅ Genuine educational intent (asking for guidance, mentorship, advice)
✅ Appropriate scope for a 45-minute session

DECLINE if the request shows:
❌ Business/commercial intent (seeking paid services, business consulting, investment advice)
❌ Inappropriate requests (personal favors, non-educational topics)
❌ Vague or unclear purpose (no specific learning goal)
❌ Advanced professional topics better suited for paid consultation

UNCERTAIN if:
🤔 Borderline educational vs professional request
🤔 Unclear intent that needs human review
🤔 Complex requests that might need clarification

Please respond with a JSON object containing:
- decision: "approved", "declined", or "uncertain"
- reasoning: Brief explanation (2-3 sentences) of your decision
- confidence: Number between 0.0 and 1.0 indicating your confidence in the decision

Focus on helping genuine students while maintaining quality standards for the mentorship program.`

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
            content: 'You are an AI assistant that evaluates student mentorship requests. Always respond with valid JSON containing decision, reasoning, and confidence fields.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.3, // Lower temperature for more consistent decisions
        response_format: { type: "json_object" }
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('OpenAI API error:', errorData)
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
    }

    const aiResponse = await response.json()
    const aiContent = aiResponse.choices[0]?.message?.content

    if (!aiContent) {
      throw new Error('No response from OpenAI API')
    }

    // Parse AI response
    let triageResult: TriageResponse
    try {
      triageResult = JSON.parse(aiContent)
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent)
      throw new Error('Invalid AI response format')
    }

    // Validate AI response structure
    if (!triageResult.decision || !triageResult.reasoning || typeof triageResult.confidence !== 'number') {
      throw new Error('AI response missing required fields')
    }

    // Ensure decision is valid
    if (!['approved', 'declined', 'uncertain'].includes(triageResult.decision)) {
      throw new Error('Invalid AI decision value')
    }

    console.log(`✅ AI Triage Result: ${triageResult.decision} (confidence: ${triageResult.confidence})`)
    console.log(`📝 Reasoning: ${triageResult.reasoning}`)

    return new Response(JSON.stringify({
      success: true,
      result: triageResult,
      student: {
        name: triageData.name,
        email: triageData.email
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ AI Triage failed:', error)

    // Return a fallback decision in case of AI failure
    const fallbackResult: TriageResponse = {
      decision: 'uncertain',
      reasoning: 'AI evaluation temporarily unavailable. Request will be reviewed manually.',
      confidence: 0.5
    }

    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      result: fallbackResult // Provide fallback so user flow continues
    }), {
      status: 200, // Don't break user flow
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
