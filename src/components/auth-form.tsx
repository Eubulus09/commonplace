"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, signUp, type AuthState } from "@/app/actions/auth";
import { ArrowIcon } from "@/components/icons";

export function AuthForm({ mode, next = "/feed" }: { mode: "login" | "signup"; next?: string }) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(mode === "login" ? signIn : signUp, {});
  const isLogin = mode === "login";

  return (
    <section className="paper-panel w-full max-w-[520px] px-6 py-8 sm:px-10 sm:py-10">
      <p className="type-stamp">{isLogin ? "Return to the ledger" : "Start a ledger"}</p>
      <h1 className="mt-3 font-display text-[2.3rem] leading-[1.05] tracking-[-0.03em]">
        {isLogin ? "Welcome back." : "Keep what you make."}
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-ink-soft">
        {isLogin
          ? "Sign in to read your feed, save finds, and continue the conversation."
          : "One home for work, notes, research, and the things in between."}
      </p>

      <form action={formAction} className="mt-8">
        <input type="hidden" name="next" value={next} />

        {!isLogin ? (
          <>
            <label className="type-stamp block">
              Username
              <input name="username" className="field mt-2" autoComplete="username" pattern="[a-z0-9_]{3,30}" required />
            </label>
            <label className="type-stamp mt-5 block">
              Display name
              <input name="display_name" className="field mt-2" autoComplete="name" required />
            </label>
            <label className="type-stamp mt-5 block">
              What do you do?
              <input name="practice" className="field mt-2" placeholder="Printmaker, researcher, designer…" />
            </label>
          </>
        ) : null}

        <label className="type-stamp mt-5 block first:mt-0">
          Email
          <input name="email" type="email" className="field mt-2" autoComplete="email" required />
        </label>
        <label className="type-stamp mt-5 block">
          Password
          <input name="password" type="password" className="field mt-2" autoComplete={isLogin ? "current-password" : "new-password"} minLength={8} required />
        </label>

        {state.error ? <p className="mt-5 text-sm text-terracotta">{state.error}</p> : null}

        <button type="submit" disabled={pending} className="ink-button mt-8 w-full">
          {pending ? "One moment…" : isLogin ? "Sign in" : "Create account"}
          <ArrowIcon className="h-4 w-4" />
        </button>
      </form>

      <p className="mt-7 border-t border-rule pt-5 text-sm text-ink-soft">
        {isLogin ? "New here?" : "Already have a ledger?"}{" "}
        <Link href={isLogin ? "/signup" : "/login"} className="editorial-link no-underline text-ink">
          {isLogin ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </section>
  );
}
