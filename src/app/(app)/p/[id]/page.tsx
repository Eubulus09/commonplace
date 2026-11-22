import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentForm } from "@/components/comment-form";
import { CommentList } from "@/components/comment-list";
import { ArrowIcon } from "@/components/icons";
import { PostCard } from "@/components/post-card";
import { getCurrentUser, getComments, getPost } from "@/lib/data";

export const metadata: Metadata = { title: "Entry" };

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const viewer = await getCurrentUser();
  const [post, comments] = await Promise.all([getPost(id, viewer?.id), getComments(id)]);

  if (!post) notFound();

  return (
    <div>
      <Link href="/feed" className="type-stamp no-underline hover:text-terracotta">
        <ArrowIcon className="mr-2 inline h-3 w-3 rotate-180" />
        Back to the feed
      </Link>

      <div className="mt-5">
        <PostCard post={post} viewerId={viewer?.id} />
      </div>

      <section id="comments" className="paper-panel mt-6 px-5 py-6 sm:px-6">
        <div className="flex items-end justify-between border-b border-rule pb-4">
          <div>
            <p className="type-stamp">Responses</p>
            <h2 className="mt-2 font-display text-2xl">Notes from others</h2>
          </div>
          <p className="type-stamp">{comments.length}</p>
        </div>

        <div className="mt-2">
          <CommentList comments={comments} />
        </div>

        <CommentForm postId={post.id} signedIn={Boolean(viewer)} />
      </section>
    </div>
  );
}
