# 上线说明

这个版本已经带了 Node 后端，客人提交的订单会保存到服务器的 `data/orders.json`，厨师后台读取的是同一份订单。

## 本地运行

```bash
npm start
```

打开：

```text
http://127.0.0.1:8000
```

## Render 上线

1. 把这个文件夹上传到 GitHub 仓库。
2. 在 Render 新建 Web Service，连接这个仓库。
3. Build Command 留空或填 `npm install`。
4. Start Command 填 `npm start`。
5. Environment Variables 里加一项：`RESTAURANT_PASSWORD=685173717`。
6. 部署完成后，Render 会给你一个公网网址，别人就可以用那个网址点餐。

提示：免费云平台的文件存储可能会在重启后丢失订单。正式使用建议换成数据库，例如 SQLite 持久磁盘、Postgres、Supabase 或 Firebase。
