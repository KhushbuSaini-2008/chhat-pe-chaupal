import { createClient } from "@supabase/supabase-js";

// SERVER ONLY. Never import this file in a "use client" component.
export function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } }
  );
}