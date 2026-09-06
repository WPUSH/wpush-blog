// 内容集合定义（Astro 5 Content Layer）。三类内容各一个目录，frontmatter 由 zod 校验：
// 缺 description、日期格式错、title 过长都会在构建期直接报错，这是内容站 SEO 质量的硬约束。
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/** WPush 渠道标识，与主站 channel 参数取值一致 */
export const CHANNELS = [
  "wechat",
  "sms",
  "mail",
  "app",
  "webhook",
  "dingtalk",
  "feishu",
  "wechat_work",
  "clawbot",
  "qqbot",
] as const;
export type Channel = (typeof CHANNELS)[number];

const base = z.object({
  /** 页面 <title> 与 H1；搜索结果标题约 30 个汉字内不截断 */
  title: z.string().min(6).max(60),
  /** meta description；80~160 字符，太短没信息量、太长被截 */
  description: z.string().min(40).max(160),
  publishDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  /** 草稿只在 dev 可见，不进构建、不进 sitemap */
  draft: z.boolean().default(false),
  /** 可选封面图（public/ 下相对路径或绝对 URL），用于 og:image */
  cover: z.string().optional(),
});

const tutorials = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/tutorials" }),
  schema: base.extend({
    channel: z.enum(CHANNELS).optional(),
    difficulty: z.enum(["入门", "进阶"]).default("入门"),
    /** 列表页排序，越小越靠前；未设置按日期倒序 */
    order: z.number().int().optional(),
  }),
});

const solutions = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/solutions" }),
  schema: base.extend({
    /** 场景标签，如「服务器告警」「定时任务」「AI Agent」 */
    scene: z.string().min(2).max(20),
    /** 面向谁，如「运维 / 独立开发者」 */
    audience: z.string().optional(),
    /** 页面末尾 FAQ，同时输出 schema.org FAQPage，GEO 命中率高 */
    faq: z
      .array(z.object({ q: z.string().min(4), a: z.string().min(10) }))
      .default([]),
  }),
});

const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
  schema: base.extend({
    author: z.string().default("WPush 团队"),
  }),
});

export const collections = { tutorials, solutions, posts };
