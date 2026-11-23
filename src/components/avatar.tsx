import { cssUrl, initials, mediaUrl } from "@/lib/format";
import type { Profile } from "@/lib/types";

export function Avatar({ profile, size = 42 }: { profile: Profile; size?: number }) {
  const src = mediaUrl(profile.avatar_path, "avatars");
  const style = { width: size, height: size };

  if (src) {
    return (
      <span
        role="img"
        aria-label={`${profile.display_name}'s avatar`}
        className="inline-block shrink-0 border border-rule bg-paper-deep bg-cover bg-center"
        style={{ ...style, backgroundImage: cssUrl(src) }}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={`${profile.display_name}'s initials`}
      className="inline-flex shrink-0 items-center justify-center border border-rule bg-paper-deep font-display text-[0.85rem] text-ink-soft"
      style={style}
    >
      {initials(profile.display_name)}
    </span>
  );
}
