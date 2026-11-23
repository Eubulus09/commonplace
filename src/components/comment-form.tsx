"use client";

import Link from "next/link";
import { useEffect, useRef, useActionState } from "react";
import { addComment, type CommentState } from "@/app/actions/posts";

export function CommentForm({ postId, signedIn }: { postId: string; signedIn: boolean }) {
  const [state, formAction, pending] = useActionState<CommentState, FormData>(addComment, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  if (!signedIn) {
    return (
      <p className="type-stamp border-t border-rule pt-4">
        <Link href={`/login?next=${encodeURIComponent(`/p/${postId}#comments`)}`} className="editorial-link no-underline">Sign in</Link> to leave a note.
      </p>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="mt-4 border-t border-rule pt-4">
      <input type="hidden" name="post_id" value={postId} />
      <label className="type-stamp block">
        Add a note
        <textarea name="body" className="field mt-2 min-h-[80px] resize-y" maxLength={1000} required placeholder="Respond carefully." />
      </label>
      {state.error ? <p role="alert" className="mt-2 text-sm text-terracotta">{state.error}</p> : null}
      <div className="mt-3 flex justify-end">
        <button type="submit" disabled={pending} className="ink-button">
          {pending ? "Posting…" : "Post note"}
        </button>
      </div>
    </form>
  );
}
