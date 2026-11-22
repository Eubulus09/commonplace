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
}: {
  postId: string;
  liked: boolean;
  bookmarked: boolean;
  likes: number;
  comments: number;
}) {
  const [isLiked, setIsLiked] = useState(liked);
  const [isSaved, setIsSaved] = useState(bookmarked);
  const [likeCount, setLikeCount] = useState(likes);
  const [, startTransition] = useTransition();

  function onLike() {
    setIsLiked((value) => !value);
    setLikeCount((value) => value + (isLiked ? -1 : 1));
    startTransition(async () => {
      await toggleLike(postId);
    });
  }

  function onBookmark() {
    setIsSaved((value) => !value);
    startTransition(async () => {
      await toggleBookmark(postId);
    });
  }

  return (
    <div className="mt-5 flex items-center gap-1 border-t border-rule pt-3">
      <button
        type="button"
        onClick={onLike}
        aria-pressed={isLiked}
        className={`flex items-center gap-2 px-2 py-1.5 type-stamp transition-colors hover:text-terracotta ${isLiked ? "text-terracotta" : "text-ink-soft"}`}
      >
        <HeartIcon filled={isLiked} className="h-[17px] w-[17px]" />
        <span>{likeCount}</span>
      </button>

      <Link href={`/p/${postId}#comments`} className="flex items-center gap-2 px-2 py-1.5 type-stamp no-underline text-ink-soft hover:text-terracotta">
        <CommentIcon className="h-[17px] w-[17px]" />
        <span>{comments}</span>
      </Link>

      <button
        type="button"
        onClick={onBookmark}
        aria-pressed={isSaved}
        className={`ml-auto flex items-center gap-2 px-2 py-1.5 type-stamp transition-colors hover:text-terracotta ${isSaved ? "text-terracotta" : "text-ink-soft"}`}
      >
        <BookmarkIcon filled={isSaved} className="h-[17px] w-[17px]" />
        <span>{isSaved ? "Saved" : "Save"}</span>
      </button>
    </div>
  );
}
