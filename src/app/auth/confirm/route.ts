import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/format";

const otpTypes: EmailOtpType[] = ["signup", "email", "magiclink", "invite", "recovery", "email_change"];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const rawType = url.searchParams.get("type");
  const type = otpTypes.find((item) => item === rawType);
  const next = safeNextPath(url.searchParams.get("next"));

  if (!code && !(tokenHash && type)) {
    return NextResponse.redirect(new URL("/login?error=confirmation", url.origin));
  }

  const supabase = await createClient();
  let error;

  if (code) {
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  } else if (tokenHash && type) {
    ({ error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type }));
  }

  if (error) return NextResponse.redirect(new URL("/login?error=confirmation", url.origin));
  return NextResponse.redirect(new URL(next, url.origin));
}
