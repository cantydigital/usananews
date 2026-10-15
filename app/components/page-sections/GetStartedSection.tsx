import Image from "next/image";
import { ArrowRightIcon } from "@/app/components/header/icons";
import type { GetStartedStep, SectionBackground, SectionLink, StepIconPosition } from "@/app/lib/wordpress";
import SectionButtonLink from "./SectionButtonLink";
import { sectionThemes } from "./sectionTheme";

type Props = {
  title?: string | null;
  description?: string | null;
  steps: GetStartedStep[];
  /** Text under the steps, as HTML. */
  bottomHtml?: string;
  button?: SectionLink | null;
  /** "Section Background" in WordPress; text and cards switch colours to suit. None sits on the page background. */
  background?: SectionBackground | null;
  /**
   * "Steps Column Per Row Count" in WordPress: cards per row across the full content width. When unset, up to
   * four compact cards per row, picked from the number of steps.
   */
  perRow?: number | null;
  headingLevel?: "h1" | "h2";
};

// Step-specific colours; the band itself comes from the shared section themes.
const onLight = {
  title: "text-neutral-900",
  description: "text-neutral-600",
  number: "bg-[var(--header-brand)]/10 text-[var(--header-brand)]",
  stepText: "text-neutral-600",
  bottom: "text-neutral-700",
  link: "[&_a]:text-[var(--header-brand)]",
  button: "bg-[var(--header-brand)] text-white hover:bg-[#2b2248]",
};

const themes: Record<SectionBackground | "none", typeof onLight & { card: string }> = {
  // "Default": no band, white cards on the page background.
  none: { ...onLight, card: "bg-white shadow-sm ring-black/5" },
  light: { ...onLight, card: "bg-[var(--header-bg)] ring-black/5" },
  medium: { ...onLight, card: "bg-white shadow-sm ring-black/5" },
  dark: {
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

// Card widths for N per row: one per row on phones, two on tablets, N from large screens. Gaps are 1rem (gap-4).
const cardWidths: Record<number, string> = {
  1: "w-full",
  2: "w-full sm:w-[calc((100%-1rem)/2)]",
  3: "w-full sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]",
  4: "w-full sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]",
  5: "w-full sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-4rem)/5)]",
  6: "w-full sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-5rem)/6)]",
};

// Without a per-row count, the cards keep a compact width centred in the section, sized by the number of steps.
const compactWidths: Record<number, string> = { 1: "max-w-xs", 2: "max-w-xl", 3: "max-w-3xl", 4: "max-w-5xl" };

type StepTheme = (typeof themes)[keyof typeof themes];

// Text alignment, and where the icon sits within it, for icons above the title. Left and Right put it beside.
const topPositions: Partial<Record<StepIconPosition, { text: string; icon: string }>> = {
  "top-left": { text: "text-left", icon: "" },
  "top-center": { text: "text-center", icon: "mx-auto" },
  "top-right": { text: "text-right", icon: "ml-auto" },
};

/** One step: its icon (or number) above the title, or beside the title and text for Left and Right. */
function StepCard({ step, number, theme }: { step: GetStartedStep; number: number; theme: StepTheme }) {
  const top = topPositions[step.iconPosition];
  const marker = (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden text-sm font-bold ${theme.number} ${
        // A circle above the text, a rounded square beside it.
        top ? `rounded-full ${top.icon}` : "rounded-lg"
      }`}
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
        number
      )}
    </span>
  );
  const text = (
    <div className="min-w-0">
      <h3 className={`text-base font-bold leading-snug ${top ? "mt-4" : "pt-1.5"} ${theme.title}`}>
        {step.icon && <span className="sr-only">Step {number}: </span>}
        {step.title}
      </h3>
      {step.descriptionHtml && (
        <div
          className={`mt-1.5 text-sm leading-relaxed ${theme.stepText} ${theme.link} ${richText}`}
          dangerouslySetInnerHTML={{ __html: step.descriptionHtml }}
        />
      )}
    </div>
  );

  if (!top) {
    return (
      <div className={`flex gap-4 ${step.iconPosition === "right" ? "flex-row-reverse" : ""}`}>
        {marker}
        {text}
      </div>
    );
  }
  return (
    <div className={top.text}>
      {marker}
      {text}
    </div>
  );
}

/** "Get Started Steps" flexible content layout: numbered steps on a full-width band, then text and a button. */
export default function GetStartedSection({
  title,
  description,
  steps,
  bottomHtml,
  button,
  background = null,
  perRow,
  headingLevel: Heading = "h2",
}: Props) {
  if (steps.length === 0) return null;
  const theme = themes[background ?? "none"];
  // With a per-row count the cards span the full content width, like the other sections; rows that aren't full
  // (or fewer steps than the count) are centred.
  const columns = perRow ?? Math.min(steps.length, 4);
  const listWidth = perRow ? "" : compactWidths[columns];

  return (
    <section className={`w-full font-sans ${sectionThemes[background ?? "none"].band}`}>
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        {title && (
          <Heading className={`text-3xl font-bold tracking-tight sm:text-4xl ${theme.title}`}>{title}</Heading>
        )}
        {description && (
          <p className={`mx-auto mt-4 max-w-2xl text-base sm:text-lg ${theme.description}`}>{description}</p>
        )}

        <ol
          className={`mx-auto flex flex-wrap justify-center gap-4 text-left ${title || description ? "mt-10" : ""} ${listWidth}`}
        >
          {steps.map((step, i) => (
            <li key={`${step.title}-${i}`} className={`rounded-xl p-5 ring-1 ${cardWidths[columns]} ${theme.card}`}>
              <StepCard step={step} number={i + 1} theme={theme} />
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
