import Link from "next/link";
import { ArrowIcon } from "@/components/icons";

export function EmptyState({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="paper-panel px-6 py-14 text-center">
      <p className="font-display text-2xl tracking-[-0.02em]">{title}</p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">{body}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="ink-button mt-6">
          {actionLabel}
          <ArrowIcon className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}
