import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const CEO_EMAIL = Deno.env.get('CEO_EMAIL') || 'mfaizanmumtaz999@gmail.com'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InterviewEmailData {
  to: string
  podcasterName: string
  email: string
  phone: string
  linkedinUrl: string
  youtubeLink: string
  facebookLink: string
  agenda: string
  preferredDate?: string
  notes?: string
  type: 'admin_notification' | 'podcaster_confirmation' | 'approval' | 'rejection' | 'cancellation'
  rejectionReason?: string
  cancellationReason?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 Interview Email Function started')
    const emailData: InterviewEmailData = await req.json()

    console.log('📧 Email data received:', {
      type: emailData.type,
      to: emailData.to,
      podcasterName: !!emailData.podcasterName,
      agenda: !!emailData.agenda,
    })

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured')
    }

    if (!emailData.to || !emailData.podcasterName || !emailData.type) {
      throw new Error('Missing required email data: to, podcasterName, type')
    }

    let subject = ''
    let htmlContent = ''

    if (emailData.type === 'approval') {
      subject = `Interview Request Approved: ${emailData.agenda.substring(0, 50)}...`
      htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Interview Request Approved</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
            .footer { text-align: center; color: #666; font-size: 14px; margin: 30px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Interview Request Approved!</h1>
            <p>Great news! Your interview request has been approved.</p>
          </div>
          
          <div class="content">
            <p>Hi ${emailData.podcasterName},</p>
            
            <div class="highlight">
              <h3>📝 Your Interview Topic:</h3>
              <p><strong>"${emailData.agenda}"</strong></p>
              ${emailData.preferredDate ? `<p><strong>Preferred Date:</strong> ${emailData.preferredDate}</p>` : ''}
            </div>
            
            <p>Thank you for your interest in having me on your show/podcast. I'm excited about the opportunity to discuss these topics with your audience!</p>
            
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>I will reach out to you within 24-48 hours to coordinate the details</li>
              <li>We'll schedule the interview at a mutually convenient time</li>
              <li>I'll provide any technical requirements or setup information needed</li>
            </ul>
            
            <p>Looking forward to our conversation!</p>
            
            <p>Best regards,<br><strong>Irfan Malik</strong><br>CEO, Xeven Solutions</p>
          </div>
          
          <div class="footer">
            <p>This confirmation was sent automatically. Please do not reply to this email.</p>
          </div>
        </body>
        </html>
      `
    } else if (emailData.type === 'admin_notification') {
      subject = `🎤 New Interview Request: ${emailData.podcasterName}`
      htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Interview Request</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight { background: #f5f3ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6; }
            .detail-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 10px; margin: 15px 0; }
            .detail-label { font-weight: bold; color: #7c3aed; }
            .footer { text-align: center; color: #666; font-size: 14px; margin: 30px 0; }
            .urgent { background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
            .social-links { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .social-links a { color: #7c3aed; text-decoration: none; margin-right: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎤 New Interview Request</h1>
            <p>A new interview/podcast invitation has been submitted</p>
          </div>
          
          <div class="content">
            <div class="urgent">
              <strong>⚡ Action Required:</strong> A new interview request is waiting for your review in the admin panel.
            </div>
            
            <div class="highlight">
              <h3>👤 Podcaster Details:</h3>
              <div class="detail-grid">
                <span class="detail-label">Name:</span>
                <span>${emailData.podcasterName}</span>
                <span class="detail-label">Email:</span>
                <span>${emailData.email}</span>
                <span class="detail-label">Phone:</span>
                <span>${emailData.phone}</span>
                ${emailData.preferredDate ? `
                <span class="detail-label">Preferred Date:</span>
                <span>${emailData.preferredDate}</span>` : ''}
              </div>
            </div>
            
            <div class="social-links">
              <h3>🔗 Social Media Channels:</h3>
              <a href="${emailData.linkedinUrl}" target="_blank">LinkedIn Profile</a>
              <a href="${emailData.youtubeLink}" target="_blank">YouTube Channel</a>
              <a href="${emailData.facebookLink}" target="_blank">Facebook Page</a>
            </div>
            
            <h3>📝 Interview Topic & Agenda:</h3>
            <p style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #e5e7eb;">${emailData.agenda}</p>
            
            ${emailData.notes ? `
            <h3>📋 Additional Notes:</h3>
            <p style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #e5e7eb;">${emailData.notes}</p>
            ` : ''}
            
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Review the request details in your admin panel</li>
              <li>Check the podcaster's social media presence and audience</li>
              <li>Evaluate the interview topic alignment with your expertise</li>
              <li>Respond with approval or rejection</li>
            </ul>
            
            <p style="margin-top: 30px;">
              <strong>Admin Panel:</strong> Log in to your admin dashboard to manage this request.
            </p>
          </div>
          
          <div class="footer">
            <p>This notification was sent automatically when a new interview request was submitted.</p>
          </div>
        </body>
        </html>
      `
    } else if (emailData.type === 'podcaster_confirmation') {
      subject = `Interview Request Received: ${emailData.agenda.substring(0, 50)}...`
      htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Interview Request Received</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #06b6d4; }
            .footer { text-align: center; color: #666; font-size: 14px; margin: 30px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📨 Interview Request Received</h1>
            <p>Thank you for your interview invitation!</p>
          </div>
          
          <div class="content">
            <p>Hi ${emailData.podcasterName},</p>
            
            <p>Thank you for your interest in having <strong>Irfan Malik</strong> as a guest on your show/podcast.</p>
            
            <div class="highlight">
              <h3>📋 Your Request Summary:</h3>
              <p><strong>Topic:</strong> ${emailData.agenda.substring(0, 100)}${emailData.agenda.length > 100 ? '...' : ''}</p>
              ${emailData.preferredDate ? `<p><strong>Preferred Date:</strong> ${emailData.preferredDate}</p>` : ''}
            </div>
            
            <p><strong>What happens next?</strong></p>
            <ul>
              <li>Your request is being reviewed</li>
              <li>We'll evaluate the topic alignment and schedule availability</li>
              <li>You'll receive a response within 3-5 business days</li>
              <li>If approved, we'll coordinate the interview details directly</li>
            </ul>
            
            <p>We appreciate your interest and will be in touch soon!</p>
            
            <p>Best regards,<br><strong>Xeven Solutions Team</strong></p>
          </div>
          
          <div class="footer">
            <p>This confirmation was sent automatically. Please do not reply to this email.</p>
          </div>
        </body>
        </html>
      `
    } else if (emailData.type === 'rejection') {
      subject = `Interview Request Update: ${emailData.agenda.substring(0, 50)}...`
      htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Interview Request Response</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight { background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444; }
            .footer { text-align: center; color: #666; font-size: 14px; margin: 30px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📋 Interview Request Response</h1>
            <p>Thank you for your interest</p>
          </div>
          
          <div class="content">
            <p>Hi ${emailData.podcasterName},</p>
            
            <p>Thank you for your interest in having me as a guest on your show/podcast to discuss "${emailData.agenda.substring(0, 100)}${emailData.agenda.length > 100 ? '...' : ''}".</p>
            
            <div class="highlight">
              <h3>Response:</h3>
              <p>Unfortunately, I won't be able to participate in this interview at this time.</p>
              ${emailData.rejectionReason ? `<p><strong>Reason:</strong> ${emailData.rejectionReason}</p>` : ''}
            </div>
            
            <p><strong>Alternative Options:</strong></p>
            <ul>
              <li>Consider scheduling for a future date when my availability opens up</li>
              <li>Explore content from my existing interviews and speaking engagements</li>
              <li>Feel free to submit another request with a different topic or timeframe</li>
            </ul>
            
            <p>I appreciate your understanding and wish you the best with your show!</p>
            
            <p>Best regards,<br><strong>Irfan Malik</strong><br>CEO, Xeven Solutions</p>
          </div>
          
          <div class="footer">
            <p>This response was sent automatically. Please do not reply to this email.</p>
          </div>
        </body>
        </html>
      `
    } else if (emailData.type === 'cancellation') {
      subject = `Interview Cancelled: ${emailData.agenda.substring(0, 50)}...`
      htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Interview Cancelled</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight { background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444; }
            .footer { text-align: center; color: #666; font-size: 14px; margin: 30px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📋 Interview Cancelled</h1>
            <p>Important update regarding your interview request</p>
          </div>
          
          <div class="content">
            <p>Hi ${emailData.podcasterName},</p>
            
            <p>I need to inform you that I have to cancel our scheduled interview. I sincerely apologize for any inconvenience this may cause.</p>
            
            <div class="highlight">
              <h3>📝 Cancelled Interview Details:</h3>
              <p><strong>Topic:</strong> "${emailData.agenda}"</p>
              ${emailData.preferredDate ? `<p><strong>Date:</strong> ${emailData.preferredDate}</p>` : ''}
              ${emailData.cancellationReason ? `<p><strong>Reason:</strong> ${emailData.cancellationReason}</p>` : ''}
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>You may submit a new interview request for a future date</li>
              <li>Consider alternative formats or dates that might work better</li>
              <li>Feel free to reach out if you'd like to discuss rescheduling options</li>
            </ul>
            
            <p>Thank you for your understanding, and I apologize again for the short notice.</p>
            
            <p>Best regards,<br><strong>Irfan Malik</strong><br>CEO, Xeven Solutions</p>
          </div>
          
          <div class="footer">
            <p>This notification was sent automatically. Please do not reply to this email.</p>
          </div>
        </body>
        </html>
      `
    }

    console.log('📧 Sending email with Resend...')

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Interview Requests <interview@faziar.xyz>',
        to: [emailData.to],
        subject,
        html: htmlContent,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('❌ Resend API error:', error)
      throw new Error(`Resend API error: ${error}`)
    }

    const result = await response.json()
    console.log('✅ Interview email sent successfully:', result.id)

    return new Response(JSON.stringify({
      success: true,
      message: 'Interview email sent successfully',
      id: result.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('❌ Error sending interview email:', error)

    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }
})
