export type NavLink = {
  label: string;
  href: string;
  /** Open in a new tab (set per item in WordPress menus). */
  newTab?: boolean;
};

export type SocialNetwork = "facebook" | "instagram" | "youtube" | "linkedin" | "x";

export type SocialLink = {
  network: SocialNetwork;
  href: string;
};
