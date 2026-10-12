type Props = {
  /** Rendered block-editor HTML from WordPress. */
  html: string;
  className?: string;
};

/**
 * Article body. The HTML comes from the site's own WordPress editors, so it is rendered as-is;
 * typography lives under `.post-content` in globals.css.
 */
export default function PostContent({ html, className = "" }: Props) {
  return <div className={`post-content ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
