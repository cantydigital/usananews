"use server";

export type NewsletterState = {
  status: "idle" | "error" | "unavailable" | "subscribed";
  message?: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Newsletter sign-up, called from the NewsletterSignup form. */
export async function subscribeToNewsletter(
  _previous: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!EMAIL.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  // TODO: connect the newsletter provider (e.g. Mailchimp, Klaviyo) here and return
  // { status: "subscribed" } on success. Until then no email address is stored or sent.
  return {
    status: "unavailable",
    message: "Thanks for your interest! Newsletter sign-ups open soon.",
  };
}
