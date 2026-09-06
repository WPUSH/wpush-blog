// llms.txt（https://llmstxt.org）：给大模型抓取器的站点索引，每篇一行，链接指向纯 Markdown 版本
import type { APIRoute } from "astro";
import { SITE } from "@/lib/site";
import { absolute } from "@/lib/url";
import { entryMarkdownPath, getPublished, KINDS, KIND_ORDER } from "@/lib/content";

export const GET: APIRoute = async () => {
  const sections = await Promise.all(
    KIND_ORDER.map(async (k) => {
      const entries = await getPublished(k);
      if (!entries.length) return "";
      const lines = entries.map(
        (e) => `- [${e.data.title}](${absolute(entryMarkdownPath(e))}): ${e.data.description}`,
      );
      return `## ${KINDS[k].label}\n\n${lines.join("\n")}\n`;
    }),
  );
  const body = [
    `# ${SITE.name}`,
    "",
    `> ${SITE.description}`,
    "",
    `WPush 是消息推送平台：一次 API 调用同时送达微信公众号、短信、邮件、App、Webhook、钉钉、飞书、企业微信、微信 ClawBot、QQ 机器人 10 个渠道；内置 MCP Server 与 Agent Skill。产品文档与 API 参考见 ${SITE.links.docs}，全文合集见 ${absolute("/llms-full.txt")}。`,
    "",
    ...sections.filter(Boolean),
    "## 产品",
    "",
    `- [WPush 主站 llms.txt](${SITE.origin}/llms.txt): 产品文档 Markdown 版本、开放 API 速查、MCP 与 Skill 接入`,
    `- [官网](${SITE.links.home})`,
    `- [文档与 API 参考](${SITE.links.docs})`,
    `- [渠道说明](${SITE.links.channels})`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
