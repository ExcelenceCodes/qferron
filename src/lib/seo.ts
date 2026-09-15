const SITE_URL = "https://qferron.lovable.app";

export interface PublicPageSeo {
  path: string;
  title: string;
  description: string;
  type?: "website" | "article";
  breadcrumbs?: Array<{ name: string; path: string }>;
  schemas?: Array<Record<string, unknown>>;
}

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

export function publicPageHead({
  path,
  title,
  description,
  type = "website",
  breadcrumbs = [],
  schemas = [],
}: PublicPageSeo) {
  const url = absoluteUrl(path);
  const breadcrumbSchema = breadcrumbs.length
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: absoluteUrl(item.path),
        })),
      }
    : null;

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: type },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [breadcrumbSchema, ...schemas]
      .filter((schema): schema is Record<string, unknown> => schema !== null)
      .map((schema) => ({
        type: "application/ld+json",
        children: JSON.stringify(schema),
      })),
  };
}

export { SITE_URL };