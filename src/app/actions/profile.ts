"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isUuid, safeExternalUrl } from "@/lib/format";
import type { ActionResult, ProfileLink } from "@/lib/types";

export type ProfileState = ActionResult;

const allowedImageTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];

function parseLinks(raw: string): ProfileLink[] {
  return raw
    .split("\n")
    .map((line) => line.split("|").map((part) => part.trim()))
    .filter(([label, url]) => label && label.length <= 40 && url && url.length <= 500 && safeExternalUrl(url))
    .slice(0, 4)
    .map(([label, url]) => ({ label, url }));
}

function refresh() {
  revalidatePath("/", "layout");
}

export async function toggleFollow(profileId: string): Promise<ActionResult> {
  if (!isUuid(profileId)) return { error: "Invalid profile." };

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  if (!userId || userId === profileId) return { error: "Please sign in to follow people." };

  const { data: existing, error: selectError } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId)
    .eq("following_id", profileId)
    .maybeSingle();

  if (selectError) return { error: selectError.message };

  const { error } = existing
    ? await supabase.from("follows").delete().eq("follower_id", userId).eq("following_id", profileId)
    : await supabase.from("follows").insert({ follower_id: userId, following_id: profileId });

  if (error) return { error: error.message };
  refresh();
  return { success: true };
}

export async function updateProfile(_state: ProfileState, formData: FormData): Promise<ProfileState> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  if (!userId) return { error: "Please sign in to edit your profile." };

  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const displayName = String(formData.get("display_name") ?? "").trim();
  const headline = String(formData.get("headline") ?? "").trim();
  const practice = String(formData.get("practice") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const links = parseLinks(String(formData.get("links") ?? ""));

  if (!/^[a-z0-9_]{3,30}$/.test(username)) {
    return { error: "Username must be 3–30 characters: lowercase letters, numbers, or underscores." };
  }
  if (!displayName || displayName.length > 80) return { error: "Display name is required and must be under 80 characters." };
  if (headline.length > 160) return { error: "Keep your headline under 160 characters." };
  if (practice.length > 80) return { error: "Keep your practice under 80 characters." };
  if (bio.length > 500) return { error: "Keep your bio under 500 characters." };
  if (location.length > 80) return { error: "Keep your location under 80 characters." };

  const { data: existingProfile, error: profileError } = await supabase
    .from("profiles")
    .select("avatar_path")
    .eq("id", userId)
    .maybeSingle();
  if (profileError) return { error: profileError.message };

  const { data: taken } = await supabase.from("profiles").select("id").eq("username", username).maybeSingle();
  if (taken && taken.id !== userId) return { error: "That username is already taken. Try another one." };

  const avatar = formData.get("avatar");
  let avatarPath: string | undefined;

  if (avatar instanceof File && avatar.size > 0) {
    if (avatar.size > 4 * 1024 * 1024) return { error: "Avatar must be under 4 MB." };
    if (!allowedImageTypes.includes(avatar.type)) return { error: "Avatar must be a PNG, JPEG, WebP, or GIF image." };

    const cleanName = avatar.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    avatarPath = `${userId}/${Date.now()}-${cleanName}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(avatarPath, await avatar.arrayBuffer(), { contentType: avatar.type, upsert: true });

    if (uploadError) return { error: uploadError.message };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      username,
      display_name: displayName,
      headline,
      practice,
      bio,
      location,
      links,
      ...(avatarPath ? { avatar_path: avatarPath } : {}),
    })
    .eq("id", userId);

  if (error) {
    if (avatarPath) await supabase.storage.from("avatars").remove([avatarPath]);
    return { error: error.message.includes("unique constraint") ? "That username is already taken. Try another one." : error.message };
  }

  const previousAvatar = existingProfile?.avatar_path;
  if (avatarPath && previousAvatar && previousAvatar !== avatarPath) {
    await supabase.storage.from("avatars").remove([previousAvatar]);
  }

  refresh();
  return { success: true };
}
