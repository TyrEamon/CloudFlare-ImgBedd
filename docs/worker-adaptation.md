# Cloudflare Worker 改造指引（Leaflow 容器 + Telegram 存储）

> 适用场景：仅使用 Telegram 存储文件，计划用 **Leaflow 容器镜像** 作为 API 后端，彻底绕开 KV 写入限制。Worker 继续做网关和缓存，但所有写操作都会打到 Leaflow API。

## 改造思路
- **Worker 角色**：鉴权、路由、缓存头、直链签名；不再直接写 KV。
- **Leaflow 容器**：提供与 KV 读写语义兼容的 REST API，内部对接 Telegram 机器人/频道完成实际存储。
- **环境变量**：`LEAFLOW_API`（容器地址）和 `LEAFLOW_TOKEN`（可选 Bearer Token）。只要配置了 `LEAFLOW_API`，Worker 会自动优先使用容器。

## 必要改动
1. **配置环境变量**
   - 在 `wrangler.toml` 中加入：

     ```toml
     [vars]
     LEAFLOW_API = "https://your-leaflow-host"  # 容器暴露的 HTTP 入口
     LEAFLOW_TOKEN = "<optional-token>"          # 如果容器要求鉴权
     ```

2. **容器侧需实现的接口**（与现有 Worker 读写兼容）
   - `PUT /kv/:key` 写入配置/索引（Body: `{ value, metadata? }`）。
   - `GET /kv/:key` 读取配置/索引（返回 `{ value, metadata? }`）。
   - `DELETE /kv/:key` 删除。
   - `GET /kv?prefix=&cursor=&limit=` 列表遍历（返回 `{ keys: [{ name, metadata }], cursor, list_complete }`）。
   - 这些接口内部将文件/元数据写入 Telegram，即可替代原 KV 写入路径。

3. **Worker 与容器交互要点**
   - 已在代码中内置 `LeaflowAdapter`，所有 KV/D1 调用都会路由到容器接口，无需再改业务逻辑。
   - 若容器开启鉴权，请在请求头中验证 `Authorization: Bearer <LEAFLOW_TOKEN>`。
   - 为减少容器压力，可在 Worker 继续设置 `Cache-Control` 响应头，并根据业务需要在 CDN 开启缓存。

4. **发布顺序**
   - 先在容器侧验证以上接口与 Telegram 存储通路正常。
   - 设置 `LEAFLOW_API`（及可选 `LEAFLOW_TOKEN`）后发布新 Worker 版本。
   - 观察 Worker 日志是否还有 KV 写入；确认无误后即可不再配置 KV 绑定。

## 验证清单
- 上传/删除/随机图等写路径是否能正常调用 Leaflow API 并落盘到 Telegram。
- 列表和索引操作是否能正常分页返回。
- 未配置 `LEAFLOW_TOKEN` 时容器是否允许匿名访问（如需鉴权请确保 401/403 行为正确）。
- Worker 返回的直链是否仍可通过 CDN 访问，缓存命中率是否符合预期。
