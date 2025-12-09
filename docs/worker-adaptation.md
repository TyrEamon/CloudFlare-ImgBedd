# Cloudflare Worker + Leaflow 容器（Telegram 存储）极速部署

> 目标：不再依赖 KV/D1，只用 **Leaflow 容器镜像 + Telegram** 承载读写，Worker 继续做网关和缓存。按下列步骤依次填好变量即可直接上线。

## 1. 容器端：拉起 Leaflow（负责存储）
1. 准备好支持以下接口的 Leaflow 镜像（示例端口 `9000`）：
   - `PUT /kv/:key`，Body: `{ value, metadata? }`
   - `GET /kv/:key`，返回 `{ value, metadata? }`
   - `DELETE /kv/:key`
   - `GET /kv?prefix=&cursor=&limit=`，返回 `{ keys: [{ name, metadata }], cursor, list_complete }`
   - 这些接口内部要把文件/索引写到 **Telegram 频道/群**。

2. 启动容器（示例命令，按需替换镜像名和端口）：

   ```bash
   docker run -d --name leaflow \
     -p 9000:9000 \
     -e TG_BOT_TOKEN="<你的Telegram机器人Token>" \
     -e TG_CHAT_ID="<你的频道或群ID>" \
     -e LEAFLOW_TOKEN="<自定义Bearer Token，可选>" \
     <your-leaflow-image>
   ```

3. 快速自检（确认容器正常写入 Telegram）：

   ```bash
   curl -X PUT "http://<leaflow-host>:9000/kv/health" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <LEAFLOW_TOKEN>" \
     -d '{"value":"ok"}'

   curl "http://<leaflow-host>:9000/kv/health" \
     -H "Authorization: Bearer <LEAFLOW_TOKEN>"
   ```

## 2. Worker 端：配置并发布
1. 在 `wrangler.toml`（或 Cloudflare Pages/Workers 环境变量）设置：

   ```toml
   [vars]
   LEAFLOW_API = "https://<leaflow-host>:9000"  # 容器 HTTP 入口
   LEAFLOW_TOKEN = "<与容器一致的Bearer Token，可留空>"
   TG_BOT_TOKEN = "<同容器，读写 Telegram 用>"
   TG_CHAT_ID = "<同容器，Telegram 频道/群 ID>"
   ```

   > 说明：只要 `LEAFLOW_API` 存在，Worker 会自动把所有 KV/D1 调用切到 Leaflow，零业务改动；保留 `TG_*` 是为了 Worker 在读取直链或分片文件时能直接访问 Telegram。

2. 发布：

   ```bash
   wrangler deploy
   ```

3. 验证：
   - 通过前端或 API 上传、删除、随机图，检查 Worker 日志确认请求已打到 Leaflow。
   - 访问生成的直链，确认能通过 CDN 命中缓存且能回源到 Telegram。

## 3. 常见问答
- **还需要 KV 吗？** 不需要。未配置 KV/D1 也会直接使用 Leaflow。
- **Leaflow 需要鉴权吗？** 建议开启，Worker 会自动附带 `Authorization: Bearer <LEAFLOW_TOKEN>`。
- **能否混用其他存储？** 当前指引针对 Telegram-only，如需扩展可在 Leaflow 内部新增存储后端，无需改 Worker。
