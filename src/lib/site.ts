/** 站点级常量。绝对地址一律基于主域名 + base 拼，不出现 blog.wpush.cn（它只是回源域名）。 */
export const SITE = {
  name: "WPush 博客",
  brand: "WPush",
  /** 主域名（与 astro.config 的 site 一致） */
  origin: "https://wpush.cn",
  description:
    "WPush 消息推送平台的接入教程、解决方案与实践文章：一次 API 调用送达微信公众号、短信、邮件、App、Webhook、钉钉、飞书、企业微信、微信 ClawBot、QQ 机器人 10 个渠道。",
  locale: "zh-CN",
  /** 主站关键入口（不在本站 base 下，写绝对地址） */
  links: {
    home: "https://wpush.cn/",
    docs: "https://wpush.cn/docs/",
    apiRef: "https://wpush.cn/docs/",
    login: "https://wpush.cn/login",
    channels: "https://wpush.cn/docs/channels/",
    channelSetup: "https://wpush.cn/docs/channel-setup/",
    github: "https://github.com/WPUSH",
  },
  icp: "赣ICP备2022000250号-1",
} as const;

/** 渠道展示名与品牌色（色值与主站 globals.css 的 --channel-* 一致） */
export const CHANNEL_META: Record<string, { label: string; color: string }> = {
  wechat: { label: "微信公众号", color: "#07c160" },
  sms: { label: "短信", color: "#3b82f6" },
  mail: { label: "邮件", color: "#f59e0b" },
  app: { label: "App 推送", color: "#8b5cf6" },
  webhook: { label: "Webhook", color: "#64748b" },
  dingtalk: { label: "钉钉机器人", color: "#3296fa" },
  feishu: { label: "飞书机器人", color: "#00d6b9" },
  wechat_work: { label: "企业微信", color: "#2f90ea" },
  clawbot: { label: "微信 ClawBot", color: "#1aad19" },
  qqbot: { label: "QQ 机器人", color: "#12b7f5" },
};
