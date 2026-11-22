import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { EmptyState } from "@/components/empty-state";
import { FollowButton } from "@/components/follow-button";
import { ArrowIcon, PenIcon } from "@/components/icons";
import { PostList } from "@/components/post-list";
import {
  getCurrentUser,
  getFollowCounts,
  getPostsByAuthor,
  getProfileByUsername,
  isFollowing,
} from "@/lib/data";
import { formatDate, mediaUrl, safeExternalUrl } from "@/lib/format";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  const viewer = await getCurrentUser();
  const [posts, counts, following] = await Promise.all([
    getPostsByAuthor(profile.id, viewer?.id),
    getFollowCounts(profile.id),
    isFollowing(viewer?.id, profile.id),
  ]);

  const isSelf = viewer?.id === profile.id;
  const cover = mediaUrl(profile.cover_path, "post-media");
  const links = profile.links.filter((link) => safeExternalUrl(link.url));

  return (
    <div>
      <div className={`h-32 border border-rule bg-paper-deep bg-cover bg-center ${cover ? "" : "paper-lines"}`} style={cover ? { backgroundImage: `url("${cover}")` } : undefined} />

      <section className="border border-t-0 border-rule bg-paper-light px-5 py-6 sm:px-7">
        <div className="flex flex-wrap items-start gap-4">
          <Avatar profile={profile} size={76} />
          <div className="min-w-0 flex-1">
            <p className="type-stamp">@{profile.username}</p>
            <h1 className="mt-2 font-display text-[2rem] leading-none tracking-[-0.03em]">{profile.display_name}</h1>
            {profile.headline ? <p className="mt-2 text-sm text-ink-soft">{profile.headline}</p> : null}
          </div>
          <div className="flex items-center gap-2">
            {isSelf ? (
              <Link href="/settings" className="quiet-button">
                <PenIcon className="h-4 w-4" />
                Edit profile
              </Link>
            ) : (
              <FollowButton targetId={profile.id} initialFollowing={following} isSelf={false} signedIn={Boolean(viewer)} />
            )}
          </div>
        </div>

        {profile.bio ? <p className="mt-6 max-w-2xl text-[0.95rem] leading-relaxed text-ink-soft">{profile.bio}</p> : null}

        <div className="mt-6 flex flex-wrap gap-x-7 gap-y-3 border-t border-rule pt-5">
          <div>
            <p className="type-stamp">Practice</p>
            <p className="mt-1 text-sm">{profile.practice || "Independent"}</p>
          </div>
          <div>
            <p className="type-stamp">Location</p>
            <p className="mt-1 text-sm">{profile.location || "Elsewhere"}</p>
          </div>
          <div>
            <p className="type-stamp">Following</p>
            <p className="mt-1 text-sm">{counts.following}</p>
          </div>
          <div>
            <p className="type-stamp">Followers</p>
            <p className="mt-1 text-sm">{counts.followers}</p>
          </div>
          <div>
            <p className="type-stamp">Keeping since</p>
            <p className="mt-1 text-sm">{formatDate(profile.created_at)}</p>
          </div>
        </div>

        {links.length ? (
          <div className="mt-5 flex flex-wrap gap-4">
            {links.map((link) => (
              <a key={link.url} href={link.url} target="_blank" rel="noreferrer" className="editorial-link type-stamp no-underline hover:text-terracotta">
                {link.label} <ArrowIcon className="inline h-3 w-3" />
              </a>
            ))}
          </div>
        ) : null}
      </section>

      <div className="mt-8 flex items-end justify-between">
        <div>
          <p className="type-stamp">Entries</p>
          <h2 className="mt-2 font-display text-2xl">The ledger</h2>
        </div>
        <p className="type-stamp">{posts.length} records</p>
      </div>

      <div className="mt-5">
        {posts.length ? (
          <PostList posts={posts} viewerId={viewer?.id} />
        ) : (
          <EmptyState
            title="No entries yet."
            body={isSelf ? "Your ledger starts with one small record. Keep a note, a finding, or a finished thing." : "This person has not published an entry yet."}
            actionHref={isSelf ? "/feed?compose=1" : "/feed"}
            actionLabel={isSelf ? "Write an entry" : "Back to the feed"}
          />
        )}
      </div>
    </div>
  );
}
