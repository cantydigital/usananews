import Image from "next/image";
import { ArrowRightIcon } from "@/app/components/header/icons";
import type { GetStartedStep, SectionBackground, SectionLink } from "@/app/lib/wordpress";
import SectionButtonLink from "./SectionButtonLink";

type Props = {
  title?: string | null;
  description?: string | null;
  steps: GetStartedStep[];
  /** Text under the steps, as HTML. */
  bottomHtml?: string;
  button?: SectionLink | null;
  /** "Section Background" in WordPress; text and cards switch colours to suit. */
  background?: SectionBackground;
  headingLevel?: "h1" | "h2";
};

// Shared by the light and medium themes: dark text, brand-coloured accents.
const onLight = {
  title: "text-neutral-900",
  description: "text-neutral-600",
  number: "bg-[var(--header-brand)]/10 text-[var(--header-brand)]",
  stepText: "text-neutral-600",
  bottom: "text-neutral-700",
  link: "[&_a]:text-[var(--header-brand)]",
  button: "bg-[var(--header-brand)] text-white hover:bg-[#2b2248]",
};

const themes: Record<SectionBackground, typeof onLight & { section: string; card: string }> = {
  light: { ...onLight, section: "bg-white", card: "bg-[var(--header-bg)] ring-black/5" },
  // A light lavender tint of the brand colour (#534388), with white cards.
  medium: { ...onLight, section: "bg-[#eeebf6]", card: "bg-white shadow-sm ring-black/5" },
  dark: {
    section: "bg-[#2b2248]",
    title: "text-white",
    description: "text-white/80",
    card: "bg-white/10 ring-white/10",
    number: "bg-white text-[#2b2248]",
    stepText: "text-white/75",
    bottom: "text-white/85",
    link: "[&_a]:text-white",
    button: "bg-white text-[#2b2248] hover:bg-white/90",
  },
};

// Styles for WordPress HTML; the link colour comes from the theme.
const richText = "[&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-2 [&_p+p]:mt-2";

const columnClasses: Record<number, string> = {
  1: "max-w-xs",
  2: "max-w-xl sm:grid-cols-2",
  3: "max-w-3xl sm:grid-cols-3",
};

/** "Get Started Steps" flexible content layout: numbered steps on a full-width band, then text and a button. */
export default function GetStartedSection({
  title,
  description,
  steps,
  bottomHtml,
  button,
  background = "dark",
  headingLevel: Heading = "h2",
}: Props) {
  if (steps.length === 0) return null;
  const theme = themes[background];

  return (
    <section className={`w-full py-16 font-sans lg:py-20 ${theme.section}`}>
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        {title && (
          <Heading className={`text-3xl font-bold tracking-tight sm:text-4xl ${theme.title}`}>{title}</Heading>
        )}
        {description && (
          <p className={`mx-auto mt-4 max-w-2xl text-base sm:text-lg ${theme.description}`}>{description}</p>
        )}

        <ol
          className={`mx-auto mt-10 grid gap-4 text-left ${
            columnClasses[steps.length] ?? "max-w-5xl sm:grid-cols-2 lg:grid-cols-4"
          }`}
        >
          {steps.map((step, i) => (
            <li key={`${step.title}-${i}`} className={`rounded-xl p-5 ring-1 ${theme.card}`}>
              <span
                className={`flex h-9 w-9 items-center justify-center overflow-hidden rounded-full text-sm font-bold ${theme.number}`}
              >
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
              <h3 className={`mt-4 text-base font-bold leading-snug ${theme.title}`}>
                {step.icon && <span className="sr-only">Step {i + 1}: </span>}
                {step.title}
              </h3>
              {step.descriptionHtml && (
                <div
                  className={`mt-1.5 text-sm leading-relaxed ${theme.stepText} ${theme.link} ${richText}`}
                  dangerouslySetInnerHTML={{ __html: step.descriptionHtml }}
                />
              )}
            </li>
          ))}
        </ol>

        {bottomHtml && (
          <div
            className={`mx-auto mt-10 max-w-2xl text-base sm:text-lg ${theme.bottom} ${theme.link} ${richText}`}
            dangerouslySetInnerHTML={{ __html: bottomHtml }}
          />
        )}
        {button && (
          <SectionButtonLink
            link={button}
            className={`mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition ${theme.button}`}
          >
            {button.label}
            <ArrowRightIcon className="h-4 w-4" />
          </SectionButtonLink>
        )}
      </div>
    </section>
  );
}
