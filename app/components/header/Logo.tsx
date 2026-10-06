type Props = {
  title?: string;
  subtitle?: string;
  className?: string;
};

/** Badge-style placeholder logo. Swap for an <Image> once a real logo exists. */
export default function Logo({
  title = "USANA NEWS",
  subtitle = "Australia",
  className = "",
}: Props) {
  return (
    <svg
      viewBox="0 0 120 50"
      role="img"
      aria-label={title}
      className={className}
    >
      <path
        d="M6 14 Q60 -4 114 14 L110 38 Q60 54 10 38 Z"
        fill="#fff"
        stroke="var(--header-brand)"
        strokeWidth="2.5"
      />
      <text
        x="60"
        y="27"
        textAnchor="middle"
        fontSize="12"
        fontWeight="800"
        fill="var(--header-brand)"
        fontFamily="Arial, Helvetica, sans-serif"
        letterSpacing="0.5"
      >
        {title}
      </text>
      <path d="M30 34 Q60 44 90 34 L88 42 Q60 50 32 42 Z" fill="var(--header-brand)" />
      <text
        x="60"
        y="41.5"
        textAnchor="middle"
        fontSize="5"
        fontWeight="600"
        fill="#fff"
        fontFamily="Arial, Helvetica, sans-serif"
        letterSpacing="0.5"
      >
        {subtitle.toUpperCase()}
      </text>
    </svg>
  );
}
