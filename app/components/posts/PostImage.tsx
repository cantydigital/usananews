import Image from "next/image";
import type { PostSummary } from "@/app/lib/wordpress";

type Props = {
  post: PostSummary;
  sizes: string;
  priority?: boolean;
};

/** Fills its (relative) parent with the featured image, or a brand-coloured panel when there is none. */
export default function PostImage({ post, sizes, priority }: Props) {
  if (!post.image) {
    return (
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,#7a68b5_0%,var(--header-brand)_45%,#2b2248_100%)]"
      />
    );
  }
  return (
    <Image
      src={post.image.url}
      alt={post.image.alt}
      fill
      sizes={sizes}
      priority={priority}
      className="object-cover transition duration-500 group-hover:scale-105"
    />
  );
}
