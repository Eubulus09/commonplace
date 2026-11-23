import Link from "next/link";
import type { FeedFilter } from "@/lib/data";

const options: { value: FeedFilter; label: string }[] = [
  { value: "all", label: "Everything" },
  { value: "following", label: "Following" },
  { value: "art", label: "Art" },
  { value: "work", label: "Work" },
  { value: "research", label: "Research" },
  { value: "note", label: "Field notes" },
  { value: "milestone", label: "Milestones" },
];

export function FeedFilters({ active }: { active: FeedFilter }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none]">
      {options.map((option) => {
        const isActive = active === option.value;
        return (
          <Link
            key={option.value}
            href={option.value === "all" ? "/feed" : `/feed?filter=${option.value}`}
            aria-current={isActive ? "page" : undefined}
            className={`shrink-0 border px-3 py-2 type-stamp no-underline transition-colors ${
              isActive ? "border-ink bg-ink text-paper-light" : "border-rule text-ink-soft hover:border-ink hover:text-ink"
            }`}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
