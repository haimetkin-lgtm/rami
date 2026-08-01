import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// כשאין env vars (פיתוח מקומי בלי .env.local) — client דמה שלא קורס
const isConfigured = url.startsWith("http");

export const supabase = isConfigured
  ? createClient(url, key)
  : createClient("https://placeholder.supabase.co", "placeholder");

export const supabaseConfigured = isConfigured;

// טיפוסי מסד הנתונים
export interface CommitteeRow {
  id: string;
  name: string;
  decisions_count: number;
  classified: boolean;
  classified_at: string | null;
}

export interface CaseRow {
  id: string;
  created_at: string;
  yishuv_name: string;
  block: string | null;
  plot: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  price_nis: number;
  paid: boolean;
  status: "pending_payment" | "queued_for_classification" | "ready" | "sent";
  report_html: string | null;
}

export interface Stage2CaseRow {
  id: string;
  created_at: string;
  stage1_case_id: string | null;
  yishuv_name: string;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  price_nis: number;
  paid: boolean;
  status: "pending_payment" | "pending_upload" | "uploaded" | "analyzing" | "pending_admin_review" | "ready" | "sent";
  letter_file_path: string | null;
  assessment_file_path: string | null;
  argument_document: string | null;
}

export const PRICE_NIS = 480;
export const STAGE2_PRICE_NIS = 1400;
