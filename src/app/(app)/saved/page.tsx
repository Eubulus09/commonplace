import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { PostList } from "@/components/post-list";
import { getCurrentUser, getBookmarkedPosts } from "@/lib/data";

export const metadata: Metadata = { title: "Saved" };

export default async function SavedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/saved");
  const posts = await getBookmarkedPosts(user.id);

  return (
    <div>
      <p className="type-stamp">Kept for later</p>
      <h1 className="mt-3 font-display text-[2.4rem] leading-none tracking-[-0.035em]">Saved</h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-soft">
        A private shelf of entries you want to return to.
      </p>

      <div className="mt-7">
        {posts.length ? (
          <PostList posts={posts} viewerId={user?.id} />
        ) : (
          <EmptyState
            title="No saved entries."
            body="Use the Save button on any entry to keep it here. Only you can see this shelf."
            actionHref="/feed"
            actionLabel="Browse the feed"
          />
        )}
      </div>
    </div>
  );
}
