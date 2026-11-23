"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isUuid, parseTags } from "@/lib/format";
import type { ActionResult, MediaItem, PostKind } from "@/lib/types";

export type PostState = ActionResult;
export type CommentState = ActionResult;

const kinds: PostKind[] = ["art", "work", "research", "note", "milestone"];

function refresh() {
  revalidatePath("/", "layout");
}

async function requireUserId() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return { supabase, userId: data.user?.id };
}

function parseMedia(raw: FormDataEntryValue | null, userId: string): MediaItem[] {
  if (typeof raw !== "string" || !raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is MediaItem => {
        if (!item || typeof item !== "object") return false;
        const candidate = item as Record<string, unknown>;
        const path = candidate.path;
        const alt = candidate.alt;
        if (typeof path !== "string" || typeof alt !== "string") return false;
        if (alt.length > 300) return false;
        if (!path.startsWith(`${userId}/`) || path.includes("..")) return false;
        return /^[\w./-]+$/.test(path);
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
  const media = parseMedia(formData.get("media"), userId);

  if (!body) return { error: "Write a little something before publishing." };
  if (body.length > 5000) return { error: "Keep posts under 5,000 characters." };
  if (title && title.length > 160) return { error: "Keep the title under 160 characters." };

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

export async function toggleLike(postId: string): Promise<ActionResult> {
  if (!isUuid(postId)) return { error: "Invalid entry." };

  const { supabase, userId } = await requireUserId();
  if (!userId) return { error: "Please sign in to like entries." };

  const { data, error: selectError } = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("user_id", userId)
    .eq("post_id", postId)
    .maybeSingle();

  if (selectError) return { error: selectError.message };

  const { error } = data
    ? await supabase.from("post_likes").delete().eq("user_id", userId).eq("post_id", postId)
    : await supabase.from("post_likes").insert({ user_id: userId, post_id: postId });

  if (error) return { error: error.message };
  refresh();
  return { success: true };
}

export async function toggleBookmark(postId: string): Promise<ActionResult> {
  if (!isUuid(postId)) return { error: "Invalid entry." };

  const { supabase, userId } = await requireUserId();
  if (!userId) return { error: "Please sign in to save entries." };

  const { data, error: selectError } = await supabase
    .from("post_bookmarks")
    .select("post_id")
    .eq("user_id", userId)
    .eq("post_id", postId)
    .maybeSingle();

  if (selectError) return { error: selectError.message };

  const { error } = data
    ? await supabase.from("post_bookmarks").delete().eq("user_id", userId).eq("post_id", postId)
    : await supabase.from("post_bookmarks").insert({ user_id: userId, post_id: postId });

  if (error) return { error: error.message };
  refresh();
  return { success: true };
}

export async function addComment(_state: CommentState, formData: FormData): Promise<CommentState> {
  const { supabase, userId } = await requireUserId();
  if (!userId) return { error: "Please sign in to comment." };

  const postId = String(formData.get("post_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const rawParentId = String(formData.get("parent_id") ?? "").trim();
  const parentId = rawParentId || null;

  if (!isUuid(postId)) return { error: "This comment has no valid post." };
  if (parentId && !isUuid(parentId)) return { error: "Invalid reply." };
  if (!body) return { error: "Write a comment first." };
  if (body.length > 1000) return { error: "Keep comments under 1,000 characters." };

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

export async function deletePost(postId: string): Promise<ActionResult> {
  if (!isUuid(postId)) return { error: "Invalid entry." };

  const { supabase, userId } = await requireUserId();
  if (!userId) return { error: "Please sign in to delete entries." };

  const { error } = await supabase.from("posts").delete().eq("id", postId).eq("author_id", userId);
  if (error) return { error: error.message };
  refresh();
  return { success: true };
}
