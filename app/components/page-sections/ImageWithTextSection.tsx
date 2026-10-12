import Image from "next/image";
import { PostContent } from "@/app/components/posts";
import type { SectionImage } from "@/app/lib/wordpress";

type Props = {
  /** Rich text (HTML) from the WYSIWYG field. */
  html: string;
  image?: SectionImage | null;
  /** Which side the image sits on from medium screens up; it's always on top on mobile. */
  imagePosition?: "left" | "right";
};

/** Two-column section: an image beside rich text. */
export default function ImageWithTextSection({ html, image, imagePosition = "left" }: Props) {
  if (!html.trim() && !image) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className={`grid items-center gap-8 lg:gap-14 ${image ? "md:grid-cols-2" : ""}`}>
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
        {html.trim() && <PostContent html={html} className={image ? "" : "mx-auto max-w-3xl"} />}
      </div>
    </section>
  );
}
