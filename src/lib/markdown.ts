// 文章的纯 Markdown 导出（/xxx/slug.md）与 llms.txt 用。
// 大模型抓取器读 Markdown 比读 HTML 省事得多，这是 GEO 最直接的一步。
import { SITE } from "./site";
import { absolute } from "./url";
import { entryPath, KINDS, type Entry } from "./content";

/** 去掉 MDX 的 import/export 语句与自定义组件标签，留下纯文本 Markdown */
function stripMdx(body: string): string {
  return body
    .replace(/^import\s.+$/gm, "")
    .replace(/^export\s.+$/gm, "")
    .replace(/<\/?Callout[^>]*>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function entryToMarkdown(e: Entry): string {
  const url = absolute(entryPath(e));
  const lines = [
    `# ${e.data.title}`,
    "",
    `> ${e.data.description}`,
    "",
    `- 来源：${SITE.name} · ${KINDS[e.collection].label}`,
    `- 网页版：${url}`,
    `- 发布：${e.data.publishDate.toISOString().slice(0, 10)}` +
      (e.data.updatedDate ? `，更新：${e.data.updatedDate.toISOString().slice(0, 10)}` : ""),
  ];
  if (e.data.tags.length) lines.push(`- 标签：${e.data.tags.join("、")}`);
  lines.push("", "---", "", "");
  const head = lines.join("\n");
  return head + stripMdx(e.body ?? "") + "\n";
}
