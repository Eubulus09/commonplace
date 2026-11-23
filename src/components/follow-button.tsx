"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toggleFollow } from "@/app/actions/profile";

export function FollowButton({
  targetId,
  username,
  initialFollowing,
  isSelf,
  signedIn,
}: {
  targetId: string;
  username: string;
  initialFollowing: boolean;
  isSelf: boolean;
  signedIn: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (isSelf) return null;

  if (!signedIn) {
    return (
      <Link href={`/login?next=${encodeURIComponent(`/u/${username}`)}`} className="quiet-button">
        Sign in to follow
      </Link>
    );
  }

  function onToggle() {
    const previous = following;
    setFollowing(!previous);
    setError(null);

    startTransition(async () => {
      const result = await toggleFollow(targetId);
      if (result.error) {
        setFollowing(previous);
        setError(result.error);
      }
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        disabled={pending}
        aria-pressed={following}
        aria-label={following ? "Unfollow this person" : "Follow this person"}
        className={`${following ? "quiet-button" : "ink-button"} disabled:opacity-60`}
      >
        {following ? "Following" : "Follow"}
      </button>
      {error ? <p role="alert" className="mt-2 text-xs text-terracotta">{error}</p> : null}
    </div>
  );
}
