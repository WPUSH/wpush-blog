# wpush-blog

WPush 内容站：接入教程、解决方案、文章。面向搜索引擎与大模型抓取（SEO / GEO），纯静态 HTML，默认零客户端 JS。

线上地址：`https://wpush.cn/blog/`（二级目录，不是子域名）。

## 技术栈

- Astro 5（Content Layer + MDX）、Tailwind CSS 4、`@tailwindcss/typography`
- `@astrojs/sitemap`、`@astrojs/rss`；React 仅在需要交互岛时使用
- 主站同一套设计 token（`src/styles/global.css`）

## 本地开发

```bash
pnpm install
pnpm dev        # http://localhost:4321/blog/
pnpm build      # 产物在 dist/blog/，另生成 dist/index.html 跳转页
pnpm preview
pnpm check      # astro check（类型与 frontmatter）
```

## 目录

```
src/
  content.config.ts        三个集合的 schema（tutorials / solutions / posts）
  content/{tutorials,solutions,posts}/*.mdx
  lib/
    site.ts                站点常量、渠道展示名与色值
    url.ts                 href() / absolute()：统一补 base 与尾斜杠
    content.ts             集合查询、排序、标签索引、相关文章
    jsonld.ts              schema.org 构造（WebSite / Article / FAQPage / BreadcrumbList）
    markdown.ts            文章 → 纯 Markdown（供 *.md 与 llms.txt）
  layouts/                 BaseLayout（head/SEO/JSON-LD）、ArticleLayout（正文 + TOC + FAQ + 相关）
  components/              Header / Footer / ArticleCard / Toc / Breadcrumbs / Callout / Cta / SEO / JsonLd
  pages/
    index.astro            首页
    {kind}/index.astro     列表页
    {kind}/[slug].astro    文章页
    {kind}/[slug].md.ts    文章的纯 Markdown 版本
    tags/                  标签聚合
    rss.xml.ts  llms.txt.ts  llms-full.txt.ts  404.astro
scripts/postbuild.mjs      生成 dist/index.html（回源域名根路径跳回主域名）
```

## 写一篇内容

在对应集合目录新建 `slug.mdx`，文件名即 URL：`src/content/tutorials/feishu.mdx` → `/blog/tutorials/feishu/`。

```mdx
---
title: "飞书群机器人接入 WPush：……"        # 6~60 字
description: "……"                          # 40~160 字符，搜索摘要
publishDate: 2026-09-10
updatedDate: 2026-09-12                    # 可选
tags: ["飞书", "渠道接入"]
draft: false                               # true 只在 dev 可见
channel: feishu                            # tutorials 专有，取值见 content.config.ts
difficulty: 入门                           # tutorials 专有
order: 20                                  # tutorials 专有，列表排序
# scene / audience / faq                   # solutions 专有
# author                                   # posts 专有
---

import Callout from "@/components/Callout.astro";

正文……
```

规则：

- API 参数与行为以主仓库 `wpush-go/web/src/docs` 为准。
- 站内链接写 `/blog/...`，主站链接写完整 `https://wpush.cn/...`。
- 每篇自动获得：canonical、Open Graph、Article/TechArticle JSON-LD、面包屑、`.md` 版本、进 sitemap / RSS / llms.txt。

## 部署

### 形态

```
浏览器 ── wpush.cn/blog/* ──► EdgeOne（wpush.cn 站点）
                                 ├─ 规则：路径前缀 /blog/ → 修改源站 → blog.wpush.cn（EdgeOne Pages）
                                 └─ 其余流量 → 原源站（APISIX → Go）
```

`blog.wpush.cn` 只是回源域名。所有 canonical / sitemap / RSS 里的地址都是 `wpush.cn/blog/...`，搜索引擎会把权重归到主域名。

### EdgeOne Pages

- 构建命令 `pnpm build`，输出目录 `dist`
- 产物结构：`dist/blog/**`（站点本体）+ `dist/index.html`（根路径跳转页）
- 绑定自定义域名 `blog.wpush.cn`

### wpush.cn 站点的规则引擎

1. **修改源站**：匹配「URL Path 前缀等于 `/blog/`」或「URL Path 等于 `/blog`」→ 源站改为 `blog.wpush.cn`，回源 Host 跟随源站域名（`blog.wpush.cn`），回源协议 HTTPS。
2. **缓存**：同一匹配条件下遵循源站 Cache-Control 即可；HTML 建议边缘缓存 10 分钟以内，`/blog/_astro/*` 为内容哈希文件可长缓存。
3. **`/blog` 无斜杠**：Pages 一般会 301 到 `/blog/`；如未生效，在规则里加一条 URL 重定向 `/blog` → `/blog/`。

### 不要做的事

- **不要给 `blog.wpush.cn` 配全站 301 跳到 `wpush.cn/blog`**。它是回源域名，回源拿到 301 会原样透给浏览器，形成跳转环。需要抑制回源域名被索引的话，在 `blog.wpush.cn` 上加响应头 `X-Robots-Tag: noindex`；canonical 已经指向主域名，权重不会分散。
- 不要在 Go 或 APISIX 里再做 `/blog` 转发，链路只在 EdgeOne 一处。

### 主站配合

主站 `robots.txt` 追加：

```
Sitemap: https://wpush.cn/blog/sitemap-index.xml
```

（已在 wpush-go 仓库 `web/public/robots.txt` 中加入。）

## 双向同步（GitHub ⇄ CNB）

仓库同时托管在 GitHub `WPUSH/wpush-blog` 与 CNB `wpush/wpush-blog`，任一侧 push 都会同步到另一侧。

```
GitHub push ──► .github/workflows/sync-to-cnb.yml ──► scripts/mirror-push.sh ──► CNB
CNB push    ──► .cnb.yml sync-to-github            ──► scripts/mirror-push.sh ──► GitHub
```

两侧跑的是同一个脚本 `scripts/mirror-push.sh`：把源仓库全部分支与标签 **fast-forward** 推到目标。

- **不会循环**：A 推到 B 后，B 的 push 事件会再推回 A，但此时 A 已是同一提交，git 输出 `Everything up-to-date`，不产生新事件。
- **不 force、不删引用**：两侧分叉时推送被拒、流水线失败并经 WPush 报警；目标侧多出来的分支不会被删。
- **每日兜底**：CNB 04:17、GitHub 04:23 各跑一次，webhook 漏发也能追平。
- CNB 官方的 `tencentcom/git-sync` 插件只做单向，且不支持 SSH，因此这里直接用 git over HTTPS，凭据走 `http.extraHeader` 不拼进 URL，避免报错时泄露到日志。

### 首次接入

1. **建仓库**（两侧都建空仓库，不要初始化 README）：

   ```bash
   gh repo create WPUSH/wpush-blog --public --description "WPush 接入教程、解决方案与文章" && cnb repositories create-repo --slug wpush --name wpush-blog --visibility public --description "WPush 接入教程、解决方案与文章"
   ```

2. **GitHub 侧令牌**：GitHub → Settings → Developer settings → Fine-grained tokens，仓库只选 `WPUSH/wpush-blog`，权限 `Contents: Read and write`。存入 CNB 密钥仓库 `anhao/secrets` 的 `wpush-blog.yml`：

   ```yaml
   GITHUB_SYNC_TOKEN: github_pat_xxx
   WPUSH_API_KEY: WPUSH_xxx
   allow_slugs:
     - wpush/wpush-blog
   allow_events:
     - push
     - tag_push
     - crontab
   ```

3. **CNB 侧令牌**：cnb.cool → 个人设置 → 访问令牌，勾选代码仓库读写。写入 GitHub 仓库 Secrets：

   ```bash
   gh secret set CNB_SYNC_TOKEN -R WPUSH/wpush-blog && gh secret set WPUSH_API_KEY -R WPUSH/wpush-blog
   ```

4. **首推**（先推 GitHub，Actions 会自动把它同步到 CNB；也可两边都推）：

   ```bash
   git commit -m "feat: Astro 内容站骨架、双向同步流水线" && git remote add origin https://github.com/WPUSH/wpush-blog.git && git remote add cnb https://cnb.cool/wpush/wpush-blog && git push -u origin main
   ```

5. **核对**：GitHub Actions 里 `sync-to-cnb` 绿色；CNB 仓库出现 `main`；随后 CNB 上的 `sync-to-github` 流水线应输出 `Everything up-to-date`。

### 分叉了怎么办

两侧都有独立提交时，双向推送都会失败并收到 WPush 通知。本地拉齐再推一侧即可：

```bash
git fetch origin && git fetch cnb && git merge cnb/main && git push origin main
```

推到 GitHub 后 Actions 会把合并结果同步到 CNB。日常尽量只在一侧写，另一侧当镜像。

### 部署源

EdgeOne Pages 接哪一侧都可以。接 CNB 走国内网络更快，接 GitHub 则生态更熟；两侧内容一致，切换只是换一次授权。

## 验收清单

上线后逐项 curl 检查：

```bash
curl -sI https://wpush.cn/blog/ | grep -iE 'HTTP|eo-cache|content-type'
curl -s  https://wpush.cn/blog/ | grep -o '<link rel="canonical"[^>]*>'
curl -s  https://wpush.cn/blog/sitemap-index.xml | head
curl -s  https://wpush.cn/blog/llms.txt | head -20
curl -sI https://wpush.cn/blog/tutorials/dingtalk.md | grep -i content-type
curl -sI https://wpush.cn/blog | grep -i location      # 应 301 到 /blog/
```
