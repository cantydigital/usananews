"use server";

import { Resend } from "resend";
import {
  getSubmissionCategories,
  savePressReleaseSubmission,
  type PressReleaseSubmission,
  type SubmissionCategory,
} from "@/app/lib/wordpress";

export type PressReleaseField = Exclude<keyof PressReleaseSubmission, "categoryId"> | "category" | "image";

export type PressReleaseFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<PressReleaseField, string>>;
};

const MAX_IMAGE_BYTES = 300 * 1024;
const MIN_CONTENT_LENGTH = 300;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[\d\s()+.-]{6,30}$/;
// Humans take a while to fill in a press release; most bots submit instantly.
const MIN_FILL_TIME_MS = 5_000;

function field(formData: FormData, name: string, max: number) {
  return String(formData.get(name) ?? "").trim().slice(0, max);
}

/** The image's real type from its first bytes, so a renamed file can't pass as an image. */
async function imageType(file: File): Promise<string | null> {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (ascii(1, 4) === "PNG") return "image/png";
  if (ascii(0, 4) === "GIF8") return "image/gif";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  return null;
}

async function validate(values: PressReleaseSubmission, categories: SubmissionCategory[], image: File | null) {
  const errors: Partial<Record<PressReleaseField, string>> = {};
  if (values.title.length < 10) errors.title = "Please enter a title of at least 10 characters.";
  if (!categories.some((category) => category.id === values.categoryId)) errors.category = "Please select a category.";
  if (values.content.length < MIN_CONTENT_LENGTH) {
    errors.content = `Please enter the full press release (at least ${MIN_CONTENT_LENGTH} characters).`;
  }
  if (!values.author) errors.author = "Please enter the author's name.";
  if (!values.company) errors.company = "Please enter the company name.";
  if (!EMAIL.test(values.email)) errors.email = "Please enter a valid email address.";
  if (values.phone && !PHONE.test(values.phone)) errors.phone = "Please enter a valid phone number.";
  if (values.purchaseEmail && !EMAIL.test(values.purchaseEmail)) {
    errors.purchaseEmail = "Please enter a valid email address.";
  }
  if (image) {
    if (image.size > MAX_IMAGE_BYTES) errors.image = "The image must be 300KB or smaller.";
    else if (!(await imageType(image))) errors.image = "The image must be a JPG, PNG, GIF or WebP file.";
  }
  return errors;
}

const escape = (text: string) => text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
const oneLine = (text: string) => text.replace(/[\r\n]+/g, " ").trim();

/** Tells the editorial team about the submission. The image is attached so nothing is lost if WordPress was down. */
async function sendNotificationEmail(
  values: PressReleaseSubmission,
  categoryName: string,
  image: File | null,
  editUrl: string | null,
) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = (process.env.PRESS_RELEASE_EMAIL_TO ?? "").split(/[,;\s]+/).filter(Boolean);
  const from = process.env.PRESS_RELEASE_EMAIL_FROM;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  if (to.length === 0 || !from) throw new Error("PRESS_RELEASE_EMAIL_TO and PRESS_RELEASE_EMAIL_FROM must be set");

  const rows: [string, string][] = [
    ["Title", values.title],
    ["Subtitle", values.subtitle || "—"],
    ["Category", categoryName],
    ["Author", values.author],
    ["Company", values.company],
    ["Email", values.email],
    ["Phone", values.phone || "—"],
    ["Purchase email", values.purchaseEmail || "—"],
    ["Review in WordPress", editUrl ?? "Not saved to WordPress – please add it manually"],
  ];
  const { error } = await new Resend(apiKey).emails.send({
    from,
    to,
    replyTo: values.email,
    subject: oneLine(`New press release for review – ${values.title}`),
    text: `${rows.map(([label, value]) => `${label}: ${value}`).join("\n")}\n\n${values.content}`,
    html: `<table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px">${rows
      .map(([label, value]) => `<tr><td><strong>${label}</strong></td><td>${escape(value)}</td></tr>`)
      .join("")}</table><p style="font-family:Arial,sans-serif;font-size:14px;white-space:pre-wrap">${escape(values.content)}</p>`,
    attachments: image
      ? [{ filename: image.name || "press-release-image", content: Buffer.from(await image.arrayBuffer()) }]
      : undefined,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}

/**
 * Press release submission: validates, saves it to WordPress as a post pending editorial review,
 * then emails the editorial team. It succeeds if either works, so a submission isn't lost when one is down.
 */
export async function submitPressRelease(
  _previous: PressReleaseFormState,
  formData: FormData,
): Promise<PressReleaseFormState> {
  const values: PressReleaseSubmission = {
    title: field(formData, "title", 200),
    subtitle: field(formData, "subtitle", 300),
    categoryId: Number(formData.get("category")),
    content: field(formData, "content", 30_000),
    author: field(formData, "author", 100),
    company: field(formData, "company", 150),
    email: field(formData, "email", 254),
    phone: field(formData, "phone", 30),
    purchaseEmail: field(formData, "purchaseEmail", 254),
  };
  const upload = formData.get("image");
  const image = upload instanceof File && upload.size > 0 ? upload : null;

  // Spam traps: a hidden field only bots fill in, and a minimum time to complete the form
  // (startedAt is set by the browser, so it's skipped if JavaScript didn't run). Bots get a
  // normal-looking success so they don't learn to adapt.
  const startedAt = Number(formData.get("startedAt"));
  if (formData.get("website") || (startedAt > 0 && Date.now() - startedAt < MIN_FILL_TIME_MS)) {
    return { status: "success" };
  }

  let categories: SubmissionCategory[];
  try {
    categories = await getSubmissionCategories();
  } catch (error) {
    console.error("Press release categories unavailable:", (error as Error).message);
    return { status: "error", message: "Sorry, submissions are unavailable right now. Please try again shortly." };
  }

  const fieldErrors = await validate(values, categories, image);
  if (Object.keys(fieldErrors).length) {
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors };
  }

  const editUrl = await savePressReleaseSubmission(values, image).catch((error: Error) => {
    console.error("Press release save failed:", error.message);
    return null;
  });
  const categoryName = categories.find((category) => category.id === values.categoryId)?.name ?? "";
  const emailed = await sendNotificationEmail(values, categoryName, image, editUrl).then(
    () => true,
    (error: Error) => {
      console.error("Press release email failed:", error.message);
      return false;
    },
  );

  if (!editUrl && !emailed) {
    return {
      status: "error",
      message: "Sorry, we couldn't receive your press release right now. Please try again in a few minutes.",
    };
  }
  return { status: "success" };
}
