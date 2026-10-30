# 德州餐饮销售商网站 · 本地预览

源码仓库：`fynosolutions/texas-dealer-site`（私有）。线上地址：https://texas-dealer-site.pages.dev 。Cloudflare 当前采用 Wrangler Direct Upload；推送 GitHub 不会自动触发网站部署。依赖、构建产物、原始参考截图和本机密钥不进入仓库，保留目录核验所需的 reference/catalog-specs.json。

双通道询盘通知：已支持 Resend 邮件 + Twilio 短信，见 [NOTIFICATIONS_SETUP.md](NOTIFICATIONS_SETUP.md)。等待服务账号凭据，短信仍关闭。

Cloudflare Pages 部署：参见 [CLOUDFLARE_SETUP.md](CLOUDFLARE_SETUP.md)。已提供 `functions/api/contact.js` 云端入口，线上无需运行本机 Node 预览服务。邮件配置与真实收件验收仍需在平台完成。

2026-10-31 已发布预览：https://texas-dealer-site.pages.dev 。八个中英文页面及云端接口已验收；缺少 RESEND_API_KEY，真实邮件发送尚未启用。保留 noindex 和品牌占位，下面的“未部署”说明属于此前本地预览阶段记录。

基于用户提供的原工厂仓库 `fynosolutions/weiming_website`，参考提交 `3a7ba323af19a3d4a87f6dfb205f3b7f554b0fa9`。直接复用 Astro、Tailwind、Header、Footer、HomeV2、CatalogSpec、ProductsPage、WholesalePage 和 ContactPage 的原有组件结构与样式，独立修改销售商内容。原工厂仓库位于相邻的 `factory-reference`，没有修改或推送。

## 运行

需要 Node.js 22+。当前电脑已安装依赖并构建完成。

```powershell
cd C:\Users\WZ\Desktop\YAYA\dealer-site
npm ci
npm run build
npm start
```

浏览器打开 `http://localhost:4321/` 或 `http://localhost:4321/zh-Hant/`。`npm start` 提供构建后的八个静态页面和本地通知接口，仅监听 127.0.0.1。修改源文件后重新运行 `npm run build`，刷新网页即可。

双击 `start-preview.cmd` 也可启动已构建的预览。若端口已占用，直接访问已运行的预览即可。

`dist` 是静态页面产物，但**不能仅通过双击 HTML 使用绝对路由或表单**。必须通过本地服务预览。纯静态托管还需单独部署通知接口。

## 已确认范围

- 原有四页：首页、产品、批发与配送、联系与报价，英文／繁体中文，共八条路由。
- 复用胶囊导航、原配色、留白、标题、卡片及淡入动画；产品前置，工厂背景后置。
- 产品目录按用户后续提供的 PDF 第 3、4 页更新为 13 类、42 条产品。规格和箱含量为英文，不包含整箱价或单价；详见 CATALOG_UPDATE.md。
- 产品目录恢复原站内容宽度，桌面为两列自然错落卡片；名称只显示当前语言，紧凑英文规格同行右对齐。手机为单列，长规格允许换行，不横向滚动。
- 面向德州餐饮店；具体配送范围、起订量及安排咨询销售。不承诺全州配送或固定配送日。
- 原有索样入口改为批发报价。新增品类快捷跳转及规格单位说明；没有添加目录小图、产品搜索、商品详情、单品询价入口、FAQ、购物车、支付、会员、数据库或后台。
- 原工厂使命、品牌矩阵、人物介绍和视频墙删减；合作供应背景沿用原来的图文模块。首页与批发页共用六步合作流程，复用原海报的插画区域，步骤使用真实文本；手机纵向分行，试样明确为可选环节。
- 保留原有五项可见表单字段：姓名、公司、邮箱、电话、留言。
- 按本次逐项确认，批发页移除 30%+、同行比较及独家宣传，改为产品规格、口味与用途；保留用户提供的蒸笼小笼包图片。

## 内容维护与待补项

| 内容 | 文件 | 当前状态 |
| --- | --- | --- |
| 品牌名称、联系方式、正式域名 | `src/data/site.ts` | 明确占位，空联系方式不会生成假 tel/mailto 链接 |
| 英文／繁体文案 | `src/i18n/ui.ts` | 销售商文案已替换 |
| 产品与包装规格 | `src/components/CatalogSpec.astro` | 13 类、42 条，与 PDF 第 3、4 页逐行核对 |
| Logo / favicon | `public/assets/brand-placeholder.svg` | 明确的 LOGO 占位 |
| 配送配图 | `public/assets/texas-delivery.png` | 用户提供，已用于批发页 03 |
| 通知目的地与发件配置 | `.env.example` | Resend 已接入；本机 API Key 待补，示例默认 mock |

电话、邮箱、品牌中英文名和 Logo 仍待补。传真栏与空地图框已删除，公开地址确认后再展示。视频未进入公开目录：原视频尚未逐帧及音轨审查，当前采用已检查的原站食品照片。原首屏工厂视频改为成品照片，移动端裁切已检查。

当前预览带 `noindex,nofollow`，没有正式域名 canonical 或虚构公司结构化数据。上线前需要补齐真实品牌、联系方式和通知配置，确认配送政策及素材，再移除预览标记并设置正式域名。未部署任何正式站点。

## 通知服务边界

已接入 Resend 邮件 API，支持客户填表后发往服务端固定的 `MAIL_TO`，客户邮箱用作 Reply-To。短信默认关闭，只有 `SMS_ENABLED=true` 时才要求短信配置。

本机 `.env` 已选择 live 模式并设置测试收件邮箱；API Key 尚待配置，缺配置返回 503，前端保留填写内容。完整配置和真实收件验收步骤见 [EMAIL_SETUP.md](EMAIL_SETUP.md)。`.env.example` 默认 mock，模拟模式不会调用邮件或短信服务。

`MAIL_PROVIDER=resend` 使用真实 Resend API；`MAIL_PROVIDER=adapter` 保留自建 HTTP 适配器契约（不是任意供应商 URL）。自建适配器接收 Bearer 认证 JSON，邮件 `{to,from,replyTo,subject,text}`，短信 `{to,from,text}`，返回 `{status: "accepted" | "failed" | "unknown"}`。

accepted 仅表示邮件服务接受，不保证到达收件箱。失败或超时不会自动重发；短期内存去重与限流不跨进程重启或多实例。本机不持久化询盘，邮件服务及收件邮箱会处理邮件内容。

## 检查

```powershell
npm test
python -m pip install -r requirements.txt
npm run check
# 浏览器检查会自动启动独立 mock 服务，默认使用本机 Edge
npm run test:browser
```

`npm test` 检查 mock 不发送、验证拒绝、缺配置关闭、固定收件目标、并发去重、部分失败及超时。

`npm run check` 检查八条路由、资源与链接、原厂品牌残留、每页一个表单、产品包装及箱含量与 PDF 一致、目录无价格。

`tests/browser.mjs` 使用 1440 / 390 / 320px 检查八页、菜单、语言对应路由、导航遮挡、横向溢出、模拟表单、失败保留内容和禁用 JavaScript 的可读性。结果和截图在 `artifacts`。

保留原站 Astro 4 / Tailwind 3 的兼容依赖。此次 npm audit 报告 6 个问题（1 critical、4 high、1 moderate），主要涉及旧构建依赖链。当前对外提供的是 Node 静态预览服务，不启动 Astro 开发服务器或 SSR。正式部署前应安排依赖升级与回归；本次没有未经请求迁移整套框架。

## 文件边界

`public` / `dist` 只包含销售商可见资源。`reference` 和相邻工厂仓库是内部参考，不可一并作为静态站点根目录发布。`scripts/adapt_source.py` 是此次一次性迁移记录，不要在后续手动编辑后重复执行。

## 顾客信息梳理更新（2026-10-30）

按 grilling 逐项讨论及最终确认实施：

- 首页按「批发定位与入口 → 主推产品 → 采购配送须知 → 供应背景 → 六步流程 → 原有联系表单」排列；主推产品链接到目录对应品类。
- 首页及批发页共用 `PurchasingTerms.astro` 与 `Journey.astro`，统一配送范围、起订、报价及可选试样说明。
- 顾客提供城市、ZIP Code、产品及预计箱数；销售确认配送范围及起订要求，报价时确认配送费与预计到货时间。试样费用安排前告知并取得确认。
- 合作流程复用原海报的六个插画区域（CSS 裁切展示，不展示旧海报文字），中英文步骤均为可读文本；不再承诺免费试样或每周配送。
- 产品目录保持 13 类、42 条及原有英文规格；桌面品类链接、手机选择框，锚点留出固定导航空间。无目录配图、单品询价入口。
- `ContactPage.astro` 与 `Footer.astro` 的表单区块、全部 contact 翻译和产品数据已与修改前逐项核对，保持原样。
- 仅本地预览，保留 noindex 和 mock 提示；未部署、未接通真实询盘。（历史状态；最新邮件实现见上文。）
- 修改前源码快照：`artifacts/before-customer-review.zip`。

## 邮件接入更新（2026-10-31）

Contact us 与页脚表单已接入 Resend 邮件发送，短信默认关闭。更新了中英文反馈，错误响应不会清空表单。真实收件测试仍等待本机配置 RESEND_API_KEY。
