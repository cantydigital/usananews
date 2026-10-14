import Image from "next/image";
import { ArrowRightIcon } from "@/app/components/header/icons";
import type { GetStartedStep, SectionLink } from "@/app/lib/wordpress";
import SectionButtonLink from "./SectionButtonLink";

type Props = {
  title?: string | null;
  description?: string | null;
  steps: GetStartedStep[];
  /** Text under the steps, as HTML. */
  bottomHtml?: string;
  button?: SectionLink | null;
  headingLevel?: "h1" | "h2";
};

// Styles for WordPress HTML on the dark band.
const richText = "[&_a]:font-semibold [&_a]:text-white [&_a]:underline [&_a]:underline-offset-2 [&_p+p]:mt-2";

const columnClasses: Record<number, string> = {
  1: "max-w-xs",
  2: "max-w-xl sm:grid-cols-2",
  3: "max-w-3xl sm:grid-cols-3",
};

/** "Get Started Steps" flexible content layout: numbered steps on a dark brand band, then text and a button. */
export default function GetStartedSection({
  title,
  description,
  steps,
  bottomHtml,
  button,
  headingLevel: Heading = "h2",
}: Props) {
  if (steps.length === 0) return null;

  return (
    <section className="w-full bg-[#2b2248] py-16 font-sans text-white lg:py-20">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        {title && <Heading className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</Heading>}
        {description && <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 sm:text-lg">{description}</p>}

        <ol
          className={`mx-auto mt-10 grid gap-4 text-left ${
            columnClasses[steps.length] ?? "max-w-5xl sm:grid-cols-2 lg:grid-cols-4"
          }`}
        >
          {steps.map((step, i) => (
            <li key={`${step.title}-${i}`} className="rounded-xl bg-white/10 p-5 ring-1 ring-white/10">
              <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white text-sm font-bold text-[#2b2248]">
                {step.icon ? (
                  <Image
                    src={step.icon.url}
                    alt={step.icon.alt}
                    width={20}
                    height={20}
                    unoptimized
                    className="h-5 w-5 object-contain"
                  />
                ) : (
                  i + 1
                )}
              </span>
              <h3 className="mt-4 text-base font-bold leading-snug">
                {step.icon && <span className="sr-only">Step {i + 1}: </span>}
                {step.title}
              </h3>
              {step.descriptionHtml && (
                <div
                  className={`mt-1.5 text-sm leading-relaxed text-white/75 ${richText}`}
                  dangerouslySetInnerHTML={{ __html: step.descriptionHtml }}
                />
              )}
            </li>
          ))}
        </ol>

        {bottomHtml && (
          <div
            className={`mx-auto mt-10 max-w-2xl text-base text-white/85 sm:text-lg ${richText}`}
            dangerouslySetInnerHTML={{ __html: bottomHtml }}
          />
        )}
        {button && (
          <SectionButtonLink
            link={button}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#2b2248] transition hover:bg-white/90"
          >
            {button.label}
            <ArrowRightIcon className="h-4 w-4" />
          </SectionButtonLink>
        )}
      </div>
    </section>
  );
}
