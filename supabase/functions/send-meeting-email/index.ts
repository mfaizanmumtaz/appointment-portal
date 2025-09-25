import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

interface EmailRequest {
  to: string
  subject: string
  html: string
  name: string
  meetingType: 'online' | 'in-person'
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("🚀 Edge Function started");
    const GMAIL_USER = Deno.env.get("GMAIL_USER");
    const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD");

    console.log("📧 Gmail User:", GMAIL_USER ? "Set" : "Not set");
    console.log("🔑 App Password:", GMAIL_APP_PASSWORD ? "Set" : "Not set");

    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      throw new Error("Gmail credentials not configured. Check GMAIL_USER and GMAIL_APP_PASSWORD secrets.");
    }

    const emailData: EmailRequest = await req.json();
    console.log("📨 Email request:", { to: emailData.to, subject: emailData.subject });

    if (!emailData.to || !emailData.subject || !emailData.html) {
      throw new Error("Missing required fields: to, subject, html");
    }

    console.log(`📧 Sending ${emailData.meetingType} meeting email to: ${emailData.to}`);

    // Create SMTP client for Gmail with better configuration
    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465, // Try SSL port instead of TLS
        tls: false,
        auth: {
          username: GMAIL_USER,
          password: GMAIL_APP_PASSWORD,
        },
      },
    });

    try {
      // Send email using Gmail SMTP
      await client.send({
        from: `"Xeven Solutions" <${GMAIL_USER}>`,
        to: emailData.to,
        subject: emailData.subject,
        content: emailData.html,
        html: emailData.html,
      });

      console.log("📧 SMTP send completed");
    } catch (smtpError) {
      console.error("📧 SMTP Error details:", smtpError);
      throw new Error(`SMTP Error: ${smtpError.message}`);
    } finally {
      // Always close the connection
      try {
        await client.close();
      } catch (closeError) {
        console.warn("⚠️ SMTP close warning:", closeError.message);
      }
    }

    console.log(`✅ Email sent successfully to ${emailData.to} via Gmail`);

    return new Response(JSON.stringify({
      success: true,
      message: "Email sent successfully via Gmail",
      recipient: emailData.to,
      sender: GMAIL_USER
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    console.error("❌ Gmail email sending failed:", error.message);

    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: "Failed to send meeting confirmation email via Gmail"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400
    });
  }
});