import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
