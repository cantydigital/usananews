import type { BreadcrumbItem } from "@/app/components/content/Breadcrumb";
import type { PageSection } from "@/app/lib/wordpress";
import ContactFormSection from "./ContactFormSection";
import FaqSection from "./FaqSection";
import HeroSection from "./HeroSection";
import ImageWithTextSection from "./ImageWithTextSection";

type Props = {
  sections: PageSection[];
  /** True when the sections open the page, so a leading hero becomes its h1. */
  startsPage?: boolean;
  /** Breadcrumb for a hero that opens the page. */
  breadcrumb?: BreadcrumbItem[];
  /** Path of the page the sections belong to; forms use it to find their settings on submit. */
  pagePath: string;
};

/** Renders flexible content sections in the order they're arranged in WordPress. */
export default function PageSections({ sections, startsPage = false, breadcrumb, pagePath }: Props) {
  if (sections.length === 0) return null;

  return (
    <div className="flex flex-col gap-12 lg:gap-16">
      {sections.map((section, i) => {
        const first = startsPage && i === 0;
        switch (section.type) {
          case "hero":
            return (
              <HeroSection
                key={i}
                title={section.title}
                description={section.description}
                image={section.image}
                breadcrumb={first ? breadcrumb : undefined}
                headingLevel={first ? "h1" : "h2"}
                priority={first}
              />
            );
          case "imageWithText":
            return (
              <ImageWithTextSection
                key={i}
                html={section.html}
                image={section.image}
                imagePosition={section.imagePosition}
              />
            );
          case "faq":
            return (
              <FaqSection
                key={i}
                title={section.title}
                descriptionHtml={section.descriptionHtml}
                items={section.items}
                headingLevel={first ? "h1" : "h2"}
              />
            );
          case "contactForm":
            // Only the title and description go to the page; email settings stay on the server.
            return (
              <ContactFormSection
                key={i}
                title={section.title}
                description={section.description}
                pagePath={pagePath}
                sectionIndex={i}
                headingLevel={first ? "h1" : "h2"}
              />
            );
        }
      })}
    </div>
  );
}
