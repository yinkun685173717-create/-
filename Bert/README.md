# 印坤的小饭店

一个带密码登录、客人点餐、厨师查看订单的点餐网站。

## 目录

- `public/`：网页文件，Vercel 会作为静态网站发布。
- `api/`：Vercel 后端接口。
- `lib/`：订单逻辑。
- `supabase-schema.sql`：Supabase 建表 SQL。

## Vercel 环境变量

```text
RESTAURANT_PASSWORD=685173717
SUPABASE_URL=你的 Supabase Project URL
SUPABASE_SERVICE_ROLE_KEY=你的 Supabase service_role key
```

如果仓库里还有一层 `伯特/` 文件夹，Vercel 的 Root Directory 填 `伯特`。
