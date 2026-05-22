import { NextResponse } from "next/server";

export async function GET() {
  const diagnostics = {
    environment: process.env.NODE_ENV,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Set" : "✗ Missing",
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Set" : "✗ Missing",
    anthropicKey: process.env.ANTHROPIC_API_KEY ? "✓ Set" : "✗ Missing",
    resendKey: process.env.RESEND_API_KEY ? "✓ Set" : "✗ Missing",
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(diagnostics);
}
