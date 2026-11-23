import type { PostKind } from "@/lib/types";

export const kindLabels: Record<PostKind, string> = {
  art: "Art",
  work: "Work",
  research: "Research",
  note: "Field note",
  milestone: "Milestone",
};

export function formatRelative(iso: string) {
  const date = new Date(iso);
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";

  const units: [number, string][] = [
    [31536000, "y"],
    [2592000, "mo"],
    [604800, "w"],
    [86400, "d"],
    [3600, "h"],
    [60, "m"],
  ];

  for (const [size, label] of units) {
    if (seconds >= size) return `${Math.floor(seconds / size)}${label} ago`;
  }
  return "just now";
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function safeExternalUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function safeNextPath(value: unknown, fallback = "/feed") {
  if (typeof value !== "string" || !value) return fallback;
  if (/[\\\u0000-\u001f\u007f]|%5c|%2f/i.test(value)) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;

  try {
    const parsed = new URL(value, "https://commonplace.local");
    if (parsed.origin !== "https://commonplace.local" || !parsed.pathname.startsWith("/")) return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function cssUrl(url: string) {
  return `url(${JSON.stringify(url)})`;
}

export function mediaUrl(path: string | null | undefined, bucket: "post-media" | "avatars" = "post-media") {
  if (!path || !/^[\w./-]+$/.test(path) || path.includes("..")) return null;

  if (path.startsWith("/")) {
    return /^\/seed-art\/[\w.-]+$/.test(path) ? path : null;
  }

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

export function parseTags(value: string) {
  return [...new Set(value.split(/[,\n]/).map((tag) => tag.trim().replace(/^#/, "").toLowerCase()).filter(Boolean))].slice(0, 6);
}
