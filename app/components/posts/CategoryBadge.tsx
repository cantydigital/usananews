type Props = {
  name: string;
  /** "badge" is a filled tag; "text" is coloured uppercase text. */
  variant?: "badge" | "text";
};

export default function CategoryBadge({ name, variant = "badge" }: Props) {
  if (variant === "text") {
    return (
      <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--header-brand)]">
        {name}
      </span>
    );
  }
  return (
    <span className="inline-block rounded-sm bg-[var(--header-brand)] px-2 py-1 text-[11px] font-bold uppercase leading-none tracking-wider text-white">
      {name}
    </span>
  );
}
