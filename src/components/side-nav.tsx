"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckIcon, CompassIcon, HomeIcon, PenIcon, SettingsIcon, BookmarkIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { Avatar } from "@/components/avatar";
import { signOut } from "@/app/actions/auth";
import type { Profile } from "@/lib/types";

const items = [
  { href: "/feed", label: "Feed", icon: HomeIcon },
  { href: "/discover", label: "Discover", icon: CompassIcon },
  { href: "/saved", label: "Saved", icon: BookmarkIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export function SideNav({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col justify-between border-r border-rule px-6 py-8 lg:flex">
        <div>
          <Logo />
          <p className="mt-3 max-w-[180px] font-display text-[0.95rem] leading-snug text-ink-soft">
            A place to keep what you make, find, and are still figuring out.
          </p>

          <nav className="mt-10 flex flex-col gap-1" aria-label="Primary">
            {items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`group flex items-center gap-3 border-l-2 py-2 pl-3 pr-2 text-sm no-underline transition-colors ${
                    active ? "border-terracotta text-ink" : "border-transparent text-ink-soft hover:border-rule hover:text-ink"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <Link
            href="/feed?compose=1"
            className="ink-button mt-8 w-full"
          >
            <PenIcon className="h-4 w-4" />
            New entry
          </Link>
        </div>

        <div className="border-t border-rule pt-5">
          {profile ? (
            <div className="flex items-center gap-3">
              <Link href={`/u/${profile.username}`} aria-label={`View @${profile.username}'s profile`} className="no-underline">
                <Avatar profile={profile} size={40} />
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/u/${profile.username}`} className="block truncate text-sm font-medium no-underline hover:text-terracotta">
                  {profile.display_name}
                </Link>
                <p className="truncate type-stamp">@{profile.username}</p>
              </div>
              <form action={signOut}>
                <button type="submit" className="type-stamp hover:text-terracotta" title="Sign out">
                  Out
                </button>
              </form>
            </div>
          ) : (
            <Link href="/login" className="ink-button w-full">
              Sign in
            </Link>
          )}
        </div>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-rule bg-paper/95 px-2 py-2 backdrop-blur-sm lg:hidden" aria-label="Mobile">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-w-[58px] flex-col items-center gap-1 py-1 no-underline ${active ? "text-terracotta" : "text-ink-soft"}`}
            >
              {active ? <CheckIcon className="h-[18px] w-[18px]" /> : <Icon className="h-[18px] w-[18px]" />}
              <span className="type-stamp text-[0.58rem]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
