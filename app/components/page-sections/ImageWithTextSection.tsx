import Image from "next/image";
import { PostContent } from "@/app/components/posts";
import type { SectionBackground, SectionImage } from "@/app/lib/wordpress";
import { sectionTheme } from "./sectionTheme";

type Props = {
  /** Rich text (HTML) from the WYSIWYG field. */
  html: string;
  image?: SectionImage | null;
  /** Which side the image sits on from medium screens up; it's always on top on mobile. */
  imagePosition?: "left" | "right";
  /** "Section Background" in WordPress; none keeps the page background. */
  background?: SectionBackground | null;
};

/** Two-column section: an image beside rich text. */
export default function ImageWithTextSection({ html, image, imagePosition = "left", background }: Props) {
  if (!html.trim() && !image) return null;
  const theme = sectionTheme(background);

  return (
    <section className={`w-full ${theme.band}`}>
      <div
        className={`mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:gap-14 lg:px-8 ${image ? "md:grid-cols-2" : ""}`}
      >
        {image && (
          <div className={`relative overflow-hidden rounded-2xl bg-neutral-200 ${imagePosition === "right" ? "md:order-2" : ""}`}>
            <Image
              src={image.url}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="(min-width: 1280px) 600px, (min-width: 768px) 50vw, 100vw"
              className="h-auto w-full"
            />
          </div>
        )}
        {html.trim() && <PostContent html={html} className={`${theme.prose} ${image ? "" : "mx-auto max-w-3xl"}`} />}
      </div>
    </section>
  );
}
