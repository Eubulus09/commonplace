"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileState } from "@/app/actions/profile";
import type { Profile } from "@/lib/types";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(updateProfile, {});
  const links = profile.links.map((link) => `${link.label} | ${link.url}`).join("\n");

  return (
    <form action={formAction} className="mt-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="type-stamp block">
          Display name
          <input name="display_name" className="field mt-2" defaultValue={profile.display_name} maxLength={80} required />
        </label>
        <label className="type-stamp block">
          Username
          <input name="username" className="field mt-2" defaultValue={profile.username} pattern="[a-z0-9_]{3,30}" required />
        </label>
      </div>

      <label className="type-stamp mt-6 block">
        Headline
          <input name="headline" className="field mt-2" defaultValue={profile.headline} maxLength={160} placeholder="What you are known for" />

      </label>
      <label className="type-stamp mt-6 block">
        Practice
          <input name="practice" className="field mt-2" defaultValue={profile.practice} maxLength={80} placeholder="Art, research, design, writing…" />

      </label>
      <label className="type-stamp mt-6 block">
        Bio
        <textarea name="bio" className="field mt-2 min-h-[110px] resize-y" maxLength={500} defaultValue={profile.bio} />
      </label>
      <label className="type-stamp mt-6 block">
        Location
          <input name="location" className="field mt-2" defaultValue={profile.location} maxLength={80} />

      </label>
      <label className="type-stamp mt-6 block">
        Links
        <textarea
          name="links"
          className="field mt-2 min-h-[80px] resize-y"
          defaultValue={links}
          placeholder={"Portfolio | https://example.com\nNewsletter | https://example.com"}
        />
        <span className="mt-2 block normal-case tracking-normal text-ink-soft/70">One link per line: Label | https://…</span>
      </label>
      <label className="type-stamp mt-6 block">
        Avatar
        <input name="avatar" type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="mt-2 block w-full text-[0.8rem] normal-case tracking-normal text-ink-soft" />
      </label>

      {state.error ? <p role="alert" className="mt-6 text-sm text-terracotta">{state.error}</p> : null}
      {state.success ? <p role="status" className="mt-6 text-sm text-moss">Profile saved.</p> : null}

      <div className="mt-8 flex justify-end border-t border-rule pt-5">
        <button type="submit" disabled={pending} className="ink-button">
          {pending ? "Saving…" : "Save profile"}
        </button>
      </div>
    </form>
  );
}
