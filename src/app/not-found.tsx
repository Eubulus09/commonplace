import Link from "next/link";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Logo />
      <p className="type-stamp mt-12">404 · Missing record</p>
      <h1 className="mt-4 font-display text-[2.8rem] leading-tight tracking-[-0.03em]">This page is not in the ledger.</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
        The entry may have been removed, or the address may be wrong. The feed is still here.
      </p>
      <Link href="/feed" className="ink-button mt-8">
        Return to the feed
      </Link>
    </main>
  );
}
