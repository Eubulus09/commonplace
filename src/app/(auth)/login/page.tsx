import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; notice?: string; error?: string }> }) {
  const params = await searchParams;
  const next = params.next?.startsWith("/") && !params.next.startsWith("//") ? params.next : "/feed";

  return (
    <div className="w-full max-w-[520px]">
      {params.notice === "check-email" ? (
        <p className="mb-5 border border-rule bg-paper-light px-4 py-3 text-sm text-ink-soft">
          Check your email to confirm the account, then sign in.
        </p>
      ) : null}
      {params.error === "confirmation" ? (
        <p className="mb-5 border border-rule bg-paper-light px-4 py-3 text-sm text-terracotta">
          That confirmation link did not work. Try signing in, or create a new confirmation link.
        </p>
      ) : null}
      <AuthForm mode="login" next={next} />
    </div>
  );
}
