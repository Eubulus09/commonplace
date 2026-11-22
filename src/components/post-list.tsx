import { PostCard } from "@/components/post-card";
import type { FeedPost } from "@/lib/types";

export function PostList({ posts, viewerId }: { posts: FeedPost[]; viewerId?: string }) {
  return (
    <div className="flex flex-col gap-5">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} viewerId={viewerId} />
      ))}
    </div>
  );
}
