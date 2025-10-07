import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EventEmailData {
  to: string
  organiserName: string
  eventTitle: string
  eventDate: string
  eventTime: string
  venue: string
  eventDetails: string
  type: 'confirmation' | 'rejection' | 'admin_notification' | 'organizer_confirmation'
  rejectionReason?: string
  audienceSize?: string
  travelExpenses?: string
  organiserEmail?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 Event Email Function started')
    const emailData: EventEmailData = await req.json()
    console.log('📨 Email request:', { 
      to: emailData.to, 
      type: emailData.type, 
      hasRejectionReason: !!emailData.rejectionReason 
    })

    // Validate required fields
    if (!emailData.to || !emailData.organiserName || !emailData.eventTitle || !emailData.type) {
      console.error('❌ Missing required fields:', { 
        to: !!emailData.to, 
        organiserName: !!emailData.organiserName, 
        eventTitle: !!emailData.eventTitle, 
        type: !!emailData.type 
      })
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY environment variable is not set')
      throw new Error('RESEND_API_KEY environment variable is not set')
    }
    
    console.log('✅ RESEND_API_KEY found')

    let subject: string
    let htmlContent: string

    if (emailData.type === 'confirmation') {
      subject = `Event Confirmed: ${emailData.eventTitle}`
      htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Event Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight { background: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 14px; margin: 30px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Event Confirmed!</h1>
            <p>Your speaking invitation has been accepted</p>
          </div>
          
          <div class="content">
            <h2>Dear ${emailData.organiserName},</h2>
            
            <p>Great news! I'm excited to confirm my participation in your event.</p>
            
            <div class="highlight">
              <h3>📅 Event Details:</h3>
              <p><strong>Event:</strong> ${emailData.eventTitle}</p>
              <p><strong>Date:</strong> ${emailData.eventDate}</p>
              <p><strong>Time:</strong> ${emailData.eventTime}</p>
              <p><strong>Venue:</strong> ${emailData.venue}</p>
            </div>
            
            <h3>📋 Event Description:</h3>
            <p>${emailData.eventDetails}</p>
            
            <p>I'm looking forward to this event! I'll be in touch soon to coordinate the final details.</p>
            
            <p>If you have any questions or need to discuss anything further, please don't hesitate to reach out.</p>
            
            <p>Best regards,<br>
            <strong>Irfan Malik</strong><br>
            AI Strategy Consultant</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message from the Irfan Malik consultation platform.</p>
          </div>
        </body>
        </html>
      `
    } else if (emailData.type === 'admin_notification') {
      subject = `🎤 New Event Invitation: ${emailData.eventTitle}`
      htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Event Invitation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4f46e5; }
            .detail-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 10px; margin: 15px 0; }
            .detail-label { font-weight: bold; color: #4f46e5; }
            .footer { text-align: center; color: #666; font-size: 14px; margin: 30px 0; }
            .urgent { background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎤 New Event Invitation</h1>
            <p>A new speaking invitation has been submitted</p>
          </div>
          
          <div class="content">
            <div class="urgent">
              <strong>⚡ Action Required:</strong> A new event invitation is waiting for your review in the admin panel.
            </div>
            
            <div class="highlight">
              <h3>📋 Event Details:</h3>
              <div class="detail-grid">
                <span class="detail-label">Event Title:</span>
                <span>${emailData.eventTitle}</span>
                <span class="detail-label">Organizer:</span>
                <span>${emailData.organiserName}</span>
                <span class="detail-label">Email:</span>
                <span>${emailData.organiserEmail}</span>
                <span class="detail-label">Date:</span>
                <span>${emailData.eventDate}</span>
                <span class="detail-label">Time:</span>
                <span>${emailData.eventTime}</span>
                <span class="detail-label">Venue:</span>
                <span>${emailData.venue}</span>
                <span class="detail-label">Audience Size:</span>
                <span>${emailData.audienceSize}</span>
                <span class="detail-label">Travel Required:</span>
                <span>${emailData.travelExpenses}</span>
              </div>
            </div>
            
            <h3>📝 Event Description:</h3>
            <p style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #e5e7eb;">${emailData.eventDetails}</p>
            
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Review the invitation details in your admin panel</li>
              <li>Check your calendar for availability</li>
              <li>Respond to the organizer with confirmation or decline</li>
            </ul>
            
            <p style="margin-top: 30px;">
              <strong>Admin Panel:</strong> Log in to your admin dashboard to manage this invitation.
            </p>
          </div>
          
          <div class="footer">
            <p>This notification was sent automatically when a new event invitation was submitted.</p>
          </div>
        </body>
        </html>
      `
    } else if (emailData.type === 'organizer_confirmation') {
      subject = `Event Invitation Received: ${emailData.eventTitle}`
      htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invitation Received</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight { background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
            .footer { text-align: center; color: #666; font-size: 14px; margin: 30px 0; }
            .timeline { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>✅ Invitation Received!</h1>
            <p>Thank you for your event invitation</p>
          </div>
          
          <div class="content">
            <h2>Dear ${emailData.organiserName},</h2>
            
            <p>Thank you for inviting me to speak at your event! I have received your invitation and it's currently under review.</p>
            
            <div class="highlight">
              <h3>📅 Your Event Details:</h3>
              <p><strong>Event:</strong> ${emailData.eventTitle}</p>
              <p><strong>Date:</strong> ${emailData.eventDate}</p>
              <p><strong>Time:</strong> ${emailData.eventTime}</p>
              <p><strong>Venue:</strong> ${emailData.venue}</p>
            </div>
            
            <div class="timeline">
              <h3>⏰ What Happens Next:</h3>
              <ol>
                <li><strong>Review Process:</strong> I'll carefully review your event details and check my availability</li>
                <li><strong>Response Time:</strong> You can expect a response within 2-3 business days</li>
                <li><strong>Confirmation:</strong> I'll send you a detailed response with next steps</li>
              </ol>
            </div>
            
            <p>If you have any urgent questions or need to make changes to your invitation, please don't hesitate to reach out.</p>
            
            <p>I appreciate your interest in having me speak at your event!</p>
            
            <p>Best regards,<br>
            <strong>Irfan Malik</strong><br>
            AI Strategy Consultant</p>
          </div>
          
          <div class="footer">
            <p>This is an automated confirmation from the Irfan Malik consultation platform.</p>
          </div>
        </body>
        </html>
      `
    } else {
      subject = `Event Update: ${emailData.eventTitle}`
      htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Event Update</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight { background: #ffe8e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b6b; }
            .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Event Update</h1>
            <p>Regarding your speaking invitation</p>
          </div>
          
          <div class="content">
            <h2>Dear ${emailData.organiserName},</h2>
            
            <p>Thank you for your interest in having me speak at "${emailData.eventTitle}".</p>
            
            <div class="highlight">
              <h3>⚠️ Unable to Confirm Participation</h3>
              <p><strong>Reason:</strong> ${emailData.rejectionReason || 'Unfortunately, I won\'t be able to participate in this event.'}</p>
            </div>
            
            <p>I appreciate you thinking of me for this opportunity. While I can't participate this time, I encourage you to reach out for future events.</p>
            
            <p>I wish you all the best with your event!</p>
            
            <p>Best regards,<br>
            <strong>Irfan Malik</strong><br>
            AI Strategy Consultant</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message from the Irfan Malik consultation platform.</p>
          </div>
        </body>
        </html>
      `
    }

    // Send email using Resend
    console.log('📧 Sending email via Resend API')
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Irfan Malik - Xeven Solutions <irfan@faziar.xyz>',
        to: [emailData.to],
        subject: subject,
        html: htmlContent,
      }),
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('❌ Resend API error:', {
        status: emailResponse.status,
        statusText: emailResponse.statusText,
        error: errorText
      })
      throw new Error(`Failed to send email: ${emailResponse.status} - ${errorText}`)
    }

    const result = await emailResponse.json()
    console.log(`✅ ${emailData.type} email sent successfully:`, result.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: result.id,
        message: `${emailData.type} email sent successfully` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Error sending event email:', error)
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
