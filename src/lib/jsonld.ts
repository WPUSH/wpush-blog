// schema.org 结构化数据构造。只放确定成立的字段，不编造作者头像、评分之类的信息。
import { SITE } from "./site";
import { absolute, absoluteFromPathname } from "./url";
import { KINDS, type Entry } from "./content";

const LOGO = absolute("/logo.png");

export function organization() {
  return {
    "@type": "Organization",
    name: SITE.brand,
    url: SITE.origin,
    logo: LOGO,
  };
}

export function website() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: absolute("/"),
    description: SITE.description,
    inLanguage: SITE.locale,
    publisher: organization(),
  };
}

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absolute(it.path),
    })),
  };
}

export function article(e: Entry, pathname: string) {
  const url = absoluteFromPathname(pathname);
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": KINDS[e.collection].articleType,
    headline: e.data.title,
    description: e.data.description,
    url,
    mainEntityOfPage: url,
    datePublished: e.data.publishDate.toISOString(),
    dateModified: (e.data.updatedDate ?? e.data.publishDate).toISOString(),
    inLanguage: SITE.locale,
    author: organization(),
    publisher: organization(),
  };
  if (e.data.tags.length) data.keywords = e.data.tags.join(",");
  if (e.data.cover) data.image = e.data.cover.startsWith("http") ? e.data.cover : absolute(e.data.cover);
  if (e.collection === "tutorials") data.proficiencyLevel = e.data.difficulty === "进阶" ? "Expert" : "Beginner";
  return data;
}

export function faqPage(faq: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
