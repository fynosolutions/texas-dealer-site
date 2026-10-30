# Contact us 邮件测试

已实现：客户填表 → `/api/contact` → Resend 邮件服务 → 服务端 `MAIL_TO` 指定的邮箱。客户无需登录邮箱；客户填写的 Email 用作 Reply-To，收到询盘后点“回复”即可联系客户。

本机收件人已设置为 `wzihui446@gmail.com`，短信已关闭。还未配置 API Key，当前提交会明确显示暂时不可用，不会声称已发送。

## 配置一次即可

1. 用 `wzihui446@gmail.com` 注册或登录 [Resend](https://resend.com)。测试发件地址 `onboarding@resend.dev` 只能发送到 Resend 账号对应的邮箱，因此账号邮箱必须与这个收件地址一致。
2. 在 [API Keys](https://resend.com/api-keys) 创建具备 Sending access 权限的 Key。
3. 在本机项目 `.env` 中填写 `RESEND_API_KEY=` 后面的值。不要放入网页代码、截图、聊天或公开仓库；不需要 Gmail 密码。

```dotenv
CONTACT_MODE=live
MAIL_PROVIDER=resend
RESEND_API_KEY=在本机填写真实Key
MAIL_TO=wzihui446@gmail.com
MAIL_FROM=Website Inquiry <onboarding@resend.dev>
NOTIFICATION_BRAND=Website inquiry test
SMS_ENABLED=false
```

4. 停止旧预览服务，运行 `npm run build` 和 `npm start`。修改 `.env` 后必须重启服务。
5. 打开 `http://localhost:4321/contact/`，填写测试姓名、联系邮箱、公司、电话和带 TEST 标记的留言，点击 Send Request。
6. 检查 Gmail 收件箱及垃圾邮件，确认五项内容完整，点回复检查目标是否为表单中的邮箱。网页成功仅表示邮件服务接受发送；实际收到邮件才算收件验收完成。

若 403，检查测试收件地址是否就是 Resend 账号邮箱，或者是否已经验证正式发信域名。API Key 错误、额度不足等拒绝会显示失败；超时保留内容并提示状态不确定，不自动重试。

## 上线

已选择 Cloudflare：使用 Pages + Pages Functions，按 [CLOUDFLARE_SETUP.md](CLOUDFLARE_SETUP.md) 配置。线上无需常驻 Node 服务器；下面的“托管平台函数”即本项目已添加的 Pages Function。

在 Resend 验证自有域名并配置其要求的 DNS 记录，把 MAIL_FROM 换成该域名的发件地址。MAIL_TO 可继续使用 Gmail。正式部署需运行 Node 后端或迁移为托管平台函数，单独上传 dist 静态文件不能发送邮件；配置正式站点 ALLOWED_ORIGINS 和服务端密钥。

## 验证与限制

`npm test` 覆盖邮件字段、固定收件人、Reply-To、仅邮件发送、缺配置拒绝、重复提交、供应商拒绝、超时，以及本地 HTTP 接口。测试不发送外部邮件。浏览器回归拦截发信请求，不受本机 live 配置影响。

当前去重与限流使用进程内存，不跨重启或多实例；不自动重试状态不确定的邮件。本机不持久化询盘，邮件服务和收件邮箱会处理邮件内容。

官方参考：[发送 API](https://resend.com/docs/api-reference/emails/send-email)、[测试域名收件限制](https://resend.com/docs/knowledge-base/403-error-resend-dev-domain)。
