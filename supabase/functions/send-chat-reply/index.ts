import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

interface ChatReplyEmailRequest {
  to: string
  name: string
  originalMessage: string
  adminReply: string
  replyDate: string
}

function generateChatReplyHTML(data: ChatReplyEmailRequest): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reply from Irfan Malik - Xeven Solutions</title>
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
        .greeting {
            font-size: 18px;
            margin-bottom: 24px;
            color: #1e293b;
        }
        .message-section {
            margin: 24px 0;
            padding: 20px;
            background-color: #f1f5f9;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
        }
        .message-label {
            font-weight: 600;
            color: #475569;
            font-size: 14px;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .message-content {
            color: #334155;
            line-height: 1.6;
            font-size: 15px;
        }
        .reply-section {
            margin: 24px 0;
            padding: 20px;
            background-color: #ecfdf5;
            border-radius: 8px;
            border-left: 4px solid #10b981;
        }
        .signature {
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid #e2e8f0;
            color: #475569;
        }
        .signature-name {
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 4px;
        }
        .signature-title {
            color: #64748b;
            font-size: 14px;
        }
        .footer {
            margin-top: 32px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
            padding-top: 24px;
            border-top: 1px solid #e2e8f0;
        }
        .footer a {
            color: #3b82f6;
            text-decoration: none;
        }
        .reply-date {
            font-size: 12px;
            color: #64748b;
            text-align: right;
            margin-top: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Xeven Solutions</div>
            <div class="subtitle">AI-Driven Business Solutions</div>
        </div>

        <div class="greeting">
            Hello ${data.name},
        </div>

        <p>Thank you for reaching out through our website. Irfan Malik has personally replied to your message.</p>

        <div class="message-section">
            <div class="message-label">Your Original Message:</div>
            <div class="message-content">${data.originalMessage.replace(/\n/g, '<br>')}</div>
        </div>

        <div class="reply-section">
            <div class="message-label">Irfan's Reply:</div>
            <div class="message-content">${data.adminReply.replace(/\n/g, '<br>')}</div>
            <div class="reply-date">Replied on ${new Date(data.replyDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}</div>
        </div>

        <p>If you have any follow-up questions or would like to schedule a consultation, feel free to reply to this email or book a session directly through our website.</p>

        <div class="signature">
            <div class="signature-name">Irfan Malik</div>
            <div class="signature-title">CEO & Founder, Xeven Solutions</div>
        </div>

        <div class="footer">
            <p>
                This email was sent from <a href="https://xevensolutions.com">Xeven Solutions</a><br>
                If you no longer wish to receive these emails, please contact us.
            </p>
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
    console.log("🚀 Chat Reply Email Function started");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const CEO_EMAIL = Deno.env.get("CEO_EMAIL") || "mfaizanmumtaz999@gmail.com"; // Fallback to default

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured. Please set this secret in Supabase.");
    }

    console.log("📧 CEO reply-to email configured as:", CEO_EMAIL);

    const emailData: ChatReplyEmailRequest = await req.json();
    console.log("📨 Email request for:", emailData.to);

    if (!emailData.to || !emailData.name || !emailData.originalMessage || !emailData.adminReply) {
      throw new Error("Missing required fields: to, name, originalMessage, adminReply");
    }

    const subject = `Reply from Irfan Malik - Your Message on ${new Date(emailData.replyDate).toLocaleDateString()}`;
    const htmlContent = generateChatReplyHTML(emailData);
    const textContent = `Hello ${emailData.name},

Thank you for reaching out through our website. Irfan Malik has personally replied to your message.

Your Original Message:
${emailData.originalMessage}

Irfan's Reply:
${emailData.adminReply}

Best regards,
Irfan Malik
CEO & Founder, Xeven Solutions`;

    console.log("📧 Sending email via Resend API");

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Irfan Malik - Xeven Solutions <irfan@faziar.xyz>",
        reply_to: CEO_EMAIL,
        to: [emailData.to],
        subject: subject,
        html: htmlContent,
        text: textContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("❌ Resend API error:", errorData);
      throw new Error(`Resend API error: ${response.status} - ${errorData}`);
    }

    const result = await response.json();
    console.log("✅ Email sent successfully via Resend:", result.id);

    return new Response(JSON.stringify({
      success: true,
      message: "Chat reply email sent successfully via Resend",
      recipient: emailData.to,
      subject: subject,
      emailId: result.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    console.error("❌ Chat reply email sending failed:", error.message);

    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: "Failed to send chat reply email via Resend"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400
    });
  }
});