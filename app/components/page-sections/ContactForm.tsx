"use client";

import { useActionState, useEffect, useId, useRef, type ReactNode } from "react";
import { submitContactForm, type ContactField, type ContactFormState } from "@/app/actions/contact";

type Props = {
  /** Page the form sits on and its position there; the server looks up the email settings from these. */
  pagePath: string;
  sectionIndex: number;
};

const initialState: ContactFormState = { status: "idle" };

const inputClass =
  "w-full border-0 border-b border-neutral-300 bg-transparent px-0 py-2 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-[var(--header-brand)] focus:outline-none focus:ring-0 aria-[invalid=true]:border-red-500";

function Field({
  id,
  name,
  label,
  error,
  children,
  className = "",
}: {
  id: string;
  name: ContactField;
  label: string;
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
      {error && (
        <p id={`${id}-${name}-error`} className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

/** Enquiry form: name, email, phone, subject and message, submitted by the submitContactForm action. */
export default function ContactForm({ pagePath, sectionIndex }: Props) {
  const [state, formAction, pending] = useActionState(submitContactForm, initialState);
  const startedAtRef = useRef<HTMLInputElement>(null);
  const id = useId();

  // Stamp the time the form became usable, so the server can tell instant (bot) submissions from human ones.
  useEffect(() => {
    if (startedAtRef.current) startedAtRef.current.value = String(Date.now());
  }, []);

  if (state.status === "success") {
    return (
      <div role="status" className="flex h-full flex-col items-start justify-center gap-3 py-10">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--header-brand)]/10 text-2xl text-[var(--header-brand)]">
          ✓
        </span>
        <h3 className="text-2xl font-bold tracking-tight text-neutral-900">Thanks for getting in touch!</h3>
        <p className="text-neutral-600">We&apos;ve received your message and will get back to you as soon as we can.</p>
      </div>
    );
  }

  const errors = state.fieldErrors ?? {};
  const value = (name: ContactField) => state.values?.[name] ?? "";
  const describedBy = (name: ContactField) => (errors[name] ? `${id}-${name}-error` : undefined);

  return (
    <form action={formAction} noValidate className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
      <input type="hidden" name="pagePath" value={pagePath} />
      <input type="hidden" name="sectionIndex" value={sectionIndex} />
      <input ref={startedAtRef} type="hidden" name="startedAt" defaultValue="" />
      {/* Honeypot: hidden from people, but bots fill it in */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <Field id={id} name="name" label="Your name" error={errors.name}>
        <input
          id={`${id}-name`}
          name="name"
          type="text"
          required
          maxLength={100}
          autoComplete="name"
          placeholder="Jane Smith"
          defaultValue={value("name")}
          aria-invalid={!!errors.name}
          aria-describedby={describedBy("name")}
          className={inputClass}
        />
      </Field>
      <Field id={id} name="email" label="Your email" error={errors.email}>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          placeholder="jane@example.com"
          defaultValue={value("email")}
          aria-invalid={!!errors.email}
          aria-describedby={describedBy("email")}
          className={inputClass}
        />
      </Field>
      <Field id={id} name="phone" label="Phone (optional)" error={errors.phone}>
        <input
          id={`${id}-phone`}
          name="phone"
          type="tel"
          maxLength={30}
          autoComplete="tel"
          placeholder="04xx xxx xxx"
          defaultValue={value("phone")}
          aria-invalid={!!errors.phone}
          aria-describedby={describedBy("phone")}
          className={inputClass}
        />
      </Field>
      <Field id={id} name="subject" label="Subject" error={errors.subject}>
        <input
          id={`${id}-subject`}
          name="subject"
          type="text"
          required
          maxLength={150}
          placeholder="How can we help?"
          defaultValue={value("subject")}
          aria-invalid={!!errors.subject}
          aria-describedby={describedBy("subject")}
          className={inputClass}
        />
      </Field>
      <Field id={id} name="message" label="Message" error={errors.message} className="sm:col-span-2">
        <textarea
          id={`${id}-message`}
          name="message"
          required
          rows={4}
          maxLength={5000}
          placeholder="Write your message here"
          defaultValue={value("message")}
          aria-invalid={!!errors.message}
          aria-describedby={describedBy("message")}
          className={`${inputClass} resize-y`}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 items-center rounded-md bg-[var(--header-brand)] px-7 text-sm font-bold uppercase tracking-wider text-white transition hover:brightness-110 disabled:opacity-70"
        >
          {pending ? "Sending…" : "Send message"}
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
