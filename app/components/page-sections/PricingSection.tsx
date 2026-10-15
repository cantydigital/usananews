import { CheckIcon } from "@/app/components/header/icons";
import type { PricingPlan, SectionBackground, SectionLink } from "@/app/lib/wordpress";
import SectionButtonLink from "./SectionButtonLink";
import { sectionTheme } from "./sectionTheme";

type Props = {
  title?: string | null;
  plans: PricingPlan[];
  /** Text under the plans, as HTML. */
  descriptionHtml?: string;
  /** Secondary button under the text, e.g. "Contact Us for Custom Solutions". */
  button?: SectionLink | null;
  headingLevel?: "h1" | "h2";
  /** "Section Background" in WordPress; none keeps the page background. */
  background?: SectionBackground | null;
};

// Styles for WordPress HTML in the text under the plans; colours come from the section theme.
const richText = "[&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-2 [&_p+p]:mt-3";

function PlanCard({ plan, card }: { plan: PricingPlan; card: string }) {
  return (
    <article className={`flex flex-col rounded-2xl p-6 text-center shadow-sm ring-1 ring-black/10 sm:p-8 ${card}`}>
      <h3 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">{plan.name}</h3>

      {plan.amount && (
        <p className="mt-4 flex flex-wrap items-baseline justify-center gap-x-2">
          <span className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">{plan.amount}</span>
          {plan.period && <span className="text-base text-neutral-600">{plan.period}</span>}
        </p>
      )}
      {plan.description && <p className="mx-auto mt-4 max-w-xs text-sm text-neutral-600">{plan.description}</p>}

      {plan.features.length > 0 && (
        <ul className="mt-8 flex flex-col gap-3 text-left text-sm text-neutral-700">
          {plan.features.map((feature) => (
            <li key={feature} className="flex gap-3">
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--header-brand)]" />
              {feature}
            </li>
          ))}
        </ul>
      )}

      {/* Push the button to the bottom so buttons line up across cards */}
      <div className="mt-auto pt-8">
        {plan.button && (
          <SectionButtonLink
            link={plan.button}
            className="block w-full rounded-lg bg-[var(--header-brand)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2b2248]"
          >
            {plan.button.label}
          </SectionButtonLink>
        )}
        {plan.note && <p className="mt-4 text-xs leading-relaxed text-neutral-500">{plan.note}</p>}
      </div>
    </article>
  );
}

/** "Pricing Plan" flexible content layout: a centred title over plan cards, then optional text and a button. */
export default function PricingSection({
  title,
  plans,
  descriptionHtml,
  button,
  headingLevel: Heading = "h2",
  background,
}: Props) {
  if (plans.length === 0) return null;
  const theme = sectionTheme(background);

  return (
    <section className={`w-full font-sans ${theme.band}`}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {title && (
          <Heading className={`text-center text-3xl font-bold tracking-tight sm:text-4xl ${theme.heading}`}>
            {title}
          </Heading>
        )}

        <div
          className={`mx-auto mt-10 grid gap-6 sm:gap-8 ${
            plans.length === 1 ? "max-w-md" : plans.length === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} card={theme.card} />
          ))}
        </div>

        {(descriptionHtml || button) && (
          <div className="mx-auto mt-10 max-w-3xl text-center">
            {descriptionHtml && (
              <div
                className={`text-sm leading-relaxed ${theme.text} ${theme.link} ${richText}`}
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            )}
            {button && (
              <SectionButtonLink
                link={button}
                className="mt-5 inline-flex items-center rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 shadow-sm ring-1 ring-black/10 transition hover:bg-[var(--header-brand)] hover:text-white"
              >
                {button.label}
              </SectionButtonLink>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
