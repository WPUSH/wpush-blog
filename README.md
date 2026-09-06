# WPush 博客

[WPush](https://wpush.cn/) 的内容站：接入教程、解决方案与文章，线上地址 **https://wpush.cn/blog/**。

WPush 是消息推送平台：一次 API 调用把消息送达微信公众号、短信、邮件、App、Webhook、钉钉、飞书、企业微信、微信 ClawBot、QQ 机器人 10 个渠道，内置 MCP Server 与 Agent Skill。产品文档与 API 参考在 [wpush.cn/docs](https://wpush.cn/docs/)，这里回答的是「怎么把它用到你的场景里」。

## 栏目

| 栏目 | 内容 | 目录 |
|---|---|---|
| 接入教程 | 每个渠道从绑定到收到第一条消息的完整步骤 | `src/content/tutorials/` |
| 解决方案 | 按场景组织：服务器告警、定时任务、AI Agent 通知…… | `src/content/solutions/` |
| 文章 | 产品更新、实践心得 | `src/content/posts/` |

给 AI 工具的版本：每篇文章都有纯 Markdown（网页地址后加 `.md`），全站索引 [`/blog/llms.txt`](https://wpush.cn/blog/llms.txt)，全文合集 [`/blog/llms-full.txt`](https://wpush.cn/blog/llms-full.txt)。RSS：[`/blog/rss.xml`](https://wpush.cn/blog/rss.xml)。

## 参与

- 写错了、过时了：直接提 PR 改对应的 `.mdx`。
- 想看某个渠道或场景的教程：提 [Issue](https://github.com/WPUSH/wpush-blog/issues) 说一句要解决什么问题。
- 接入 WPush 时踩到的坑、总结的方案，欢迎投稿成一篇解决方案。

文章里的 API 用法以 [官方文档](https://wpush.cn/docs/) 为准，不要凭记忆写参数。

## 本地开发

```bash
pnpm install
pnpm dev        # http://localhost:4321/blog/
pnpm build      # 产物在 dist/blog/
pnpm check      # 类型与 frontmatter 校验
```

Astro 5（Content Layer + MDX）、Tailwind CSS 4。默认零客户端 JS，纯 HTML 输出。

## 写一篇内容

在栏目目录新建 `slug.mdx`，文件名即 URL：`src/content/tutorials/feishu.mdx` → `/blog/tutorials/feishu/`。

```mdx
---
title: "飞书群机器人接入 WPush：……"        # 6~60 字
description: "……"                          # 40~160 字符，会成为搜索结果摘要
publishDate: 2026-09-10
updatedDate: 2026-09-12                    # 可选
tags: ["飞书", "渠道接入"]
draft: false                               # true 只在 dev 可见，不构建、不进 sitemap
channel: feishu                            # tutorials 专有，取值见 src/content.config.ts
difficulty: 入门                           # tutorials 专有
order: 20                                  # tutorials 专有，列表排序
# scene / audience / faq                   # solutions 专有；faq 会同时输出 FAQPage 结构化数据
# author                                   # posts 专有
---

import Callout from "@/components/Callout.astro";

正文……
```

- frontmatter 由 zod 校验，缺字段或格式错误会在构建期直接报错。
- 站内链接写 `/blog/...`，主站链接写完整的 `https://wpush.cn/...`。
- 每篇自动获得 canonical、Open Graph、Article / TechArticle JSON-LD、面包屑、`.md` 版本，并进入 sitemap、RSS 与 `llms.txt`。

## 目录

```
src/
  content.config.ts        三个集合的 schema
  content/                 文章正文（.mdx）
  lib/                     站点常量、URL 拼接、集合查询、JSON-LD、Markdown 导出
  layouts/                 BaseLayout（head / SEO）、ArticleLayout（正文 + 目录 + FAQ + 相关）
  components/              Header / Footer / ArticleCard / Toc / Breadcrumbs / Callout / Cta
  pages/                   首页、列表页、文章页、[slug].md、标签、rss.xml、llms.txt、404
scripts/
  postbuild.mjs            生成 dist/index.html
  mirror-push.sh           GitHub ⇄ CNB 镜像推送
```

## 部署与同步

站点由 EdgeOne Pages 构建，经 EdgeOne 映射为 `wpush.cn/blog/`，因此 `astro.config.mjs` 里 `site` 是主域名、`base` 是 `/blog`。

仓库同时托管在 GitHub [`WPUSH/wpush-blog`](https://github.com/WPUSH/wpush-blog) 与 CNB [`wpush/wpush-blog`](https://cnb.cool/wpush/wpush-blog)，任一侧 push 都会由 `.github/workflows/sync-to-cnb.yml` 与 `.cnb.yml` 通过 `scripts/mirror-push.sh` 以 fast-forward 方式同步到另一侧：不 force、不删引用、幂等推送不会互相触发。两侧分叉时同步会失败，本地拉齐后推任一侧即可：

```bash
git fetch origin && git fetch cnb && git merge cnb/main && git push origin main
```

## 许可

代码采用 [MIT](LICENSE)。`src/content/` 下的文章采用 [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/deed.zh-hans)：可转载，须署名并注明来源 wpush.cn，不得商用与修改。
