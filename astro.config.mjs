// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// 站点部署形态（详见 README「部署」）：
//   - 静态产物托管在 EdgeOne Pages，绑定 blog.wpush.cn 仅作回源域名；
//   - wpush.cn 站点的 EdgeOne 规则引擎按 /blog/ 前缀「修改源站」到 blog.wpush.cn；
//   - 因此 site 是主域名、base 是 /blog：canonical / sitemap / RSS 里的绝对地址全部落在 wpush.cn/blog 下。
const seen = new Set();

export default defineConfig({
  site: "https://wpush.cn",
  base: "/blog",
  // 页面 URL 一律带尾斜杠：由 build.format = directory（产物 x/index.html）与 src/lib/url.ts 的 href() 保证。
  // 不能用 "always"：Astro 5 会把它套到动态 endpoint 上，[slug].md.ts 会被产成 /posts/hello.md/ 而非 /posts/hello.md。
  trailingSlash: "ignore",
  // 产物直接放进 dist/blog/，回源路径与访问路径一致，EdgeOne 无需改写 URL
  outDir: "./dist/blog",
  build: { format: "directory" },
  integrations: [
    mdx(),
    react(),
    sitemap({
      filter: (page) => !/\/404\/?$/.test(page),
      // 页面地址统一带尾斜杠并去重（ignore 模式下首页会同时出现 /blog 与 /blog/）
      serialize(item) {
        const url = /\.[a-z0-9]+$/i.test(item.url) || item.url.endsWith("/") ? item.url : `${item.url}/`;
        if (seen.has(url)) return undefined;
        seen.add(url);
        return { ...item, url };
      },
      changefreq: "weekly",
    }),
  ],
  vite: { plugins: [tailwindcss()] },
  markdown: {
    shikiConfig: { theme: "github-light", wrap: false },
  },
});
