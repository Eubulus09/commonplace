"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/format";

export type AuthState = { error?: string };

async function appOrigin() {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  if (!host) return null;
  const protocol = headerList.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

function friendlySignUpError(message: string) {
  if (message.includes("duplicate key value") || message.includes("unique constraint")) {
    return "That username is already taken. Try another one.";
  }
  return message;
}

export async function signIn(_state: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"));

  if (!email || !password) return { error: "Email and password are required." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signUp(_state: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const displayName = String(formData.get("display_name") ?? "").trim();
  const practice = String(formData.get("practice") ?? "").trim();

  if (!email || !password) return { error: "Email and password are required." };
  if (!/^[a-z0-9_]{3,30}$/.test(username)) {
    return { error: "Username must be 3–30 characters: lowercase letters, numbers, or underscores." };
  }
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const next = safeNextPath(formData.get("next"));
  const origin = await appOrigin();
  const supabase = await createClient();

  const { data: existing } = await supabase.from("profiles").select("username").eq("username", username).maybeSingle();
  if (existing) return { error: "That username is already taken. Try another one." };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        display_name: displayName || username,
        practice,
        headline: "",
      },
      ...(origin ? { emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(next)}` } : {}),
    },
  });

  if (error) return { error: friendlySignUpError(error.message) };
  if (!data.session) redirect(`/login?notice=check-email&next=${encodeURIComponent(next)}`);

  revalidatePath("/", "layout");
  redirect("/feed");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
