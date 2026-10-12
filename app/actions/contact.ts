"use server";

import { Resend } from "resend";
import { getContent, saveContactSubmission, type ContactSubmission } from "@/app/lib/wordpress";

export type ContactField = keyof ContactSubmission;

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<ContactField, string>>;
  /** What the visitor typed, so the form can be refilled after an error. */
  values?: Partial<Record<ContactField, string>>;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[\d\s()+.-]{6,30}$/;
// Humans take a few seconds to fill in the form; most bots submit instantly.
const MIN_FILL_TIME_MS = 3_000;

function field(formData: FormData, name: string, max: number) {
  return String(formData.get(name) ?? "").trim().slice(0, max);
}

function validate(values: ContactSubmission) {
  const errors: Partial<Record<ContactField, string>> = {};
  if (!values.name) errors.name = "Please enter your name.";
  if (!EMAIL.test(values.email)) errors.email = "Please enter a valid email address.";
  if (values.phone && !PHONE.test(values.phone)) errors.phone = "Please enter a valid phone number.";
  if (!values.subject) errors.subject = "Please enter a subject.";
  if (values.message.length < 10) errors.message = "Please enter a message of at least 10 characters.";
  return errors;
}

/** The email settings of the contact form section, read from WordPress, never from the request. */
async function getEmailSettings(pagePath: string, sectionIndex: number) {
  if (!/^\/[a-z0-9/-]*$/i.test(pagePath) || !Number.isInteger(sectionIndex)) return null;
  const content = await getContent(`${pagePath.replace(/\/+$/, "")}/`);
  const section = content?.type === "page" ? content.page.sections[sectionIndex] : undefined;
  return section?.type === "contactForm" ? section.email : null;
}

const escape = (text: string) => text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
const oneLine = (text: string) => text.replace(/[\r\n]+/g, " ").trim();

async function sendEnquiryEmail(
  values: ContactSubmission,
  settings: { to: string[]; from: string | null; subject: string | null },
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  if (settings.to.length === 0 || !settings.from) {
    throw new Error("The contact form section needs \"Email To\" and \"Email From\" set in WordPress");
  }

  const rows: [string, string][] = [
    ["Name", values.name],
    ["Email", values.email],
    ["Phone", values.phone || "—"],
    ["Subject", values.subject],
  ];
  const { error } = await new Resend(apiKey).emails.send({
    from: settings.from,
    to: settings.to,
    replyTo: values.email,
    subject: oneLine(`${settings.subject || "New website enquiry"} – ${values.subject}`),
    text: `${rows.map(([label, value]) => `${label}: ${value}`).join("\n")}\n\n${values.message}`,
    html: `<table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px">${rows
      .map(([label, value]) => `<tr><td><strong>${label}</strong></td><td>${escape(value)}</td></tr>`)
      .join("")}</table><p style="font-family:Arial,sans-serif;font-size:14px;white-space:pre-wrap">${escape(values.message)}</p>`,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}

/**
 * Contact form submission: validates, then emails the enquiry via Resend and saves it to
 * WordPress in parallel. It succeeds if either works, so an enquiry isn't lost when one is down.
 */
export async function submitContactForm(
  _previous: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const values: ContactSubmission = {
    name: field(formData, "name", 100),
    email: field(formData, "email", 254),
    phone: field(formData, "phone", 30),
    subject: field(formData, "subject", 150),
    message: field(formData, "message", 5_000),
  };

  // Spam traps: a hidden field only bots fill in, and a minimum time to complete the form
  // (startedAt is set by the browser, so it's skipped if JavaScript didn't run). Bots get a
  // normal-looking success so they don't learn to adapt.
  const startedAt = Number(formData.get("startedAt"));
  if (formData.get("website") || (startedAt > 0 && Date.now() - startedAt < MIN_FILL_TIME_MS)) {
    return { status: "success" };
  }

  const fieldErrors = validate(values);
  if (Object.keys(fieldErrors).length) {
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors, values };
  }

  const settings = await getEmailSettings(
    String(formData.get("pagePath") ?? ""),
    Number(formData.get("sectionIndex")),
  ).catch(() => null);

  const [emailed, saved] = await Promise.allSettled([
    settings ? sendEnquiryEmail(values, settings) : Promise.reject(new Error("Contact form section not found")),
    saveContactSubmission(values),
  ]);
  if (emailed.status === "rejected") console.error("Contact form email failed:", emailed.reason);
  if (saved.status === "rejected") console.error("Contact form save failed:", saved.reason);

  if (emailed.status === "rejected" && saved.status === "rejected") {
    return {
      status: "error",
      message: "Sorry, we couldn't send your message right now. Please try again in a few minutes.",
      values,
    };
  }
  return { status: "success" };
}
