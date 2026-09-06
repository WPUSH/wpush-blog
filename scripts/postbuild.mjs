// 构建后处理：Astro 产物在 dist/blog/，这里补一个 dist/index.html。
// 只有有人直接打开回源域名根路径（blog.wpush.cn/）时才会命中，跳回主域名的博客入口。
// 注意：不要在这里或 EdgeOne 上给 blog.wpush.cn 配全站 301 —— 它是 wpush.cn/blog 的回源，
// 回源拿到 301 会原样透给浏览器，形成跳转环。见 README「部署」。
import { writeFile, access } from "node:fs/promises";
import { resolve } from "node:path";

const dist = resolve(import.meta.dirname, "..", "dist");
await access(resolve(dist, "blog", "index.html"));

const target = "https://wpush.cn/blog/";
await writeFile(
  resolve(dist, "index.html"),
  `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>WPush 博客</title>` +
    `<meta name="robots" content="noindex"><meta http-equiv="refresh" content="0; url=${target}">` +
    `<link rel="canonical" href="${target}"></head><body><a href="${target}">前往 WPush 博客</a></body></html>\n`,
);
console.log("postbuild: dist/index.html -> " + target);
