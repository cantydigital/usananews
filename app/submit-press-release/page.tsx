import type { Metadata } from "next";
import Breadcrumb from "@/app/components/content/Breadcrumb";
import PressReleaseForm from "@/app/components/press-release/PressReleaseForm";
import { getSubmissionCategories } from "@/app/lib/wordpress";

export const metadata: Metadata = {
  title: "Submit a Press Release",
  description:
    "Submit your press release for review. Our editorial team reviews every submission and publishes quality releases within 24–48 hours.",
};

const steps = [
  { title: "Submit", text: "Fill in the form with your full release, contact details and an optional image." },
  { title: "Editorial review", text: "Our editors check every release for accuracy, newsworthiness and style." },
  { title: "Published", text: "Approved releases go live within 24–48 hours and we email you the link." },
];

const guidelines = [
  "Write in the third person, in a factual, news-style tone.",
  "Lead with the who, what, when, where and why.",
  "Include a dateline, e.g. “SYDNEY, 12 October 2026 –”.",
  "Avoid excessive promotional language and ALL CAPS.",
  "Only submit content you own or have permission to publish.",
];

export default async function SubmitPressReleasePage() {
  const categories = await getSubmissionCategories();

  return (
    <main className="flex-1 bg-[var(--header-bg)] pb-12 pt-8 font-sans lg:pb-16 lg:pt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="max-w-3xl">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Submit a Press Release" }]} />
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[var(--header-brand)]">Public submission</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
            Submit your press release
          </h1>
          <span aria-hidden className="mt-5 block h-1 w-16 rounded-full bg-[var(--header-brand)]" />
          <p className="mt-5 text-base text-neutral-600 sm:text-lg">
            Submit your press release for review. Our editorial team will review and approve quality submissions for
            publication.
          </p>
        </header>

        <ol className="mt-10 grid gap-4 sm:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="rounded-xl bg-white p-5 ring-1 ring-black/5">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--header-brand)]">Step {i + 1}</span>
              <p className="mt-1 font-bold text-neutral-900">{step.title}</p>
              <p className="mt-1 text-sm text-neutral-600">{step.text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section
            aria-labelledby="press-release-form-heading"
            className="relative rounded-2xl bg-white p-6 shadow-lg shadow-black/5 ring-1 ring-black/5 sm:p-8"
          >
            <h2 id="press-release-form-heading" className="text-2xl font-bold tracking-tight text-neutral-900">
              Your submission
            </h2>
            <p className="mt-2 mb-8 text-neutral-600">
              Please provide complete and accurate information. Fields marked * are required.
            </p>
            <PressReleaseForm categories={categories} />
          </section>

          <aside className="flex flex-col gap-6 lg:sticky lg:top-8 lg:self-start">
            <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--header-brand)] to-[#2b2248] p-7 text-white">
              <div aria-hidden className="absolute -bottom-16 -right-16 -z-10 h-48 w-48 rounded-full bg-white/10" />
              <h2 className="text-xl font-bold tracking-tight">Review process</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/80">
                All submissions go through our editorial review process. Approved releases are published within 24–48
                hours and you&apos;ll receive an email with the live URL.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/80">
                <strong className="text-white">Already paid?</strong> Enter the email you used at checkout in the{" "}
                <strong className="text-white">Purchase email</strong> field so we can match your submission to your
                credit.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-7 ring-1 ring-black/5">
              <h2 className="text-lg font-bold tracking-tight text-neutral-900">Submission guidelines</h2>
              <ul className="mt-4 flex flex-col gap-3 text-sm text-neutral-600">
                {guidelines.map((guideline) => (
                  <li key={guideline} className="flex gap-2.5">
                    <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--header-brand)]" />
                    {guideline}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
