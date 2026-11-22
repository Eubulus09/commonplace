"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { safeExternalUrl } from "@/lib/format";
import type { ProfileLink } from "@/lib/types";

export type ProfileState = { error?: string; success?: boolean };

function parseLinks(raw: string): ProfileLink[] {
  return raw
    .split("\n")
    .map((line) => line.split("|").map((part) => part.trim()))
    .filter(([label, url]) => label && url && safeExternalUrl(url))
    .slice(0, 4)
    .map(([label, url]) => ({ label, url }));
}

function refresh() {
  revalidatePath("/", "layout");
}

export async function toggleFollow(profileId: string) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  if (!userId || userId === profileId) return;

  const { data: existing } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId)
    .eq("following_id", profileId)
    .maybeSingle();

  if (existing) {
    await supabase.from("follows").delete().eq("follower_id", userId).eq("following_id", profileId);
  } else {
    await supabase.from("follows").insert({ follower_id: userId, following_id: profileId });
  }
  refresh();
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
  if (!displayName) return { error: "A display name is required." };
  if (bio.length > 500) return { error: "Keep your bio under 500 characters." };

  const avatar = formData.get("avatar");
  let avatarPath: string | undefined;

  if (avatar instanceof File && avatar.size > 0) {
    if (avatar.size > 4 * 1024 * 1024) return { error: "Avatar must be under 4 MB." };
    if (!avatar.type.startsWith("image/")) return { error: "Avatar must be an image." };

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

  if (error) return { error: error.message };
  refresh();
  return { success: true };
}
