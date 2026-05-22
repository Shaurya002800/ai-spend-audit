import { createClient } from "@supabase/supabase-js";

let supabaseInstance: ReturnType<typeof createClient> | null = null;

export function initializeSupabase() {
  if (supabaseInstance) return supabaseInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables");
  }

  supabaseInstance = createClient(url, key);
  return supabaseInstance;
}

export function getSupabase() {
  return initializeSupabase();
}

// For backward compatibility - will be initialized on first use
export const supabase = {
  from: (tableName: string) => getSupabase().from(tableName),
} as any;

export interface AuditRecord {
  id: string;
  share_id: string;
  audit_input: object;
  audit_result: object;
  ai_summary: string | null;
  email: string | null;
  company_name: string | null;
  role: string | null;
  team_size_capture: number | null;
  created_at: string;
}

export const SUPABASE_SQL = `
create extension if not exists "pgcrypto";

create table if not exists audits (
  id uuid primary key default gen_random_uuid(),
  share_id text unique not null,
  audit_input jsonb not null,
  audit_result jsonb not null,
  ai_summary text,
  email text,
  company_name text,
  role text,
  team_size_capture integer,
  created_at timestamptz default now()
);

create index if not exists audits_share_id_idx on audits(share_id);
create index if not exists audits_email_idx on audits(email);
`;
