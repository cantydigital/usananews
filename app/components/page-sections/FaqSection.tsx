import { MinusIcon, PlusIcon } from "@/app/components/header/icons";
import type { FaqItem } from "@/app/lib/wordpress";

type Props = {
  title?: string | null;
  /** Intro under the title, as HTML. */
  descriptionHtml?: string;
  items: FaqItem[];
  headingLevel?: "h1" | "h2";
  /** Index of the question that starts open; -1 starts all closed. */
  defaultOpen?: number;
};

// Styles for WordPress HTML inside answers and the intro.
const richText =
  "[&_a]:font-semibold [&_a]:text-[var(--header-brand)] [&_a]:underline [&_a]:underline-offset-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p+*]:mt-3 [&_strong]:text-neutral-900 [&_ul]:list-disc [&_ul]:pl-5";

function Question({ item, open }: { item: FaqItem; open: boolean }) {
  return (
    <details
      open={open}
      className="group rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition open:ring-[var(--header-brand)]/30"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-base font-semibold text-neutral-900 marker:hidden [&::-webkit-details-marker]:hidden">
        {item.question}
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 group-open:bg-[var(--header-brand)] group-open:text-white">
          <PlusIcon className="h-4 w-4 group-open:hidden" />
          <MinusIcon className="hidden h-4 w-4 group-open:block" />
        </span>
      </summary>
      {item.answerHtml && (
        <div
          className={`px-5 pb-5 text-[15px] leading-relaxed text-neutral-600 ${richText}`}
          dangerouslySetInnerHTML={{ __html: item.answerHtml }}
        />
      )}
    </details>
  );
}

/**
 * Title and intro above a two-column accordion of questions. Built on <details>, so it works without
 * JavaScript and every answer is in the HTML. Also emits FAQPage structured data for search engines.
 */
export default function FaqSection({
  title,
  descriptionHtml,
  items,
  headingLevel: Heading = "h2",
  defaultOpen = 0,
}: Props) {
  if (items.length === 0) return null;

  // Two independent columns, so opening a question doesn't stretch the one beside it.
  const half = Math.ceil(items.length / 2);
  const columns = [items.slice(0, half), items.slice(half)];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answerText },
    })),
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      {(title || descriptionHtml) && (
        <div className="mb-8 max-w-2xl">
          {title && (
            <Heading className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">{title}</Heading>
          )}
          {descriptionHtml && (
            <div
              className={`mt-3 text-base text-neutral-600 ${richText}`}
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          )}
        </div>
      )}

      <div className="grid items-start gap-4 md:grid-cols-2 md:gap-6">
        {columns.map((column, c) => (
          <div key={c} className="flex flex-col gap-4">
            {column.map((item, i) => (
              <Question key={item.question} item={item} open={c * half + i === defaultOpen} />
            ))}
          </div>
        ))}
      </div>

      <script
        type="application/ld+json"
        // Escape "<" so answer text can't close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
    </section>
  );
}
