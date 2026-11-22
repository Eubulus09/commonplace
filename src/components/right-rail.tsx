import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { ArrowIcon } from "@/components/icons";
import type { Profile } from "@/lib/types";

export function RightRail({
  tags,
  profiles,
}: {
  tags: { tag: string; count: number }[];
  profiles: Profile[];
}) {
  return (
    <aside className="sticky top-0 hidden h-screen w-[290px] shrink-0 overflow-y-auto border-l border-rule px-6 py-8 xl:block">
      <section>
        <p className="type-stamp">Field notes</p>
        <p className="mt-4 font-display text-[1.15rem] leading-snug text-ink">
          Keep the draft, the dead end, and the finished thing. They all count as work.
        </p>
        <div className="mt-5 h-px bg-rule" />
      </section>

      <section className="mt-8">
        <p className="type-stamp">In circulation</p>
        <ul className="mt-4 flex flex-col gap-2">
          {tags.length ? (
            tags.map((item) => (
              <li key={item.tag}>
                <Link href={`/discover?tag=${encodeURIComponent(item.tag)}`} className="group flex items-center justify-between no-underline">
                  <span className="font-mono text-[0.78rem] text-ink-soft group-hover:text-terracotta">#{item.tag}</span>
                  <span className="type-stamp">{item.count}</span>
                </Link>
              </li>
            ))
          ) : (
            <li className="type-stamp">No tags yet</li>
          )}
        </ul>
      </section>

      <section className="mt-9">
        <div className="flex items-center justify-between">
          <p className="type-stamp">People to know</p>
          <Link href="/discover" className="type-stamp no-underline hover:text-terracotta">
            All
          </Link>
        </div>
        <ul className="mt-4 flex flex-col gap-4">
          {profiles.map((profile) => (
            <li key={profile.id} className="flex items-start gap-3">
              <Link href={`/u/${profile.username}`} className="no-underline">
                <Avatar profile={profile} size={36} />
              </Link>
              <div className="min-w-0">
                <Link href={`/u/${profile.username}`} className="block truncate text-[0.82rem] font-medium no-underline hover:text-terracotta">
                  {profile.display_name}
                </Link>
                <p className="truncate type-stamp mt-1">{profile.practice || "Independent"}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 border-t border-rule pt-6">
        <p className="type-stamp">About this place</p>
        <p className="mt-3 text-[0.8rem] leading-relaxed text-ink-soft">
          Commonplace is for people whose work does not fit one label: artists, researchers, designers, writers, and anyone still making something.
        </p>
        <Link href="/discover" className="mt-4 inline-flex items-center gap-2 type-stamp no-underline hover:text-terracotta">
          Browse the ledger <ArrowIcon className="h-3 w-3" />
        </Link>
      </section>
    </aside>
  );
}
