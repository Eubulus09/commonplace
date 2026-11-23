import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { DeletePostButton } from "@/components/delete-post-button";
import { PostActions } from "@/components/post-actions";
import { cssUrl, formatRelative, kindLabels, mediaUrl } from "@/lib/format";
import type { FeedPost, PostKind } from "@/lib/types";

const kindColors: Record<PostKind, string> = {
  art: "text-plum",
  work: "text-faded-blue",
  research: "text-moss",
  note: "text-ink-soft",
  milestone: "text-terracotta",
};

export function PostCard({ post, viewerId }: { post: FeedPost; viewerId?: string }) {
  const stats = post.post_stats[0];
  const isOwner = viewerId === post.author_id;

  return (
    <article className="paper-panel">
      <div className="flex items-start gap-3 px-5 pt-5 sm:px-6">
        <Link href={`/u/${post.author.username}`} aria-label={`View @${post.author.username}'s profile`} className="no-underline">
          <Avatar profile={post.author} size={42} />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <Link href={`/u/${post.author.username}`} className="text-[0.95rem] font-medium no-underline hover:text-terracotta">
              {post.author.display_name}
            </Link>
            <span className="type-stamp">@{post.author.username}</span>
          </div>
          <p className="mt-1 truncate type-stamp">{post.author.headline || post.author.practice || "Independent"}</p>
        </div>

        <div className="shrink-0 text-right">
          <p className={`type-stamp ${kindColors[post.kind]}`}>{kindLabels[post.kind]}</p>
          <p className="mt-1 type-stamp opacity-70">{formatRelative(post.created_at)}</p>
        </div>
      </div>

      <div className="px-5 pt-5 sm:px-6">
        {post.title ? (
          <h2 className="font-display text-[1.65rem] leading-tight tracking-[-0.02em]">
            <Link href={`/p/${post.id}`} className="no-underline hover:text-terracotta">
              {post.title}
            </Link>
          </h2>
        ) : null}

        <p className="mt-3 whitespace-pre-line text-[0.94rem] leading-[1.7] text-ink-soft">{post.body}</p>

        {post.media.length ? (
          <div className={`mt-5 grid gap-2 ${post.media.length > 1 ? "sm:grid-cols-2" : ""}`}>
            {post.media.map((item, index) => {
              const src = mediaUrl(item.path);
              if (!src) return null;
              return (
                <div
                  key={`${item.path}-${index}`}
                  role="img"
                  aria-label={item.alt}
                  className="aspect-[3/2] border border-rule bg-paper-deep bg-cover bg-center"
                  style={{ backgroundImage: cssUrl(src) }}
                />
              );
            })}
          </div>
        ) : null}

        {post.tags.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link key={tag} href={`/discover?tag=${encodeURIComponent(tag)}`} className="tag-pill no-underline hover:border-ink">
                #{tag}
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      <div className="px-5 pb-4 pt-5 sm:px-6">
        <PostActions
          key={`${post.liked}-${post.bookmarked}-${stats?.likes ?? 0}-${stats?.comments ?? 0}`}
          postId={post.id}
          liked={post.liked}
          bookmarked={post.bookmarked}
          likes={stats?.likes ?? 0}
          comments={stats?.comments ?? 0}
          signedIn={Boolean(viewerId)}
        />
        {isOwner ? <DeletePostButton postId={post.id} /> : null}
      </div>
    </article>
  );
}
