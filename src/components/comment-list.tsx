import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { formatRelative } from "@/lib/format";
import type { Comment } from "@/lib/types";

export function CommentList({ comments }: { comments: Comment[] }) {
  if (!comments.length) {
    return <p className="type-stamp py-8 text-center">No notes yet. Be the first to respond.</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-rule">
      {comments.map((comment) => (
        <li key={comment.id} className="flex gap-3 py-5">
          <Link href={`/u/${comment.author.username}`} className="no-underline">
            <Avatar profile={comment.author} size={36} />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <Link href={`/u/${comment.author.username}`} className="text-sm font-medium no-underline hover:text-terracotta">
                {comment.author.display_name}
              </Link>
              <span className="type-stamp">@{comment.author.username}</span>
              <span className="type-stamp ml-auto opacity-70">{formatRelative(comment.created_at)}</span>
            </div>
            <p className="mt-2 whitespace-pre-line text-[0.9rem] leading-relaxed text-ink-soft">{comment.body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
