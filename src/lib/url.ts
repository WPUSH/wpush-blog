import { SITE } from "./site";

/** 去掉尾部斜杠的 base，如 "/blog"（BASE_URL 是否带斜杠随 trailingSlash 配置变化，这里统一） */
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, "");

/**
 * 站内链接统一走这里：补 base，页面路径补尾斜杠（与 trailingSlash: "always" 一致），
 * 带扩展名的文件路径（rss.xml、*.md）保持原样。
 */
export function href(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  const isFile = /\.[a-z0-9]+$/i.test(p);
  const normalized = isFile || p.endsWith("/") ? p : `${p}/`;
  return `${BASE}${normalized}`;
}

/** 绝对地址（canonical / og:url / sitemap / RSS / JSON-LD 用） */
export function absolute(path: string): string {
  return new URL(href(path), SITE.origin).toString();
}

/** 页面路径规范形：无扩展名的路径补尾斜杠（trailingSlash=ignore 时 Astro.url.pathname 对首页给的是不带斜杠的 base） */
export function normalizePagePath(pathname: string): string {
  const isFile = /\.[a-z0-9]+$/i.test(pathname);
  return isFile || pathname.endsWith("/") ? pathname : `${pathname}/`;
}

/** 已含 base 的 pathname（如 Astro.url.pathname）转绝对地址，页面路径统一带尾斜杠 */
export function absoluteFromPathname(pathname: string): string {
  return new URL(normalizePagePath(pathname), SITE.origin).toString();
}
