"use client";

import { useActionState, useId } from "react";
import { subscribeToNewsletter, type NewsletterState } from "@/app/actions/newsletter";
import { MailIcon } from "@/app/components/header/icons";

type Props = {
  title?: string;
  description?: string;
};

const initialState: NewsletterState = { status: "idle" };

/** Brand-coloured newsletter sign-up box. Submission is handled by the subscribeToNewsletter action. */
export default function NewsletterSignup({
  title = "Join our daily newsletter",
  description = "Evidence-based supplement news and research, explained in plain English.",
}: Props) {
  const [state, formAction, pending] = useActionState(subscribeToNewsletter, initialState);
  const id = useId();
  const done = state.status === "subscribed" || state.status === "unavailable";

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--header-brand)] to-[#2b2248] p-6 text-white"
    >
      <div aria-hidden className="absolute -right-10 -top-10 -z-10 h-36 w-36 rounded-full bg-white/10" />
      <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
        <MailIcon className="h-5 w-5" />
      </span>
      <h2 id={`${id}-title`} className="text-xl font-bold tracking-tight">
        {title}
      </h2>
      <p className="mt-2 text-sm text-white/80">{description}</p>

      {done ? (
        <p role="status" className="mt-5 rounded-lg bg-white/15 px-4 py-3 text-sm font-semibold">
          {state.message}
        </p>
      ) : (
        <form action={formAction} className="mt-5 space-y-3" noValidate>
          <label htmlFor={`${id}-email`} className="sr-only">
            Email address
          </label>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="Your email address"
            aria-invalid={state.status === "error"}
            aria-describedby={state.status === "error" ? `${id}-error` : undefined}
            className="h-11 w-full rounded-md border border-white/20 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/60"
          />
          {state.status === "error" && (
            <p id={`${id}-error`} className="text-sm font-semibold text-amber-200">
              {state.message}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="h-11 w-full rounded-md bg-white text-sm font-bold uppercase tracking-wider text-[var(--header-brand)] transition hover:bg-white/90 disabled:opacity-70"
          >
            {pending ? "Subscribing…" : "Subscribe"}
          </button>
          <p className="text-xs text-white/70">Free. Unsubscribe any time.</p>
        </form>
      )}
    </section>
  );
}
