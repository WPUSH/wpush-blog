import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { SITE } from "@/lib/site";
import { absolute } from "@/lib/url";
import { entryPath, getAllPublished, KINDS } from "@/lib/content";

export async function GET(_ctx: APIContext) {
  const entries = await getAllPublished();
  return rss({
    title: SITE.name,
    description: SITE.description,
    site: absolute("/"),
    items: entries.map((e) => ({
      title: e.data.title,
      description: e.data.description,
      pubDate: e.data.publishDate,
      link: absolute(entryPath(e)),
      categories: [KINDS[e.collection].label, ...e.data.tags],
    })),
    customData: `<language>zh-cn</language>`,
  });
}
