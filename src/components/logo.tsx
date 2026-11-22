import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/feed" className="inline-flex items-baseline gap-2 no-underline" aria-label="Commonplace home">
      <span className="font-display text-[1.35rem] leading-none tracking-[-0.03em] text-ink">Commonplace</span>
      {!compact ? <span className="type-stamp hidden sm:inline">a social ledger</span> : null}
    </Link>
  );
}
