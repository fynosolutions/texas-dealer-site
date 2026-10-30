# Cloudflare Pages 部署销售商网站

邮件与短信双通道已接入，配置步骤见 [NOTIFICATIONS_SETUP.md](NOTIFICATIONS_SETUP.md)。短信开关暂为 false，待凭据和发送号码准备完成后开启。

## 当前已部署（2026-10-31）

- 访问地址：https://texas-dealer-site.pages.dev
- 当前版本：https://e81d2550.texas-dealer-site.pages.dev （双通道接口更新）
- 项目名：texas-dealer-site，生产分支 main，使用 Wrangler Direct Upload。
- 已线上核验八个中英文页面、来源限制、字段校验及私有文件不可访问。
- 邮件 Secret 尚未配置：正常表单提交返回 503 / not_configured，不能真实发信。
- 当前发件地址为 Resend 测试地址；只能在 Resend 账号邮箱与测试收件邮箱一致时用于测试。正式使用需换为已验证域名的发件地址。
- 仍保留品牌占位与 noindex，当前为已发布的预览网站。

当前普通环境变量由 `wrangler.jsonc` 管理；以后修改收件人、正式发件地址、允许域名等应修改该文件再部署，避免本地配置覆盖后台修改。RESEND_API_KEY 仍只通过 Cloudflare Secrets 设置。

本项目已采用 Direct Upload；后续可从项目目录运行 `npm run build` 和 `npx wrangler pages deploy dist --project-name texas-dealer-site --branch main` 更新。如果以后要改成 Git 自动构建，需要新建 Git 集成项目。

部署结构：Astro 静态页面 → 同域 `/api/contact` Pages Function → Resend → 指定收件邮箱。

这份配置适用于 **Cloudflare Pages**。仅把域名 DNS 放在 Cloudflare 不等于 Pages 托管；如果现有网站实际使用 Workers 或其他主机，应按其部署方式调整。销售商使用独立项目，不覆盖工厂项目。

## 1. 新建 Pages 项目

推荐把 `dealer-site` 内的源码作为独立 Git 仓库，在 Cloudflare Workers & Pages 中创建 Pages 项目并连接该仓库。不要提交 `.env`、`.dev.vars` 或 API Key。

| 配置 | 值 |
| --- | --- |
| 项目名称 | `texas-dealer-site`（如改名，同时修改 wrangler.jsonc 的 name） |
| 根目录 | 独立仓库留空；若仓库包含 dealer-site 文件夹，则填 dealer-site |
| 构建命令 | `npm run build` |
| 输出目录 | `dist` |
| Node 版本 | `NODE_VERSION=22` |

无需启动命令，不运行 `npm start`。`functions/api/contact.js` 由 Pages 构建为云端接口；`wrangler.jsonc` 开启 nodejs_compat。`public/_routes.json` 限定只有 /api/* 调用函数。

必须连同项目根目录的 functions 文件夹构建部署。不要只在控制台拖拽上传 dist，这样不会部署本项目的 Functions。使用 Git 集成，或在项目目录执行 Wrangler Pages 部署。

## 2. 配置邮件服务和域名

在 Resend 验证销售商拥有的发信域名，例如 `mail.yourbrand.com`，将 Resend 要求的 DNS 记录添加到该域名的 Cloudflare DNS 中。复制 Resend 提供的记录，不修改工厂现有邮件记录。待验证成功，使用 `inquiry@mail.yourbrand.com` 作为发件地址。

收件邮箱可继续用 `wzihui446@gmail.com`。客户邮箱由接口写入 Reply-To；无需客户或你的 Gmail 密码。

## 3. 设置 Production 环境变量及密钥

Pages 项目 → Settings → Variables and Secrets。以下示例域名和品牌名需替换；不要保留尖括号中的占位内容作为真实配置。

以下为通用配置示例；对当前已部署项目，普通变量在 wrangler.jsonc 中修改，API Key 在上述页面添加为加密 Secret。

```dotenv
NODE_VERSION=22
CONTACT_MODE=live
MAIL_PROVIDER=resend
MAIL_TO=wzihui446@gmail.com
MAIL_FROM=Your Brand <inquiry@mail.yourbrand.com>
NOTIFICATION_BRAND=Your Brand
SMS_ENABLED=false
ALLOWED_ORIGINS=https://yourbrand.com,https://www.yourbrand.com
```

另建 **Secret（Encrypt）**：`RESEND_API_KEY`，值为 Resend 的发送权限 API Key。不要加 PUBLIC_ 前缀。修改设置后重新部署。

ALLOWED_ORIGINS 是完整来源网址，含 https，不带路径或末尾斜杠。正式绑定的所有入口均需列入；使用 pages.dev 临时域名验收时，加入其精确地址。不要允许任意 Origin。

Preview 环境单独设置 `CONTACT_MODE=mock`，设置需要测试的精确 ALLOWED_ORIGINS，并且不配置真实 API Key。生产与预览的设置不要混用。未设置 mode 默认 mock；缺少来源列表或 live 发信凭据则拒绝提交。

## 4. 绑定网站域名并验收

Pages → Custom domains → 添加销售商网站域名，完成界面要求的 DNS 设置。正式上线前补齐品牌资料和网站元信息，并移除 BaseLayout.astro 中用于预览的 noindex（当前仍保留，避免未完成的网站被收录）。

在 HTTPS 网站 Contact us 页面提交带 TEST 标记的询盘。检查 Gmail 收件箱及垃圾邮件，核对五项字段及 Reply-To。网页成功仅代表服务接受发送，实际收件才完成验收。

## 防滥用与限制

接口已有输入校验、隐藏诱捕字段、来源检查、32KB 请求限制和按 CF-Connecting-IP 的内存限流。同一 isolate 中已完成的重复请求复用结果；发送中的重复请求返回状态不确定，不跨请求等待另一次请求的网络操作。限流与去重不跨边缘实例或重启，不能保证全局只发一次。

公网发布前根据 Cloudflare 套餐配置 `/api/contact` 的边缘速率限制，必要时接入 Turnstile。当前没有实现跨实例存储或 Turnstile 校验，不应把 Origin 检查当作机器人防护。Pages 入口支持 Resend 邮件及可选的 Twilio 短信；SMS_ENABLED=true 时必须补齐短信配置。

## 本地验证

```powershell
npm test
npm run build
npm run check:cloudflare
npm run dev:cloudflare
```

`npm run dev:cloudflare` 使用 Wrangler。它可能加载本机 `.env` 中的 live 设置；只要填写真实密钥，提交就会发真实邮件。需要模拟时用被 Git 忽略的 `.dev.vars` 配置 CONTACT_MODE=mock 和本机准确的 ALLOWED_ORIGINS；存在 .dev.vars 时不会加载 .env。

参考：[Astro 部署](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/)、[Functions](https://developers.cloudflare.com/pages/functions/get-started/)、[Secrets](https://developers.cloudflare.com/pages/functions/bindings/#secrets)、[Resend 域名验证](https://resend.com/docs/dashboard/domains/introduction)。
