/** Public URL of the front end, used for absolute links such as share URLs. Set SITE_URL per environment. */
export const SITE_URL = (process.env.SITE_URL ?? "https://usananews.com.au").replace(/\/$/, "");
