import type { Metadata } from "next";
import Link from "next/link";
import { Composer } from "@/components/composer";
import { EmptyState } from "@/components/empty-state";
import { FeedFilters } from "@/components/feed-filters";
import { PenIcon } from "@/components/icons";
import { PostList } from "@/components/post-list";
import { getCurrentUser, getFeedPosts, type FeedFilter } from "@/lib/data";

export const metadata: Metadata = { title: "Feed" };

const filters: FeedFilter[] = ["all", "following", "art", "work", "research", "note", "milestone"];

export default async function FeedPage({ searchParams }: { searchParams: Promise<{ filter?: string; compose?: string }> }) {
  const params = await searchParams;
  const filter = filters.includes(params.filter as FeedFilter) ? (params.filter as FeedFilter) : "all";
  const user = await getCurrentUser();
  const posts = await getFeedPosts(filter, user?.id);

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="type-stamp">The common ledger</p>
          <h1 className="mt-3 font-display text-[2.4rem] leading-none tracking-[-0.035em]">Your feed</h1>
        </div>
        <Link href="/feed?compose=1" className="quiet-button hidden sm:inline-flex">
          <PenIcon className="h-4 w-4" />
          New entry
        </Link>
      </div>

      <div className="mt-7">
        <FeedFilters active={filter} />
      </div>

      <div className="mt-5">
        {user ? (
          <Composer userId={user.id} open={params.compose === "1"} />
        ) : (
          <p className="paper-panel px-5 py-4 text-sm text-ink-soft">
            <Link href={`/login?next=${encodeURIComponent("/feed?compose=1")}`} className="editorial-link no-underline text-ink">Sign in</Link> to keep an entry.
          </p>
        )}
      </div>

      <div className="mt-5">
        {posts.length ? (
          <PostList posts={posts} viewerId={user?.id} />
        ) : (
          <EmptyState
            title={filter === "following" ? "Your circle is quiet." : "The ledger is blank."}
            body={
              filter === "following"
                ? "Follow a few people whose work you want to keep seeing, then their entries will collect here."
                : "No entries have been published in this view yet. Start with your own note, or browse what others are keeping."
            }
            actionHref={!user ? "/login?next=/feed" : filter === "following" ? "/discover" : "/feed?compose=1"}
            actionLabel={!user ? "Sign in to join" : filter === "following" ? "Find people" : "Write the first entry"}
          />
        )}
      </div>
    </div>
  );
}
