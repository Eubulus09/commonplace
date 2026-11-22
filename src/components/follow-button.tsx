"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toggleFollow } from "@/app/actions/profile";

export function FollowButton({
  targetId,
  initialFollowing,
  isSelf,
  signedIn,
}: {
  targetId: string;
  initialFollowing: boolean;
  isSelf: boolean;
  signedIn: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [, startTransition] = useTransition();

  if (isSelf) return null;
  if (!signedIn) {
    return (
      <Link href="/login" className="quiet-button">
        Sign in to follow
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setFollowing((value) => !value);
        startTransition(async () => {
          await toggleFollow(targetId);
        });
      }}
      aria-pressed={following}
      className={following ? "quiet-button" : "ink-button"}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
