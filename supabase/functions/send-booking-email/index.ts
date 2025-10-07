import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

interface BookingEmailRequest {
  // Client notification
  clientEmail?: {
    to: string
    name: string
    date?: string
    time?: string
    meetingType?: 'online' | 'in-person'
    meetingUrl?: string
    venueAddress?: string
    sessionType: 'free' | 'paid'
    appointmentType: 'business' | 'student' | 'in-person'
    status: 'confirmed' | 'pending' | 'cancelled' | 'declined' | 'rejected'
    subject?: string
    htmlContent?: string
    reason?: string
  }

  // Admin notification
  adminEmail?: {
    bookingType: 'business' | 'student' | 'in-person'
    clientName: string
    clientEmail: string
    clientPhone: string
    date?: string
    time?: string
    purpose: string
    sessionType: 'free' | 'paid'
    status: 'confirmed' | 'pending'
  }
}

function generateClientConfirmationHTML(data: any): string {
  // If custom HTML content is provided, use it (for cancellation, decline, rejection emails)
  if (data.htmlContent) {
    return data.htmlContent;
  }

  const isConfirmed = data.status === 'confirmed';
  const statusText = isConfirmed ? 'Confirmed' : 'Pending Approval';
  const statusColor = isConfirmed ? '#10b981' : '#f59e0b';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.appointmentType.charAt(0).toUpperCase() + data.appointmentType.slice(1)} Session ${statusText}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 32px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 32px;
            padding-bottom: 24px;
            border-bottom: 2px solid #e2e8f0;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 8px;
        }
        .subtitle {
            color: #64748b;
            font-size: 14px;
        }
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
            margin: 16px 0;
            background-color: ${statusColor};
            color: white;
        }
        .meeting-details {
            background-color: #f1f5f9;
            border-radius: 8px;
            padding: 24px;
            margin: 24px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e2e8f0;
        }
        .detail-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        .detail-label {
            font-weight: 600;
            color: #475569;
        }
        .detail-value {
            color: #1e293b;
        }
        .meeting-link {
            background-color: #ecfdf5;
            border: 1px solid #10b981;
            border-radius: 8px;
            padding: 16px;
            margin: 16px 0;
            text-align: center;
        }
        .meeting-link a {
            color: #10b981;
            text-decoration: none;
            font-weight: 600;
        }
        .footer {
            margin-top: 32px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
            padding-top: 24px;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Xeven Solutions</div>
            <div class="subtitle">AI-Driven Business Solutions</div>
            <div class="status-badge">${statusText}</div>
        </div>

        <h2>Hello ${data.name},</h2>

        ${isConfirmed
          ? `<p>Your ${data.appointmentType} session has been confirmed! Here are the details:</p>`
          : `<p>Thank you for your ${data.appointmentType} session request. It is currently pending approval and you will receive an update soon.</p>`
        }

        <div class="meeting-details">
            <div class="detail-row">
                <span class="detail-label">Session Type:</span>
                <span class="detail-value">${data.sessionType === 'paid' ? 'Paid' : 'Free'} ${data.appointmentType.charAt(0).toUpperCase() + data.appointmentType.slice(1)} Session</span>
            </div>
            ${data.date ? `
            <div class="detail-row">
                <span class="detail-label">Date & Time:</span>
                <span class="detail-value">${new Date(data.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })} at ${data.time}</span>
            </div>
            ` : ''}
            <div class="detail-row">
                <span class="detail-label">Meeting Type:</span>
                <span class="detail-value">${data.meetingType === 'online' ? 'Online (Video Call)' : 'In-Person'}</span>
            </div>
        </div>

        ${isConfirmed && data.meetingType === 'online' && data.meetingUrl ? `
        <div class="meeting-link">
            <p><strong>Join Meeting:</strong></p>
            <a href="${data.meetingUrl}" target="_blank">${data.meetingUrl}</a>
        </div>
        ` : ''}

        ${isConfirmed && data.meetingType === 'in-person' && data.venueAddress ? `
        <div class="meeting-details">
            <div class="detail-row">
                <span class="detail-label">Venue:</span>
                <span class="detail-value">${data.venueAddress.replace(/\n/g, '<br>')}</span>
            </div>
        </div>
        ` : ''}

        ${!isConfirmed ? `
        <p><strong>Next Steps:</strong></p>
        <ul>
            <li>Irfan Malik will review your request within 24 hours</li>
            <li>You'll receive a confirmation email with meeting details if approved</li>
            <li>If not immediately approved, you'll receive alternative options</li>
        </ul>
        ` : `
        <p><strong>What's Next:</strong></p>
        <ul>
            <li>Add this meeting to your calendar</li>
            <li>Prepare any questions or materials for discussion</li>
            <li>You'll receive a reminder email 24 hours before the meeting</li>
        </ul>
        `}

        <div style="margin-top: 32px; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
            <p><strong>Questions or need to reschedule?</strong></p>
            <p>Reply to this email or contact us directly. We're here to help!</p>
        </div>

        <div class="footer">
            <p>This email was sent from <a href="https://xevensolutions.com">Xeven Solutions</a></p>
            <p>Thank you for choosing our services!</p>
        </div>
    </div>
</body>
</html>
  `.trim();
}

function generateAdminNotificationHTML(data: any): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New ${data.bookingType.charAt(0).toUpperCase() + data.bookingType.slice(1)} Booking</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 32px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 32px;
            padding-bottom: 24px;
            border-bottom: 2px solid #e2e8f0;
            background-color: #1e40af;
            color: white;
            margin: -32px -32px 32px -32px;
            padding: 24px 32px;
            border-radius: 12px 12px 0 0;
        }
        .booking-details {
            background-color: #f1f5f9;
            border-radius: 8px;
            padding: 24px;
            margin: 24px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e2e8f0;
        }
        .detail-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        .detail-label {
            font-weight: 600;
            color: #475569;
        }
        .detail-value {
            color: #1e293b;
        }
        .action-button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #1e40af;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 8px;
        }
        .urgent {
            background-color: #dc2626;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 New ${data.bookingType.charAt(0).toUpperCase() + data.bookingType.slice(1)} Booking</h1>
            <p>Status: ${data.status === 'confirmed' ? 'Automatically Confirmed' : 'Pending Your Approval'}</p>
        </div>

        <h2>Booking Details</h2>

        <div class="booking-details">
            <div class="detail-row">
                <span class="detail-label">Client Name:</span>
                <span class="detail-value">${data.clientName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${data.clientEmail}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Phone:</span>
                <span class="detail-value">${data.clientPhone}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Session Type:</span>
                <span class="detail-value">${data.sessionType === 'paid' ? 'Paid' : 'Free'} ${data.bookingType} Session</span>
            </div>
            ${data.date ? `
            <div class="detail-row">
                <span class="detail-label">Requested Date & Time:</span>
                <span class="detail-value">${new Date(data.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })} at ${data.time}</span>
            </div>
            ` : ''}
            <div class="detail-row">
                <span class="detail-label">Purpose/Message:</span>
                <span class="detail-value">${data.purpose}</span>
            </div>
        </div>

        ${data.status === 'pending' ? `
        <div style="text-align: center; margin: 32px 0;">
            <h3>Action Required</h3>
            <p>This ${data.bookingType} session requires your approval.</p>
            <a href="${Deno.env.get('ADMIN_DASHBOARD_URL') || 'https://your-domain.com/admin'}" class="action-button">
                Review in Admin Dashboard
            </a>
        </div>
        ` : `
        <div style="text-align: center; margin: 32px 0; background-color: #ecfdf5; padding: 16px; border-radius: 8px;">
            <h3 style="color: #10b981;">✅ Automatically Confirmed</h3>
            <p>This ${data.bookingType} session was automatically confirmed and the client has been notified.</p>
        </div>
        `}

        <div style="margin-top: 32px; padding: 20px; background-color: #fef3c7; border-radius: 8px;">
            <p><strong>Quick Actions:</strong></p>
            <ul>
                <li>Reply to this email to contact the client directly</li>
                <li>Check the admin dashboard for full details</li>
                <li>Add to your calendar if confirmed</li>
            </ul>
        </div>
    </div>
</body>
</html>
  `.trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("🚀 Booking Email Function started");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const CEO_EMAIL = Deno.env.get("CEO_EMAIL") || "mfaizanmumtaz999@gmail.com"; // Fallback to default

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    console.log("📧 CEO email configured as:", CEO_EMAIL);

    const emailData: BookingEmailRequest = await req.json();
    console.log("📨 Booking email request:", {
      hasClientEmail: !!emailData.clientEmail,
      hasAdminEmail: !!emailData.adminEmail
    });

    const results = [];

    // Send client confirmation email
    if (emailData.clientEmail) {
      console.log("📧 Sending client confirmation email");

      // Use custom subject if provided, otherwise generate default
      const clientSubject = emailData.clientEmail.subject ||
        `${emailData.clientEmail.status === 'confirmed' ? 'Confirmed' : 'Received'}: Your ${emailData.clientEmail.appointmentType} Session ${emailData.clientEmail.date ? `on ${new Date(emailData.clientEmail.date).toLocaleDateString()}` : 'Request'}`;

      const clientResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Xeven Solutions <noreply@faziar.xyz>",
          reply_to: CEO_EMAIL,
          to: [emailData.clientEmail.to],
          subject: clientSubject,
          html: generateClientConfirmationHTML(emailData.clientEmail),
        }),
      });

      if (clientResponse.ok) {
        const clientResult = await clientResponse.json();
        results.push({ type: 'client', success: true, id: clientResult.id });
        console.log("✅ Client email sent:", clientResult.id);
      } else {
        const error = await clientResponse.text();
        results.push({ type: 'client', success: false, error });
        console.error("❌ Client email failed:", error);
      }
    }

    // Send admin notification email
    if (emailData.adminEmail) {
      console.log("📧 Sending admin notification email");

      const isFreeSession = emailData.adminEmail.sessionType === 'free';\n      const adminSubject = isFreeSession \n        ? `🎆 Free ${emailData.adminEmail.bookingType.charAt(0).toUpperCase() + emailData.adminEmail.bookingType.slice(1)} Session Request from ${emailData.adminEmail.clientName} - APPROVAL NEEDED`\n        : `🔔 New ${emailData.adminEmail.bookingType.charAt(0).toUpperCase() + emailData.adminEmail.bookingType.slice(1)} Booking from ${emailData.adminEmail.clientName}`;

      const adminResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Booking Notifications <booking@faziar.xyz>",
          reply_to: emailData.adminEmail.clientEmail,
          to: [CEO_EMAIL],
          subject: adminSubject,
          html: generateAdminNotificationHTML(emailData.adminEmail),
        }),
      });

      if (adminResponse.ok) {
        const adminResult = await adminResponse.json();
        results.push({ type: 'admin', success: true, id: adminResult.id });
        console.log("✅ Admin email sent:", adminResult.id);
      } else {
        const error = await adminResponse.text();
        results.push({ type: 'admin', success: false, error });
        console.error("❌ Admin email failed:", error);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Booking emails processed",
      results: results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    console.error("❌ Booking email sending failed:", error.message);

    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400
    });
  }
});