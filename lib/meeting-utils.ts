// Meeting and email utilities

export const generateZoomLink = () => {
  // Generate a realistic Zoom meeting link
  const meetingId = Math.floor(Math.random() * 9000000000) + 1000000000 // 10 digit ID
  const password = Math.random().toString(36).substring(2, 8).toUpperCase()

  return {
    url: `https://zoom.us/j/${meetingId}?pwd=${password}`,
    meetingId: meetingId.toString(),
    password: password
  }
}

export const generateVenueAddress = () => {
  // Default venue address for in-person meetings
  return "Xeven Solutions Office\n123 Business Avenue, Suite 500\nTech District, City 12345\nPakistan"
}

interface EmailData {
  to: string
  name: string
  date: string
  time: string
  meetingType: 'online' | 'in-person'
  meetingUrl?: string
  venueAddress?: string
  duration?: number
}

export const sendMeetingEmail = async (data: EmailData) => {
  try {
    console.log('📧 Sending meeting email via Supabase Edge Function to:', data.to)

    const { supabase } = await import("@/lib/supabase")

    const response = await supabase.functions.invoke('send-meeting-email', {
      body: {
        to: data.to,
        subject: `Meeting Confirmed - ${new Date(data.date).toLocaleDateString()}`,
        html: generateEmailHTML(data),
        name: data.name,
        meetingType: data.meetingType
      }
    })

    if (response.error) {
      console.error('Edge Function error:', response.error)
      throw new Error(response.error.message)
    }

    console.log('✅ Email sent successfully via Gmail:', response.data)
    return { success: true, message: 'Email sent successfully via Gmail' }

  } catch (error) {
    console.error('❌ Failed to send email:', error)
    return { success: false, message: `Failed to send email: ${error.message}` }
  }
}

const generateEmailHTML = (data: EmailData) => {
  const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  if (data.meetingType === 'online') {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Meeting Confirmed! 🎉</h2>

        <p>Hi ${data.name},</p>

        <p>Your business consultation with <strong>Irfan Malik</strong> has been confirmed!</p>

        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">📅 Meeting Details</h3>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${data.time} EST</p>
          <p><strong>Duration:</strong> ${data.duration || 30} minutes</p>
          <p><strong>Type:</strong> Online Video Call</p>
        </div>

        <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">🔗 Join Meeting</h3>
          <p><strong>Zoom Link:</strong></p>
          <a href="${data.meetingUrl}" style="color: #2563eb; text-decoration: none; font-weight: bold;">
            ${data.meetingUrl}
          </a>
          <p style="font-size: 12px; color: #6b7280; margin-top: 10px;">
            Click the link 5-10 minutes before the scheduled time.
          </p>
        </div>

        <p>Looking forward to our discussion!</p>

        <p>Best regards,<br>
        <strong>Irfan Malik</strong><br>
        CEO, Xeven Solutions</p>
      </div>
    `
  } else {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">In-Person Meeting Confirmed! 🤝</h2>

        <p>Hi ${data.name},</p>

        <p>Your in-person consultation with <strong>Irfan Malik</strong> has been confirmed!</p>

        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">📅 Meeting Details</h3>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${data.time} EST</p>
          <p><strong>Duration:</strong> ${data.duration || 30} minutes</p>
          <p><strong>Type:</strong> In-Person Meeting</p>
        </div>

        <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">📍 Venue Address</h3>
          <p style="white-space: pre-line; font-weight: bold;">${data.venueAddress}</p>
          <p style="font-size: 12px; color: #6b7280; margin-top: 10px;">
            Please arrive 5-10 minutes early. Visitor parking is available.
          </p>
        </div>

        <p>Looking forward to meeting you in person!</p>

        <p>Best regards,<br>
        <strong>Irfan Malik</strong><br>
        CEO, Xeven Solutions</p>
      </div>
    `
  }
}