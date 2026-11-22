import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function createClient() {
  if (!url || !key) {
    throw new Error("Supabase environment variables are missing.");
  }

  return createBrowserClient<Database>(url, key);
}
