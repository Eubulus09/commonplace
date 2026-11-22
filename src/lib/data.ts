import { createClient } from "@/lib/supabase/server";
import type { Comment, FeedPost, Post, PostKind, PostStats, Profile } from "@/lib/types";

const profileFields = "id, username, display_name, headline, practice, bio, location, links, avatar_path, cover_path, created_at";

const postSelect = `
  id, author_id, kind, title, body, media, tags, created_at, updated_at,
  author:profiles!posts_author_id_fkey(${profileFields})
`;

const commentSelect = `
  id, post_id, author_id, parent_id, body, created_at,
  author:profiles!comments_author_id_fkey(${profileFields})
`;

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;
export type FeedFilter = "all" | "following" | PostKind;

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select(profileFields).eq("id", user.id).maybeSingle();
  return (data as Profile | null) ?? null;
}

async function hydratePosts(posts: Post[], viewerId: string | undefined, supabase: SupabaseServer): Promise<FeedPost[]> {
  if (!posts.length) return [];

  const ids = posts.map((post) => post.id);
  const [statsResult, likesResult, bookmarksResult] = await Promise.all([
    supabase.from("post_stats").select("post_id, likes, comments, bookmarks").in("post_id", ids),
    viewerId ? supabase.from("post_likes").select("post_id").eq("user_id", viewerId).in("post_id", ids) : Promise.resolve({ data: [] }),
    viewerId ? supabase.from("post_bookmarks").select("post_id").eq("user_id", viewerId).in("post_id", ids) : Promise.resolve({ data: [] }),
  ]);

  const stats = new Map<string, PostStats>((statsResult.data ?? []).map((item) => [item.post_id, item]));
  const liked = new Set((likesResult.data ?? []).map((item) => item.post_id));
  const bookmarked = new Set((bookmarksResult.data ?? []).map((item) => item.post_id));

  return posts.map((post) => ({
    ...post,
    post_stats: [stats.get(post.id) ?? { post_id: post.id, likes: 0, comments: 0, bookmarks: 0 }],
    liked: liked.has(post.id),
    bookmarked: bookmarked.has(post.id),
  }));
}

export async function getFeedPosts(filter: FeedFilter = "all", viewerId?: string): Promise<FeedPost[]> {
  const supabase = await createClient();
  let query = supabase.from("posts").select(postSelect).order("created_at", { ascending: false }).limit(40);

  if (filter === "following") {
    if (!viewerId) return [];
    const { data: follows } = await supabase.from("follows").select("following_id").eq("follower_id", viewerId);
    const ids = (follows ?? []).map((item) => item.following_id);
    if (!ids.length) return [];
    query = query.in("author_id", ids);
  } else if (filter !== "all") {
    query = query.eq("kind", filter);
  }

  const { data, error } = await query;
  if (error) throw error;

  return hydratePosts((data ?? []) as unknown as Post[], viewerId, supabase);
}

export async function getBookmarkedPosts(viewerId: string): Promise<FeedPost[]> {
  const supabase = await createClient();
  const { data: saved } = await supabase
    .from("post_bookmarks")
    .select("post_id")
    .eq("user_id", viewerId)
    .order("created_at", { ascending: false });

  const ids = (saved ?? []).map((item) => item.post_id);
  if (!ids.length) return [];

  const { data, error } = await supabase.from("posts").select(postSelect).in("id", ids);
  if (error) throw error;

  const posts = (data ?? []) as unknown as Post[];
  const ordered = ids.map((id) => posts.find((post) => post.id === id)).filter(Boolean) as Post[];
  return hydratePosts(ordered, viewerId, supabase);
}

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select(profileFields).eq("username", username).maybeSingle();
  return (data as Profile | null) ?? null;
}

export async function getProfileById(id: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select(profileFields).eq("id", id).maybeSingle();
  return (data as Profile | null) ?? null;
}

export async function getPostsByAuthor(authorId: string, viewerId?: string): Promise<FeedPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(postSelect)
    .eq("author_id", authorId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return hydratePosts((data ?? []) as unknown as Post[], viewerId, supabase);
}

export async function getPostsByTag(tag: string, viewerId?: string): Promise<FeedPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(postSelect)
    .contains("tags", [tag.toLowerCase()])
    .order("created_at", { ascending: false })
    .limit(60);

  if (error) throw error;
  return hydratePosts((data ?? []) as unknown as Post[], viewerId, supabase);
}

export async function searchPosts(query: string, viewerId?: string): Promise<FeedPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(postSelect)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;

  const needle = query.trim().toLowerCase();
  const matches = ((data ?? []) as unknown as Post[]).filter((post) =>
    [post.title ?? "", post.body, ...post.tags].some((value) => value.toLowerCase().includes(needle)),
  );

  return hydratePosts(matches, viewerId, supabase);
}

export async function getPost(id: string, viewerId?: string): Promise<FeedPost | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("posts").select(postSelect).eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const [post] = await hydratePosts([data as unknown as Post], viewerId, supabase);
  return post ?? null;
}

export async function getComments(postId: string): Promise<Comment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select(commentSelect)
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as Comment[];
}

export async function isFollowing(followerId: string | undefined, followingId: string): Promise<boolean> {
  if (!followerId || followerId === followingId) return false;
  const supabase = await createClient();
  const { data } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle();
  return Boolean(data);
}

export async function getFollowCounts(profileId: string) {
  const supabase = await createClient();
  const [followers, following] = await Promise.all([
    supabase.from("follows").select("follower_id", { count: "exact", head: true }).eq("following_id", profileId),
    supabase.from("follows").select("following_id", { count: "exact", head: true }).eq("follower_id", profileId),
  ]);
  return { followers: followers.count ?? 0, following: following.count ?? 0 };
}

export async function getSuggestedProfiles(viewerId?: string): Promise<Profile[]> {
  const supabase = await createClient();
  let query = supabase.from("profiles").select(profileFields).order("created_at", { ascending: false }).limit(5);
  if (viewerId) query = query.neq("id", viewerId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function getTrendingTags(): Promise<{ tag: string; count: number }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("posts").select("tags").order("created_at", { ascending: false }).limit(60);
  if (error) throw error;

  const counts = new Map<string, number>();
  (data ?? []).forEach((row) => {
    (row.tags ?? []).forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));
  });

  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, 6);
}
