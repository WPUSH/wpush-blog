// llms-full.txt：全站文章正文合集（Markdown），供需要一次性读完的工具使用
import type { APIRoute } from "astro";
import { SITE } from "@/lib/site";
import { getAllPublished } from "@/lib/content";
import { entryToMarkdown } from "@/lib/markdown";

export const GET: APIRoute = async () => {
  const entries = await getAllPublished();
  const body =
    `# ${SITE.name} · 全文合集\n\n> ${SITE.description}\n\n` +
    entries.map((e) => entryToMarkdown(e)).join("\n\n---\n\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
