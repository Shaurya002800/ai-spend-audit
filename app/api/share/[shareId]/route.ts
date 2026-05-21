import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = await params;

  if (!shareId) {
    return NextResponse.json({ error: "Missing shareId" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("audits")
    .select("audit_input, audit_result, ai_summary, created_at")
    .eq("share_id", shareId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Audit not found" }, { status: 404 });
  }

  return NextResponse.json({
    auditInput: data.audit_input,
    auditResult: data.audit_result,
    aiSummary: data.ai_summary,
    createdAt: data.created_at,
    shareId,
  });
}
