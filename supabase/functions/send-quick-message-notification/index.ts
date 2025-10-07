import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface QuickMessageEmailData {
  senderName: string
  senderEmail: string
  senderPhone?: string
  message: string
  submittedAt: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 Quick Message Notification Function started')
    const emailData: QuickMessageEmailData = await req.json()
    console.log('📨 Quick message notification request:', { 
      senderName: emailData.senderName, 
      senderEmail: emailData.senderEmail,
      hasPhone: !!emailData.senderPhone
    })

    // Validate required fields
    if (!emailData.senderName || !emailData.senderEmail || !emailData.message) {
      console.error('❌ Missing required fields:', { 
        senderName: !!emailData.senderName, 
        senderEmail: !!emailData.senderEmail, 
        message: !!emailData.message
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

    // Get Resend API key from environment
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ 
          error: 'Email service configuration missing' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Format the date
    const submissionDate = new Date(emailData.submittedAt).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    })

    // Create email subject
    const subject = `🚀 New Quick Message from ${emailData.senderName}`

    // Create HTML email content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Quick Message Notification</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
            .content { padding: 30px; }
            .message-box { background: #f1f5f9; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
            .sender-info { background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .info-row { display: flex; margin-bottom: 8px; }
            .info-label { font-weight: 600; color: #374151; min-width: 80px; }
            .info-value { color: #6b7280; }
            .footer { background: #f8fafc; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
            .btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 10px 5px; }
            .btn:hover { background: #2563eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📨 New Quick Message Received</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">Someone has sent you a quick message through your website</p>
            </div>
            
            <div class="content">
              <div class="sender-info">
                <h3 style="margin-top: 0; color: #1e40af;">👤 Sender Information</h3>
                <div class="info-row">
                  <span class="info-label">Name:</span>
                  <span class="info-value">${emailData.senderName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Email:</span>
                  <span class="info-value"><a href="mailto:${emailData.senderEmail}" style="color: #3b82f6;">${emailData.senderEmail}</a></span>
                </div>
                ${emailData.senderPhone ? `
                <div class="info-row">
                  <span class="info-label">Phone:</span>
                  <span class="info-value"><a href="tel:${emailData.senderPhone}" style="color: #3b82f6;">${emailData.senderPhone}</a></span>
                </div>
                ` : ''}
                <div class="info-row">
                  <span class="info-label">Sent:</span>
                  <span class="info-value">${submissionDate}</span>
                </div>
              </div>

              <div class="message-box">
                <h3 style="margin-top: 0; color: #1e40af;">💬 Message</h3>
                <p style="margin-bottom: 0; white-space: pre-wrap; font-size: 16px; line-height: 1.6;">${emailData.message}</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="mailto:${emailData.senderEmail}?subject=Re: Your Quick Message&body=Hi ${emailData.senderName},%0D%0A%0D%0AThank you for your message. " class="btn">📧 Reply via Email</a>
                <a href="tel:${emailData.senderPhone || ''}" class="btn" ${!emailData.senderPhone ? 'style="display: none;"' : ''}>📞 Call ${emailData.senderName}</a>
              </div>

              <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e;"><strong>💡 Quick Tip:</strong> You can also manage and reply to messages through your admin panel at <a href="${Deno.env.get('NEXT_PUBLIC_SITE_URL') || 'your-site.com'}/admin" style="color: #92400e;">Admin Dashboard</a></p>
              </div>
            </div>

            <div class="footer">
              <p style="margin: 0;">This notification was sent automatically when someone submitted a quick message on your website.</p>
              <p style="margin: 5px 0 0 0;">© ${new Date().getFullYear()} Xeven Solutions - Appointment Portal</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Send email using Resend
    console.log('📧 Sending quick message notification via Resend API')
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Irfan Malik - Xeven Solutions <irfan@faziar.xyz>',
        to: ['mfaizanmumtaz999@gmail.com'], // CEO email
        subject: subject,
        html: htmlContent,
      }),
    })

    console.log('📧 Resend API response status:', emailResponse.status)

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('❌ Resend API error:', errorText)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send email notification',
          details: errorText
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const emailResult = await emailResponse.json()
    console.log('✅ Quick message notification sent successfully:', emailResult)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Quick message notification sent to CEO',
        emailId: emailResult.id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Error in quick message notification function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
