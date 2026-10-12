import Image from "next/image";
import type { PostSummary } from "@/app/lib/wordpress";

type Props = {
  author: PostSummary["author"];
  className: string;
};

export default function AuthorAvatar({ author, className }: Props) {
  if (author.avatarUrl) {
    return (
      <Image
        src={author.avatarUrl}
        alt=""
        width={48}
        height={48}
        // Gravatar URLs carry a query string the optimizer rejects; they are tiny anyway.
        unoptimized
        className={`${className} rounded-full object-cover`}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={`${className} inline-flex items-center justify-center rounded-full bg-[var(--header-brand)] text-[10px] font-bold uppercase text-white`}
    >
      {author.name.charAt(0)}
    </span>
  );
}
