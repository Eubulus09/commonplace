import Link from "next/link";
import { Logo } from "@/components/logo";
import { Avatar } from "@/components/avatar";
import type { Profile } from "@/lib/types";

export function TopBar({ profile }: { profile: Profile | null }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-rule bg-paper/95 px-4 py-3 backdrop-blur-sm lg:hidden">
      <Logo compact />
      <Link href={profile ? `/u/${profile.username}` : "/login"} aria-label={profile ? `View @${profile.username}'s profile` : "Sign in"} className="no-underline">
        {profile ? <Avatar profile={profile} size={34} /> : <span className="type-stamp">Sign in</span>}
      </Link>
    </header>
  );
}
