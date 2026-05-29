# Vercel 上线说明

这个项目已经支持 Vercel。Vercel 负责网站和 `/api/orders` 接口，Supabase 负责保存订单。

## 1. 创建 Supabase 数据库

1. 打开 https://supabase.com 并登录。
2. 新建一个 Project。
3. 进入 `SQL Editor`。
4. 把项目里的 `supabase-schema.sql` 全部复制进去运行。
5. 在 `Project Settings` -> `API` 找到：
   - `Project URL`
   - `service_role` key

`service_role` key 只能放在 Vercel 环境变量里，不要发给别人。

## 2. 部署到 Vercel

1. 打开 https://vercel.com 并登录。
2. 选择 `Add New...` -> `Project`。
3. 导入你的 GitHub 仓库。
4. 如果你的代码在仓库里的 `伯特` 文件夹，`Root Directory` 填 `伯特`。
5. Framework Preset 选择 `Other`。
6. Build Command 留空。
7. Output Directory 留空。
8. 添加 Environment Variables：

```text
RESTAURANT_PASSWORD=685173717
SUPABASE_URL=你的 Supabase Project URL
SUPABASE_SERVICE_ROLE_KEY=你的 Supabase service_role key
```

9. 点击 `Deploy`。

部署完成后，Vercel 会给你一个公网网址，别人打开后输入密码就能点餐，厨师后台能看到同一个 Supabase 数据库里的订单。

项目的网页文件在 `public/` 文件夹，Vercel 会自动把它们当成静态网页；`api/` 文件夹才是后端接口。

## 本地运行

本地运行仍然可以用文件保存订单：

```bash
npm start
```

然后打开：

```text
http://127.0.0.1:8000
```
