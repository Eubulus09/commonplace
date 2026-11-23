import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { PostList } from "@/components/post-list";
import { getCurrentUser, getFeedPosts, getPostsByTag, getTrendingTags, searchPosts } from "@/lib/data";

export const metadata: Metadata = { title: "Discover" };

export default async function DiscoverPage({ searchParams }: { searchParams: Promise<{ tag?: string; q?: string }> }) {
  const params = await searchParams;
  const tag = params.tag?.trim().toLowerCase() || "";
  const query = params.q?.trim() || "";
  const user = await getCurrentUser();

  const [posts, tags] = await Promise.all([
    tag
      ? getPostsByTag(tag, user?.id)
      : query
        ? searchPosts(query, user?.id)
        : getFeedPosts("all", user?.id),
    getTrendingTags(),
  ]);

  return (
    <div>
      <p className="type-stamp">Open shelf</p>
      <h1 className="mt-3 font-display text-[2.4rem] leading-none tracking-[-0.035em]">Discover</h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-soft">
        Search by subject, material, method, or whatever word keeps coming back.
      </p>

      <form action="/discover" method="GET" className="mt-7 flex border-b border-ink">
        <input name="q" defaultValue={query} placeholder="Search the ledger" aria-label="Search the ledger" className="field flex-1 border-0" />
        <button type="submit" className="px-3 type-stamp hover:text-terracotta">
          Search
        </button>
      </form>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="type-stamp mr-1">Common tags</span>
        {tags.map((item) => (
          <Link
            key={item.tag}
            href={`/discover?tag=${encodeURIComponent(item.tag)}`}
            className={`tag-pill no-underline hover:border-ink ${tag === item.tag ? "border-ink bg-ink text-paper-light" : ""}`}
          >
            #{item.tag}
          </Link>
        ))}
        {(tag || query) && (
          <Link href="/discover" className="type-stamp ml-2 no-underline hover:text-terracotta">
            Clear
          </Link>
        )}
      </div>

      {tag || query ? (
        <p className="mt-8 type-stamp">
          {tag ? `Tagged #${tag}` : `Results for “${query}”`} · {posts.length} {posts.length === 1 ? "entry" : "entries"}
        </p>
      ) : null}

      <div className="mt-5">
        {posts.length ? (
          <PostList posts={posts} viewerId={user?.id} />
        ) : (
          <EmptyState
            title="Nothing on this shelf yet."
            body="Try a different word, or wander the full feed to see what people are recording."
            actionHref="/feed"
            actionLabel="Back to the feed"
          />
        )}
      </div>
    </div>
  );
}
