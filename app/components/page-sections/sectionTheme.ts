import type { SectionBackground } from "@/app/lib/wordpress";

export type SectionTheme = {
  /** Full-width band behind the section; empty when the section sits on the page background. */
  band: string;
  heading: string;
  text: string;
  /** Link and bold text colours for WordPress HTML, as arbitrary variants. */
  link: string;
  /** Cards (FAQ questions, pricing plans) stay light so their own text keeps working. */
  card: string;
  /** Added to `.post-content` for article-style text. */
  prose: string;
};

const onLight = {
  heading: "text-neutral-900",
  text: "text-neutral-600",
  link: "[&_a]:text-[var(--header-brand)] [&_strong]:text-neutral-900",
  prose: "",
};

/**
 * Colours for a section's "Section Background" choice in WordPress. `none` is a section with the field left
 * empty: no band, so it looks as it did before the field existed.
 */
export const sectionThemes: Record<SectionBackground | "none", SectionTheme> = {
  none: { ...onLight, band: "", card: "bg-white" },
  // White band; cards take the page's off-white so they still stand out.
  light: { ...onLight, band: "bg-white py-16 lg:py-20", card: "bg-[var(--header-bg)]" },
  // A light lavender tint of the brand colour (#534388), with white cards.
  medium: { ...onLight, band: "bg-[#eeebf6] py-16 lg:py-20", card: "bg-white" },
  dark: {
    band: "bg-[#2b2248] py-16 lg:py-20",
    heading: "text-white",
    text: "text-white/80",
    link: "[&_a]:text-white [&_strong]:text-white",
    card: "bg-white",
    prose: "post-content-invert",
  },
};

export function sectionTheme(background: SectionBackground | null | undefined): SectionTheme {
  return sectionThemes[background ?? "none"];
}
