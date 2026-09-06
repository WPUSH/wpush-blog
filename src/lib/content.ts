import { getCollection, type CollectionEntry, type CollectionKey } from "astro:content";

export type Kind = CollectionKey; // "tutorials" | "solutions" | "posts"
export type Entry = CollectionEntry<Kind>;

export const KINDS: Record<
  Kind,
  { label: string; description: string; articleType: "TechArticle" | "Article" | "BlogPosting" }
> = {
  tutorials: {
    label: "接入教程",
    description: "每个渠道从绑定到收到第一条消息的完整步骤，附可直接运行的请求示例。",
    articleType: "TechArticle",
  },
  solutions: {
    label: "解决方案",
    description: "按场景组织的推送方案：服务器告警、定时任务、AI Agent 通知、用户触达……",
    articleType: "Article",
  },
  posts: {
    label: "文章",
    description: "产品更新、实践心得，以及关于消息推送这件事的思考。",
    articleType: "BlogPosting",
  },
};

export const KIND_ORDER: Kind[] = ["tutorials", "solutions", "posts"];

/** 有效日期：优先 updatedDate */
export function effectiveDate(e: Entry): Date {
  return e.data.updatedDate ?? e.data.publishDate;
}

function byDateDesc(a: Entry, b: Entry): number {
  return b.data.publishDate.getTime() - a.data.publishDate.getTime();
}

/** 已发布条目（dev 下草稿也显示，方便预览）。教程带 order 的按 order 升序，其余按日期倒序。 */
export async function getPublished<K extends Kind>(kind: K): Promise<CollectionEntry<K>[]> {
  const all = await getCollection(kind, (e) => import.meta.env.DEV || !e.data.draft);
  return all.sort((a, b) => {
    const ao = "order" in a.data ? a.data.order : undefined;
    const bo = "order" in b.data ? b.data.order : undefined;
    if (ao != null && bo != null && ao !== bo) return ao - bo;
    if (ao != null && bo == null) return -1;
    if (ao == null && bo != null) return 1;
    return byDateDesc(a, b);
  });
}

export async function getAllPublished(): Promise<Entry[]> {
  const lists = await Promise.all(KIND_ORDER.map((k) => getPublished(k)));
  return (lists.flat() as Entry[]).sort(byDateDesc);
}

/** 条目站内路径（不含 base），如 /tutorials/dingtalk/ */
export function entryPath(e: Entry): string {
  return `/${e.collection}/${e.id}/`;
}

/** 条目的纯 Markdown 版本路径，如 /tutorials/dingtalk.md */
export function entryMarkdownPath(e: Entry): string {
  return `/${e.collection}/${e.id}.md`;
}

/** 标签索引：tag -> 条目列表（按日期倒序） */
export async function getTagIndex(): Promise<Map<string, Entry[]>> {
  const all = await getAllPublished();
  const map = new Map<string, Entry[]>();
  for (const e of all) {
    for (const t of e.data.tags) {
      const list = map.get(t) ?? [];
      list.push(e);
      map.set(t, list);
    }
  }
  return new Map([...map.entries()].sort((a, b) => b[1].length - a[1].length));
}

/** 同类文章推荐：同 collection、共享标签数多者优先，排除自身 */
export async function getRelated(e: Entry, limit = 3): Promise<Entry[]> {
  const same = (await getPublished(e.collection)) as Entry[];
  const tags = new Set(e.data.tags);
  return same
    .filter((x) => x.id !== e.id)
    .map((x) => ({ x, score: x.data.tags.filter((t) => tags.has(t)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ x }) => x);
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
}
