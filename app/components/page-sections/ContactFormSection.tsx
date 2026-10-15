import { socialNetworks } from "@/app/components/header/Header";
import { MailIcon } from "@/app/components/header/icons";
import { getSocialLinks, type SectionBackground } from "@/app/lib/wordpress";
import ContactForm from "./ContactForm";
import { sectionTheme } from "./sectionTheme";

type Props = {
  title?: string | null;
  description?: string | null;
  /** Page path and section position; the server reads the form's email settings from these. */
  pagePath: string;
  sectionIndex: number;
  headingLevel?: "h1" | "h2";
  /** "Section Background" in WordPress; none keeps the original light brand tint behind the top of the card. */
  background?: SectionBackground | null;
};

/** Centred title over a coloured band, then a card with a brand panel beside the enquiry form. */
export default async function ContactFormSection({
  title,
  description,
  pagePath,
  sectionIndex,
  headingLevel: Heading = "h2",
  background,
}: Props) {
  const socialLinks = await getSocialLinks();
  const theme = sectionTheme(background);

  return (
    <section className={`relative isolate w-full font-sans ${background ? theme.band : "py-12 lg:py-16"}`}>
      {!background && (
        <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-2/3 bg-[var(--header-brand)]/[0.06]" />
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(title || description) && (
          <div className="mx-auto mb-10 max-w-2xl text-center">
            {title && (
              <Heading className={`text-3xl font-bold tracking-tight sm:text-4xl ${theme.heading}`}>{title}</Heading>
            )}
            {description && <p className={`mt-3 text-base sm:text-lg ${theme.text}`}>{description}</p>}
          </div>
        )}

        <div className="mx-auto grid max-w-5xl gap-8 rounded-2xl bg-white p-3 shadow-lg shadow-black/5 ring-1 ring-black/5 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:gap-10">
          <aside className="relative isolate overflow-hidden rounded-xl bg-gradient-to-br from-[var(--header-brand)] to-[#2b2248] p-7 text-white">
            <div aria-hidden className="absolute -bottom-16 -right-16 -z-10 h-48 w-48 rounded-full bg-white/10" />
            <div aria-hidden className="absolute -bottom-6 right-16 -z-10 h-20 w-20 rounded-full bg-white/10" />
            <span className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
              <MailIcon className="h-5 w-5" />
            </span>
            <h3 className="text-xl font-bold tracking-tight">Contact information</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/80">
              Questions, story tips, corrections or advertising enquiries? Fill in the form and our team will get
              back to you.
            </p>
            {socialLinks.length > 0 && (
              <div className="mt-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Follow us</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {socialLinks.map(({ network, href }) => {
                    const { label, Icon } = socialNetworks[network];
                    return (
                      <li key={network}>
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={label}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25"
                        >
                          <Icon className="h-4 w-4" />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </aside>

          <div className="relative px-4 py-6 md:py-8 md:pr-8">
            <ContactForm pagePath={pagePath} sectionIndex={sectionIndex} />
          </div>
        </div>
      </div>
    </section>
  );
}
