"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Logo />
      <p className="type-stamp mt-12">Something came loose</p>
      <h1 className="mt-4 font-display text-[2.8rem] leading-tight tracking-[-0.03em]">This page could not be read.</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
        The ledger is still here. Try again, or return to the feed.
      </p>
      {error.digest ? <p className="type-stamp mt-3 opacity-70">Reference: {error.digest}</p> : null}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="ink-button">
          Try again
        </button>
        <Link href="/feed" className="quiet-button">
          Return to the feed
        </Link>
      </div>
    </main>
  );
}
