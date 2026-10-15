import type { BreadcrumbItem } from "@/app/components/content/Breadcrumb";
import type { PageSection } from "@/app/lib/wordpress";
import ContactFormSection from "./ContactFormSection";
import FaqSection from "./FaqSection";
import GetStartedSection from "./GetStartedSection";
import HeroSection from "./HeroSection";
import ImageWithTextSection from "./ImageWithTextSection";
import PricingSection from "./PricingSection";

type Props = {
  sections: PageSection[];
  /** True when the sections open the page, so a leading hero becomes its h1. */
  startsPage?: boolean;
  /** Breadcrumb for a hero that opens the page. */
  breadcrumb?: BreadcrumbItem[];
  /** Path of the page the sections belong to; forms use it to find their settings on submit. */
  pagePath: string;
};

/** True for a section drawn on a full-width coloured band (any "Section Background" choice). */
function hasBand(section: PageSection | undefined) {
  return section !== undefined && "background" in section && section.background !== null;
}

/** Renders flexible content sections in the order they're arranged in WordPress. */
export default function PageSections({ sections, startsPage = false, breadcrumb, pagePath }: Props) {
  if (sections.length === 0) return null;

  return (
    <div className="flex flex-col gap-12 lg:gap-16">
      {sections.map((section, i) => {
        // Neighbouring bands sit flush against each other rather than with a strip of page between.
        const flush = hasBand(section) && hasBand(sections[i - 1]);
        return (
          <div key={i} className={flush ? "-mt-12 lg:-mt-16" : undefined}>
            {renderSection(section, i, startsPage && i === 0, breadcrumb, pagePath)}
          </div>
        );
      })}
    </div>
  );
}

function renderSection(
  section: PageSection,
  index: number,
  first: boolean,
  breadcrumb: BreadcrumbItem[] | undefined,
  pagePath: string,
) {
  const headingLevel = first ? "h1" : "h2";
  switch (section.type) {
    case "hero":
      return (
        <HeroSection
          title={section.title}
          description={section.description}
          image={section.image}
          breadcrumb={first ? breadcrumb : undefined}
          headingLevel={headingLevel}
          priority={first}
        />
      );
    case "imageWithText":
      return (
        <ImageWithTextSection
          html={section.html}
          image={section.image}
          imagePosition={section.imagePosition}
          background={section.background}
        />
      );
    case "faq":
      return (
        <FaqSection
          title={section.title}
          descriptionHtml={section.descriptionHtml}
          items={section.items}
          headingLevel={headingLevel}
          background={section.background}
        />
      );
    case "contactForm":
      // Only the title and description go to the page; email settings stay on the server.
      return (
        <ContactFormSection
          title={section.title}
          description={section.description}
          pagePath={pagePath}
          sectionIndex={index}
          headingLevel={headingLevel}
          background={section.background}
        />
      );
    case "pricing":
      return (
        <PricingSection
          title={section.title}
          plans={section.plans}
          descriptionHtml={section.descriptionHtml}
          button={section.button}
          headingLevel={headingLevel}
          background={section.background}
        />
      );
    case "steps":
      return (
        <GetStartedSection
          title={section.title}
          description={section.description}
          steps={section.steps}
          bottomHtml={section.bottomHtml}
          button={section.button}
          background={section.background}
          perRow={section.perRow}
          headingLevel={headingLevel}
        />
      );
  }
}
