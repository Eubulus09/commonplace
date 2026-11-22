"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseTags } from "@/lib/format";
import type { MediaItem, PostKind } from "@/lib/types";

export type PostState = { error?: string; success?: boolean };
export type CommentState = { error?: string; success?: boolean };

const kinds: PostKind[] = ["art", "work", "research", "note", "milestone"];

function refresh() {
  revalidatePath("/", "layout");
}

async function requireUserId() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return { supabase, userId: data.user?.id };
}

function parseMedia(raw: FormDataEntryValue | null): MediaItem[] {
  if (typeof raw !== "string" || !raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is MediaItem => {
        if (!item || typeof item !== "object") return false;
        const candidate = item as Record<string, unknown>;
        return typeof candidate.path === "string" && typeof candidate.alt === "string";
      })
      .slice(0, 4);
  } catch {
    return [];
  }
}

export async function createPost(_state: PostState, formData: FormData): Promise<PostState> {
  const { supabase, userId } = await requireUserId();
  if (!userId) return { error: "Please sign in to publish." };

  const body = String(formData.get("body") ?? "").trim();
  const rawKind = String(formData.get("kind") ?? "note") as PostKind;
  const kind = kinds.includes(rawKind) ? rawKind : "note";
  const title = String(formData.get("title") ?? "").trim() || null;
  const tags = parseTags(String(formData.get("tags") ?? ""));
  const media = parseMedia(formData.get("media"));

  if (!body) return { error: "Write a little something before publishing." };
  if (body.length > 5000) return { error: "Keep posts under 5,000 characters." };

  const { error } = await supabase.from("posts").insert({
    author_id: userId,
    kind,
    title,
    body,
    tags,
    media,
  });

  if (error) return { error: error.message };
  refresh();
  return { success: true };
}

export async function toggleLike(postId: string) {
  const { supabase, userId } = await requireUserId();
  if (!userId) return;

  const { data } = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("user_id", userId)
    .eq("post_id", postId)
    .maybeSingle();

  if (data) {
    await supabase.from("post_likes").delete().eq("user_id", userId).eq("post_id", postId);
  } else {
    await supabase.from("post_likes").insert({ user_id: userId, post_id: postId });
  }
  refresh();
}

export async function toggleBookmark(postId: string) {
  const { supabase, userId } = await requireUserId();
  if (!userId) return;

  const { data } = await supabase
    .from("post_bookmarks")
    .select("post_id")
    .eq("user_id", userId)
    .eq("post_id", postId)
    .maybeSingle();

  if (data) {
    await supabase.from("post_bookmarks").delete().eq("user_id", userId).eq("post_id", postId);
  } else {
    await supabase.from("post_bookmarks").insert({ user_id: userId, post_id: postId });
  }
  refresh();
}

export async function addComment(_state: CommentState, formData: FormData): Promise<CommentState> {
  const { supabase, userId } = await requireUserId();
  if (!userId) return { error: "Please sign in to comment." };

  const postId = String(formData.get("post_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const parentId = String(formData.get("parent_id") ?? "") || null;

  if (!postId) return { error: "This comment has no post." };
  if (!body) return { error: "Write a comment first." };

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    author_id: userId,
    parent_id: parentId,
    body,
  });

  if (error) return { error: error.message };
  refresh();
  return { success: true };
}

export async function deletePost(postId: string) {
  const { supabase, userId } = await requireUserId();
  if (!userId) return;
  await supabase.from("posts").delete().eq("id", postId).eq("author_id", userId);
  refresh();
}
