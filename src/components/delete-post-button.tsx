"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePost } from "@/app/actions/posts";

export function DeletePostButton({ postId }: { postId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onDelete() {
    if (!window.confirm("Delete this entry permanently? This cannot be undone.")) return;
    setError(null);

    startTransition(async () => {
      const result = await deletePost(postId);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="mt-2 flex flex-col items-end">
      <button type="button" onClick={onDelete} disabled={pending} className="type-stamp text-ink-soft/60 hover:text-terracotta disabled:opacity-60">
        {pending ? "Deleting…" : "Delete entry"}
      </button>
      {error ? <p role="alert" className="mt-1 text-xs text-terracotta">{error}</p> : null}
    </div>
  );
}
