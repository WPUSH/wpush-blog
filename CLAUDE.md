# wpush-blog

WPush 内容站（接入教程 / 解决方案 / 文章），Astro 5 静态站，产物托管 EdgeOne Pages，经 EdgeOne 规则引擎映射为 `wpush.cn/blog`。本仓库公开：EdgeOne 规则、同步令牌与密钥仓库等运维细节只写在私有主仓库 `wpush-go/docs/18-blog-site.md`，不要写进这里的 README。

## 写内容时

- 三个集合目录 `src/content/{tutorials,solutions,posts}`，frontmatter 字段与校验规则在 `src/content.config.ts`，缺字段构建会失败。
- **API 用法以主仓库 `wpush-go/web/src/docs/*.mdx` 为准**，不要凭记忆写参数名、返回结构或渠道行为。渠道标识列表在 `src/content.config.ts` 的 `CHANNELS`。
- 站内链接写 `/blog/...` 绝对路径（MDX 里不经过 `href()`），主站链接写 `https://wpush.cn/...` 全地址。
- description 是搜索结果摘要，80~160 字符，说清「解决什么问题、怎么解决」。
- solutions 尽量填 `faq`，会同时输出 FAQPage 结构化数据。

## 仓库同步

GitHub `WPUSH/wpush-blog` 与 CNB `wpush/wpush-blog` 双向镜像，`scripts/mirror-push.sh` 被 `.cnb.yml` 与 `.github/workflows/sync-to-cnb.yml` 共用。不要给它加 `--force`/`--mirror`，不要把令牌拼进 URL；凭据与接入步骤见主仓库 `docs/18-blog-site.md`。

## 写代码时

- 所有站内 `<a href>` 走 `href()`（`src/lib/url.ts`），绝对地址走 `absolute()`；不要手拼 `/blog`。
- 不出现 `blog.wpush.cn`，它只是回源域名。
- 新增页面类型要同步：sitemap 过滤、`llms.txt`、RSS。
