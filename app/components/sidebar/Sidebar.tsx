import NewsletterSignup from "./NewsletterSignup";
import PopularPosts from "./PopularPosts";

type Props = {
  /** Href of the post being viewed, so it isn't listed as popular. */
  currentHref?: string;
};

/** Right-hand sidebar for article and listing pages. */
export default function Sidebar({ currentHref }: Props) {
  return (
    <aside className="flex flex-col gap-10 lg:sticky lg:top-8 lg:self-start">
      <PopularPosts excludeHref={currentHref} />
      <NewsletterSignup />
    </aside>
  );
}
