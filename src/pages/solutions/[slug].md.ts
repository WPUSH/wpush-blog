// 文章的纯 Markdown 版本：/blog/solutions/{slug}.md，供 AI 工具与抓取器直接读取
import type { APIRoute } from "astro";
import { getPublished, type Entry } from "@/lib/content";
import { entryToMarkdown } from "@/lib/markdown";

export async function getStaticPaths() {
  const entries = await getPublished("solutions");
  return entries.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}

export const GET: APIRoute = ({ props }) =>
  new Response(entryToMarkdown(props.entry as Entry), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
