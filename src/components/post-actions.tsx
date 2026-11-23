"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toggleBookmark, toggleLike } from "@/app/actions/posts";
import { BookmarkIcon, CommentIcon, HeartIcon } from "@/components/icons";

export function PostActions({
  postId,
  liked,
  bookmarked,
  likes,
  comments,
  signedIn = true,
}: {
  postId: string;
  liked: boolean;
  bookmarked: boolean;
  likes: number;
  comments: number;
  signedIn?: boolean;
}) {
  const [isLiked, setIsLiked] = useState(liked);
  const [isSaved, setIsSaved] = useState(bookmarked);
  const [likeCount, setLikeCount] = useState(likes);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!signedIn) {
    return (
      <div className="mt-5 flex items-center gap-1 border-t border-rule pt-3">
        <Link href={`/p/${postId}#comments`} aria-label={`${comments} comments`} className="flex items-center gap-2 px-2 py-1.5 type-stamp no-underline text-ink-soft hover:text-terracotta">
          <CommentIcon className="h-[17px] w-[17px]" />
          <span>{comments}</span>
        </Link>
        <Link href={`/login?next=${encodeURIComponent(`/p/${postId}`)}`} className="ml-auto px-2 py-1.5 type-stamp no-underline text-ink-soft hover:text-terracotta">
          Sign in to save
        </Link>
      </div>
    );
  }

  function onLike() {
    const previousLiked = isLiked;
    const previousCount = likeCount;
    setIsLiked(!previousLiked);
    setLikeCount(previousCount + (previousLiked ? -1 : 1));
    setError(null);

    startTransition(async () => {
      const result = await toggleLike(postId);
      if (result.error) {
        setIsLiked(previousLiked);
        setLikeCount(previousCount);
        setError(result.error);
      }
    });
  }

  function onBookmark() {
    const previousSaved = isSaved;
    setIsSaved(!previousSaved);
    setError(null);

    startTransition(async () => {
      const result = await toggleBookmark(postId);
      if (result.error) {
        setIsSaved(previousSaved);
        setError(result.error);
      }
    });
  }

  return (
    <div className="mt-5 flex items-center gap-1 border-t border-rule pt-3">
      <button
        type="button"
        onClick={onLike}
        disabled={pending}
        aria-pressed={isLiked}
        aria-label={`${isLiked ? "Unlike" : "Like"}, ${likeCount} likes`}
        className={`flex items-center gap-2 px-2 py-1.5 type-stamp transition-colors hover:text-terracotta disabled:opacity-60 ${isLiked ? "text-terracotta" : "text-ink-soft"}`}
      >
        <HeartIcon filled={isLiked} className="h-[17px] w-[17px]" />
        <span>{likeCount}</span>
      </button>

      <Link href={`/p/${postId}#comments`} aria-label={`${comments} comments`} className="flex items-center gap-2 px-2 py-1.5 type-stamp no-underline text-ink-soft hover:text-terracotta">
        <CommentIcon className="h-[17px] w-[17px]" />
        <span>{comments}</span>
      </Link>

      <button
        type="button"
        onClick={onBookmark}
        disabled={pending}
        aria-pressed={isSaved}
        aria-label={isSaved ? "Remove saved entry" : "Save entry"}
        className={`ml-auto flex items-center gap-2 px-2 py-1.5 type-stamp transition-colors hover:text-terracotta disabled:opacity-60 ${isSaved ? "text-terracotta" : "text-ink-soft"}`}
      >
        <BookmarkIcon filled={isSaved} className="h-[17px] w-[17px]" />
        <span>{isSaved ? "Saved" : "Save"}</span>
      </button>

      {error ? <p role="alert" className="w-full px-2 pt-2 text-xs text-terracotta">{error}</p> : null}
    </div>
  );
}
