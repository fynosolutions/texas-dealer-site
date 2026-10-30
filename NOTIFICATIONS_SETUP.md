# 邮箱 + 手机短信双通道配置

已实现 Resend 邮件和 Twilio SMS 并行通知。邮件发完整表单；短信发姓名、公司、客户联系方式及截短留言。目的地只取服务端配置，客户填写的 phone 不会收到短信。仅服务商接受请求不等于实际送达；最终验收需在邮箱和手机分别确认。

目前短信开关保持关闭，等待账号凭据及发信号码就绪。短信收件号码已按用户提供的美国号码配置为服务端 SMS_TO，不写入公开页面。

2026-10-31：21 项本地接口测试及 Cloudflare 编译通过，版本 https://e81d2550.texas-dealer-site.pages.dev 发布成功。更新后公网复查出现连接超时，实际邮件及短信送达仍待配置凭据后验收。

## 1. 邮件

1. 用 `wzihui446@gmail.com` 注册或登录 https://resend.com ，创建 Sending access API Key。
2. Cloudflare → Workers & Pages → texas-dealer-site → Settings → Variables and Secrets → Production → Add。
3. 名称 `RESEND_API_KEY`，值为刚创建的 Key，类型选择 Secret / Encrypt，保存。
4. 当前 MAIL_FROM 为 `Website Inquiry <onboarding@resend.dev>`，仅适合向 Resend 账号邮箱测试发信。正式发送需要在 Resend 验证自有域名，并更新 wrangler.jsonc 中的 MAIL_FROM。

Cloudflare 登录邮箱不必与 Gmail 相同；Resend 测试收件限制指的是 Resend 账号邮箱。

## 2. 美国手机短信

1. 注册或登录 https://www.twilio.com/console 。选择支持 SMS 的 Twilio 发信号码或 Messaging Service。
2. 按 Twilio 流程完成发送号码的验证/注册：美国本地长号码通常使用 A2P 10DLC；Toll-Free 号码需完成对应验证。收件人的普通手机号不能直接当作 Twilio 的发信号码。
3. 如使用试用账号，将你的收件手机号添加为已验证收件人；同时满足发送号码的要求。正式服务按 Twilio 实际方案计费，本次未购买号码或开通付费套餐。
4. 在相同 Cloudflare Production 设置中添加下表的 Secret。密钥不需要发送到聊天中。

| 名称 | 填写内容 |
| --- | --- |
| TWILIO_ACCOUNT_SID | Twilio Console 显示的 Account SID，AC 开头 |
| TWILIO_AUTH_TOKEN | Twilio 的 Auth Token |
| SMS_FROM | 已可发送短信的 Twilio 号码，使用 +1… 格式 |
| SMS_TO | 你指定的接收号码，已经由本次配置保存 |

如果使用 Messaging Service，可填写 `TWILIO_MESSAGING_SERVICE_SID`（MG 开头）替代 SMS_FROM；服务必须配置可用的发送号码。

## 3. 启用与验收

密钥配置完、发送号码状态正常后，将 wrangler.jsonc 的 `SMS_ENABLED` 改为 `true` 并重新部署。`SMS_PROVIDER=twilio` 已配置。普通变量由 wrangler.jsonc 管理；密钥和短信号码用 Cloudflare Secrets，部署时会保留。

启用短信后如必要配置缺失，接口会拒绝整个提交，避免静默漏掉一个通道。因此先完成配置再启用；只测试邮件时保持 false。

在 https://texas-dealer-site.pages.dev/contact/ 提交一条 TEST 询盘：

- 邮箱收到五项完整字段，回复指向客户邮箱。
- 指定手机收到摘要；不是发送给客户填写的手机号。
- 双通道均被服务接受才返回 accepted；单通道失败返回 partial，保留表单且不自动重试，防止重复发信。
- 若手机未收到，查看 Twilio Messaging Logs 的送达状态；如果邮件未收到，查看 Resend Logs 及 Gmail 垃圾邮件。

当前没有投递状态回调、持久化队列或跨实例去重；不能保证邮箱和短信最终同时送达。短信内容可能分段计费。

官方参考：[Cloudflare Secrets](https://developers.cloudflare.com/pages/functions/bindings/#secrets)、[Resend API Keys](https://resend.com/docs/dashboard/api-keys/introduction)、[Twilio Messages](https://www.twilio.com/docs/messaging/api/message-resource)、[Twilio Trial](https://www.twilio.com/docs/usage/trials)、[Toll-Free 验证](https://www.twilio.com/docs/messaging/compliance/toll-free/console-onboarding)。
