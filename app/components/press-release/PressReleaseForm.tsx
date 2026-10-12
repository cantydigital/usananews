"use client";

import { startTransition, useActionState, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { submitPressRelease, type PressReleaseField, type PressReleaseFormState } from "@/app/actions/press-release";
import type { SubmissionCategory } from "@/app/lib/wordpress";

type Props = {
  categories: SubmissionCategory[];
};

const initialState: PressReleaseFormState = { status: "idle" };

const MAX_IMAGE_BYTES = 300 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

const inputClass =
  "w-full border-0 border-b border-neutral-300 bg-transparent px-0 py-2 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-[var(--header-brand)] focus:outline-none focus:ring-0 aria-[invalid=true]:border-red-500";

function Field({
  id,
  name,
  label,
  hint,
  error,
  children,
  className = "",
}: {
  id: string;
  name: PressReleaseField;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`group ${className}`}>
      <label
        htmlFor={`${id}-${name}`}
        className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 group-focus-within:text-[var(--header-brand)]"
      >
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-${name}-hint`} className="mt-1.5 text-sm text-neutral-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-${name}-error`} className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function SectionTitle({ step, title }: { step: number; title: string }) {
  return (
    <h3 className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-neutral-900 sm:col-span-2">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--header-brand)] text-xs text-white">
        {step}
      </span>
      {title}
    </h3>
  );
}

/** Press release form: release details, contact details and an optional image, submitted by the submitPressRelease action. */
export default function PressReleaseForm({ categories }: Props) {
  const [state, formAction, pending] = useActionState(submitPressRelease, initialState);
  const [image, setImage] = useState<{ name: string; preview: string } | null>(null);
  const [imageError, setImageError] = useState<string | undefined>();
  const startedAtRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const id = useId();

  // Stamp the time the form became usable, so the server can tell instant (bot) submissions from human ones.
  useEffect(() => {
    if (startedAtRef.current) startedAtRef.current.value = String(Date.now());
  }, []);

  useEffect(() => () => {
    if (image) URL.revokeObjectURL(image.preview);
  }, [image]);

  if (state.status === "success") {
    return (
      <div role="status" className="flex flex-col items-start gap-3 py-10">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--header-brand)]/10 text-2xl text-[var(--header-brand)]">
          ✓
        </span>
        <h3 className="text-2xl font-bold tracking-tight text-neutral-900">Thanks, your press release is in!</h3>
        <p className="max-w-xl text-neutral-600">
          Our editorial team will review it shortly. Approved releases are usually published within 24–48 hours, and
          we&apos;ll be in touch at the contact email you provided if we have any questions.
        </p>
      </div>
    );
  }

  // A newly chosen image replaces the server's verdict on the previous one ("" = no error).
  const errors = imageError === undefined ? { ...state.fieldErrors } : { ...state.fieldErrors, image: imageError || undefined };
  const describedBy = (name: PressReleaseField, hasHint = false) =>
    errors[name] ? `${id}-${name}-error` : hasHint ? `${id}-${name}-hint` : undefined;

  function chooseImage(file: File | undefined) {
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE_BYTES) {
      setImageError(
        file.size > MAX_IMAGE_BYTES ? "The image must be 300KB or smaller." : "The image must be a JPG, PNG, GIF or WebP file.",
      );
      clearImage();
      return;
    }
    setImageError("");
    setImage({ name: file.name, preview: URL.createObjectURL(file) });
  }

  function clearImage() {
    if (imageRef.current) imageRef.current.value = "";
    setImage(null);
  }

  return (
    <form
      action={formAction}
      // Submit without React's automatic form reset, so an error never clears what was typed or the chosen image.
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setImageError(undefined);
        startTransition(() => formAction(formData));
      }}
      noValidate
      className="grid gap-x-8 gap-y-7 sm:grid-cols-2"
    >
      <input ref={startedAtRef} type="hidden" name="startedAt" defaultValue="" />
      {/* Honeypot: hidden from people, but bots fill it in */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <SectionTitle step={1} title="Press release details" />

      <Field id={id} name="title" label="Title *" error={errors.title} className="sm:col-span-2">
        <input
          id={`${id}-title`}
          name="title"
          type="text"
          required
          maxLength={200}
          placeholder="e.g. Brisbane startup launches Australia's first…"
          aria-invalid={!!errors.title}
          aria-describedby={describedBy("title")}
          className={inputClass}
        />
      </Field>
      <Field id={id} name="subtitle" label="Subtitle" error={errors.subtitle} className="sm:col-span-2">
        <input
          id={`${id}-subtitle`}
          name="subtitle"
          type="text"
          maxLength={300}
          placeholder="A one-sentence summary of the announcement"
          aria-invalid={!!errors.subtitle}
          aria-describedby={describedBy("subtitle")}
          className={inputClass}
        />
      </Field>
      <Field id={id} name="category" label="Category *" error={errors.category}>
        <select
          id={`${id}-category`}
          name="category"
          required
          defaultValue=""
          aria-invalid={!!errors.category}
          aria-describedby={describedBy("category")}
          className={`${inputClass} cursor-pointer`}
        >
          <option value="" disabled>
            Select a category
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </Field>
      <div className="hidden sm:block" />
      <Field
        id={id}
        name="content"
        label="Content *"
        hint="Paste the full release as plain text. Separate paragraphs with a blank line."
        error={errors.content}
        className="sm:col-span-2"
      >
        <textarea
          id={`${id}-content`}
          name="content"
          required
          rows={14}
          maxLength={30000}
          placeholder="SYDNEY, 12 October 2026 – …"
          aria-invalid={!!errors.content}
          aria-describedby={describedBy("content", true)}
          className={`${inputClass} resize-y`}
        />
      </Field>

      <SectionTitle step={2} title="Contact details" />

      <Field id={id} name="author" label="Author *" error={errors.author}>
        <input
          id={`${id}-author`}
          name="author"
          type="text"
          required
          maxLength={100}
          autoComplete="name"
          placeholder="Jane Smith"
          aria-invalid={!!errors.author}
          aria-describedby={describedBy("author")}
          className={inputClass}
        />
      </Field>
      <Field id={id} name="company" label="Company *" error={errors.company}>
        <input
          id={`${id}-company`}
          name="company"
          type="text"
          required
          maxLength={150}
          autoComplete="organization"
          placeholder="Acme Pty Ltd"
          aria-invalid={!!errors.company}
          aria-describedby={describedBy("company")}
          className={inputClass}
        />
      </Field>
      <Field id={id} name="email" label="Contact email *" error={errors.email}>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          placeholder="jane@example.com"
          aria-invalid={!!errors.email}
          aria-describedby={describedBy("email")}
          className={inputClass}
        />
      </Field>
      <Field id={id} name="phone" label="Contact phone" error={errors.phone}>
        <input
          id={`${id}-phone`}
          name="phone"
          type="tel"
          maxLength={30}
          autoComplete="tel"
          placeholder="04xx xxx xxx"
          aria-invalid={!!errors.phone}
          aria-describedby={describedBy("phone")}
          className={inputClass}
        />
      </Field>
      <Field
        id={id}
        name="purchaseEmail"
        label="Purchase email"
        hint="Enter the email you used when purchasing your credit."
        error={errors.purchaseEmail}
      >
        <input
          id={`${id}-purchaseEmail`}
          name="purchaseEmail"
          type="email"
          maxLength={254}
          autoComplete="email"
          placeholder="billing@example.com"
          aria-invalid={!!errors.purchaseEmail}
          aria-describedby={describedBy("purchaseEmail", true)}
          className={inputClass}
        />
      </Field>

      <SectionTitle step={3} title="Image" />

      <Field
        id={id}
        name="image"
        label="Press release image"
        hint="Supported formats: JPG, PNG, GIF, WebP. Max size: 300KB."
        error={errors.image}
        className="sm:col-span-2"
      >
        <div className="mt-3 flex flex-wrap items-center gap-4 rounded-xl border border-dashed border-neutral-300 p-4">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob preview, not optimisable
            <img src={image.preview} alt="" className="h-20 w-28 rounded-md object-cover" />
          ) : (
            <span className="flex h-20 w-28 items-center justify-center rounded-md bg-neutral-100 text-xs text-neutral-400">
              No image
            </span>
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <p className="truncate text-sm text-neutral-700">{image?.name ?? "No image selected"}</p>
            <div className="flex gap-2">
              <label
                htmlFor={`${id}-image`}
                className="inline-flex h-9 cursor-pointer items-center rounded-md border border-neutral-300 px-4 text-sm font-semibold text-neutral-800 transition hover:border-[var(--header-brand)] hover:text-[var(--header-brand)]"
              >
                {image ? "Change image" : "Upload image"}
              </label>
              {image && (
                <button
                  type="button"
                  onClick={clearImage}
                  className="h-9 px-3 text-sm font-semibold text-neutral-500 hover:text-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          <input
            ref={imageRef}
            id={`${id}-image`}
            name="image"
            type="file"
            accept={IMAGE_TYPES.join(",")}
            onChange={(event) => chooseImage(event.target.files?.[0])}
            aria-invalid={!!errors.image}
            aria-describedby={describedBy("image", true)}
            className="sr-only"
          />
        </div>
      </Field>

      <div className="flex flex-wrap items-center gap-4 border-t border-neutral-200 pt-6 sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 items-center rounded-md bg-[var(--header-brand)] px-7 text-sm font-bold uppercase tracking-wider text-white transition hover:brightness-110 disabled:opacity-70"
        >
          {pending ? "Submitting…" : "Submit for review"}
        </button>
        {state.status === "error" && state.message && (
          <p role="alert" className="text-sm font-semibold text-red-600">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
