import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase";

// Lazy load Resend client
let resend: Resend | null = null;

function getResendClient(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Honeypot
    if (body._hp && body._hp !== "") {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

  const { shareId, email, companyName, role, teamSize, monthlySavings } = body;

  if (!shareId || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // Update audit record with lead info
  try {
    await supabase
      .from("audits")
      .update({
        email,
        company_name: companyName || null,
        role: role || null,
        team_size_capture: teamSize || null,
      })
      .eq("share_id", shareId);
  } catch (err) {
    console.error("Supabase update error:", err);
  }

  // Send confirmation email
  const isHighSavings = monthlySavings > 500;

  try {
    const emailClient = getResendClient();
    await emailClient.emails.send({
      from: "SpendLens <hello@spendlens.ai>",
      to: email,
      subject: `Your AI Spend Audit — $${Math.round(monthlySavings)}/mo savings identified`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
          <div style="margin-bottom: 32px;">
            <span style="font-size: 24px; font-weight: 700; color: #059669;">SpendLens</span>
          </div>
          
          <h1 style="font-size: 28px; font-weight: 700; margin-bottom: 8px;">Your audit is ready.</h1>
          <p style="color: #6b7280; font-size: 16px; margin-bottom: 32px;">
            We found <strong style="color: #059669;">$${Math.round(monthlySavings)}/month</strong> in potential savings across your AI stack.
          </p>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/r/${shareId}" 
             style="display: inline-block; background: #059669; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin-bottom: 32px;">
            View Full Report →
          </a>
          
          ${isHighSavings ? `
          <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 20px; margin-bottom: 32px;">
            <p style="font-weight: 700; margin: 0 0 8px;">You're a candidate for Credex credits.</p>
            <p style="color: #166534; margin: 0; font-size: 14px;">
              At $${Math.round(monthlySavings)}/month in savings, you're exactly the type of team Credex was built for. 
              We source discounted AI infrastructure credits (Cursor, Claude, ChatGPT Enterprise, and more) from companies 
              that overforecast. Our team will reach out within 2 business days to walk you through options.
            </p>
          </div>
          ` : ""}
          
          <p style="color: #9ca3af; font-size: 13px; border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 32px;">
            SpendLens is a free tool by <a href="https://credex.rocks" style="color: #059669;">Credex</a>. 
            We help startups stop overpaying for AI infrastructure. 
            <br>Your audit is saved at: ${process.env.NEXT_PUBLIC_APP_URL}/r/${shareId}
          </p>
        </body>
        </html>
      `,
    });
  } catch (err) {
    console.error("Resend error:", err);
    // Don't fail — email is nice-to-have, not blocking
  }

  return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lead API error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
