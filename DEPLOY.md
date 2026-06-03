# Kineroz — 部署清单

## 1. 推送代码

```bash
git push origin main
```

## 2. Vercel（推荐）

1. 打开 [vercel.com/new](https://vercel.com/new)，导入 GitHub 仓库 `Jm324-hi/scifit`
2. Framework Preset：**Next.js**（默认即可）
3. **Environment Variables**（Production + Preview 都填）：

| 变量 | 说明 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → anon public key |
| `NEXT_PUBLIC_SITE_URL` | 部署后的正式域名，如 `https://kineroz.vercel.app` 或自定义域 |
| `OPENAI_API_KEY` | 若使用 AI 计划功能则必填 |

**不要在 Vercel 上设置** `DEV_BYPASS_AUTH` / `NEXT_PUBLIC_DEV_BYPASS_AUTH` / `DEV_EMAIL` / `DEV_PASSWORD`（仅本地 `.env.local`）。

4. Deploy → 等待构建完成

## 3. Supabase Auth 回调

部署拿到域名后，在 Supabase → **Authentication → URL Configuration**：

- **Site URL**：`https://你的域名`
- **Redirect URLs** 添加：
  - `https://你的域名/auth/callback`
  - `http://localhost:3000/auth/callback`（本地调试保留）

## 4. 部署后自测

- [ ] `/` 首页、`/science`、`/rehab` 可公开访问
- [ ] `/register` 注册、`/login` 登录
- [ ] 登录后 `/dashboard`、`/plan`、`/workout` 正常
- [ ] 邮件确认（若 Supabase 开启 email confirm）能完成验证

## 5. 本地开发（与线上分离）

复制 `env.local.example` → `.env.local`，仅本地开启免登录：

```env
DEV_BYPASS_AUTH=true
NEXT_PUBLIC_DEV_BYPASS_AUTH=true
```

线上访客仍需正常注册/登录。
