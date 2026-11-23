"use client";

import { useRef, useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { createPost, type PostState } from "@/app/actions/posts";
import { createClient } from "@/lib/supabase/client";
import { kindLabels } from "@/lib/format";
import type { PostKind } from "@/lib/types";
import { PenIcon, PlusIcon } from "@/components/icons";

type UploadItem = { path: string; alt: string; name: string };

const kinds: PostKind[] = ["art", "work", "research", "note", "milestone"];
const allowedImageTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export function Composer({ userId, open = false }: { userId: string; open?: boolean }) {
  const [isOpen, setIsOpen] = useState(open);
  const [kind, setKind] = useState<PostKind>("note");
  const [items, setItems] = useState<UploadItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function removePaths(paths: string[]) {
    if (!paths.length) return;
    try {
      const supabase = createClient();
      await supabase.storage.from("post-media").remove(paths);
    } catch {
      return;
    }
  }

  async function submitPost(previousState: PostState, formData: FormData): Promise<PostState> {
    const result = await createPost(previousState, formData);
    if (!result.success) {
      await removePaths(items.map((item) => item.path));
      setItems([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return result;
    }

    formRef.current?.reset();
    setItems([]);
    setKind("note");
    setIsOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    router.refresh();
    return result;
  }

  const [state, formAction, pending] = useActionState<PostState, FormData>(submitPost, {});

  async function onFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, Math.max(0, 4 - items.length));
    if (!files.length) return;

    setUploading(true);
    setUploadError(null);
    const uploaded: UploadItem[] = [];

    try {
      const supabase = createClient();

      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        if (file.size > 8 * 1024 * 1024) throw new Error("Each image must be under 8 MB.");
        if (!allowedImageTypes.includes(file.type)) throw new Error("Only PNG, JPEG, WebP, or GIF images can be attached.");

        const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const path = `${userId}/${Date.now()}-${items.length + index}-${cleanName}`;
        const { error } = await supabase.storage
          .from("post-media")
          .upload(path, await file.arrayBuffer(), { contentType: file.type, upsert: true });

        if (error) throw error;
        uploaded.push({ path, alt: "", name: file.name });
      }

      setItems((current) => [...current, ...uploaded].slice(0, 4));
    } catch (error) {
      await removePaths(uploaded.map((item) => item.path));
      setUploadError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function removeItem(path: string) {
    setItems((current) => current.filter((item) => item.path !== path));
    await removePaths([path]);
  }

  async function close() {
    setIsOpen(false);
    setUploadError(null);
    await removePaths(items.map((item) => item.path));
    setItems([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const missingAlt = items.some((item) => !item.alt.trim());
  const disabled = pending || uploading || missingAlt;

  if (!isOpen) {
    return (
      <button type="button" onClick={() => setIsOpen(true)} className="paper-panel flex w-full items-center gap-3 px-5 py-4 text-left no-underline">
        <span className="flex h-10 w-10 items-center justify-center border border-rule bg-paper-deep">
          <PenIcon className="h-4 w-4" />
        </span>
        <span className="font-display text-[1.05rem] text-ink-soft">What are you keeping today?</span>
        <PlusIcon className="ml-auto h-4 w-4 text-terracotta" />
      </button>
    );
  }

  return (
    <section className="paper-panel px-5 py-5 sm:px-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="type-stamp">New entry</p>
          <h2 className="mt-2 font-display text-2xl tracking-[-0.02em]">Record something worth returning to.</h2>
        </div>
        <button type="button" onClick={close} className="type-stamp hover:text-terracotta">
          Close
        </button>
      </div>

      <form ref={formRef} action={formAction} className="mt-6">
        <div className="flex flex-wrap gap-2">
          {kinds.map((option) => (
            <label
              key={option}
              className={`cursor-pointer border px-3 py-2 type-stamp ${kind === option ? "border-ink bg-ink text-paper-light" : "border-rule text-ink-soft"}`}
            >
              <input
                type="radio"
                name="kind"
                value={option}
                checked={kind === option}
                onChange={() => setKind(option)}
                className="sr-only"
              />
              {kindLabels[option]}
            </label>
          ))}
        </div>

        <input name="title" placeholder="Title (optional)" className="field mt-5 font-display text-xl" maxLength={160} />
        <textarea name="body" placeholder="Write the note, the finding, the process, the half-formed thought…" className="field mt-3 min-h-[130px] resize-y" maxLength={5000} required />
        <input name="tags" placeholder="Tags, separated by commas" className="field mt-3" />

        <div className="mt-5">
          <label className="type-stamp cursor-pointer">
            Attach up to four images
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple onChange={onFiles} className="mt-2 block w-full text-[0.8rem] text-ink-soft" />
          </label>

          {uploading ? <p role="status" className="mt-2 type-stamp text-terracotta">Uploading…</p> : null}
          {uploadError ? <p role="alert" className="mt-2 text-sm text-terracotta">{uploadError}</p> : null}

          {items.length ? (
            <div className="mt-4 flex flex-col gap-3">
              {items.map((item, index) => (
                <div key={item.path} className="border border-rule p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="type-stamp block truncate">{item.name}</span>
                    <button type="button" onClick={() => removeItem(item.path)} aria-label={`Remove ${item.name}`} className="type-stamp hover:text-terracotta">
                      Remove
                    </button>
                  </div>
                  <input
                    value={item.alt}
                    onChange={(event) => {
                      setItems((current) => current.map((entry, entryIndex) => (entryIndex === index ? { ...entry, alt: event.target.value } : entry)));
                    }}
                    placeholder="Describe this image"
                    aria-label={`Description for ${item.name}`}
                    className="field mt-2 text-sm"
                    required
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <input type="hidden" name="media" value={JSON.stringify(items.map(({ path, alt }) => ({ path, alt })))} />

        {state.error ? <p role="alert" className="mt-4 text-sm text-terracotta">{state.error}</p> : null}
        {missingAlt ? <p role="status" className="mt-4 type-stamp text-terracotta">Every image needs a description.</p> : null}

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-rule pt-4">
          <button type="button" onClick={close} className="quiet-button">
            Cancel
          </button>
          <button type="submit" disabled={disabled} className="ink-button disabled:opacity-60">
            {pending ? "Publishing…" : "Publish entry"}
          </button>
        </div>
      </form>
    </section>
  );
}
