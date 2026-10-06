export type NavLink = {
  label: string;
  href: string;
};

export type SocialNetwork = "facebook" | "instagram" | "youtube" | "linkedin" | "x";

export type SocialLink = {
  network: SocialNetwork;
  href: string;
};
