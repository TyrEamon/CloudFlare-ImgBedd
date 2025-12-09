# CloudFlare-ImgBed 部署指南和技术原理文档

## 目录

1. [项目概述](#1-项目概述)
2. [部署前置条件](#2-部署前置条件)
3. [详细部署步骤](#3-详细部署步骤)
4. [技术原理](#4-技术原理)
5. [常见问题和故障排查](#5-常见问题和故障排查)
6. [部署检查清单](#6-部署检查清单)

---

## 1. 项目概述

CloudFlare-ImgBed 是一个开源的文件托管解决方案，具有以下核心特性：

- **多存储支持**：Telegram Channel、Cloudflare R2、S3 兼容存储
- **灵活部署**：支持 Cloudflare Pages、Docker 容器、Leaflow 容器
- **全功能管理**：上传、管理、读取、删除文件全生命周期
- **丰富特性**：鉴权、目录分类、图片审查、随机图等
- **API 接口**：RESTful API 和 WebDAV 协议支持

### 版本说明

- **v2.0**：当前版本，相较于 v1.0 有重大架构改进
- **构建命令变更**：从 `npm run build` 变更为 `npm install`
- **配置迁移**：环境变量配置迁移至管理端界面

---

## 2. 部署前置条件

### 2.1 必需账户和权限

#### Cloudflare 账户
- Cloudflare 账户（免费即可）
- 创建 Cloudflare Pages 项目权限
- 创建 D1 数据库权限（可选）
- 创建 KV 存储权限（可选）
- 创建 R2 存储权限（可选）

#### Telegram 账户（推荐）
- Telegram 账户
- 创建 Bot 的权限（通过 @BotFather）
- 创建 Channel 的权限并添加 Bot 为管理员

#### 其他存储账户（可选）
- AWS S3 账户或 S3 兼容存储账户
- GitHub 账户（用于部署）

### 2.2 必需工具和依赖

#### 基础工具
- **Node.js** 18+ （本地开发）
- **Git** 用于代码版本管理
- **Docker** （容器部署）
- **Docker Compose** （可选，用于多容器编排）

#### Cloudflare 工具
- **Wrangler CLI**：`npm install -g wrangler`
- **Cloudflare 账户认证**：`wrangler auth login`

#### 开发工具（可选）
- **VS Code** 或其他代码编辑器
- **Postman** 或 API 测试工具

---

## 3. 详细部署步骤

### 3.1 项目本地克隆和环境搭建

```bash
# 克隆项目
git clone https://github.com/MarSeventh/CloudFlare-ImgBed.git
cd CloudFlare-ImgBed

# 安装依赖
npm install

# 本地开发测试（可选）
npm start
```

### 3.2 Cloudflare Pages 部署（推荐）

#### 3.2.1 创建 Cloudflare Pages 项目

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** 部分
3. 点击 **Create a project**
4. 选择 **Connect to Git**
5. 授权 GitHub 并选择项目仓库

#### 3.2.2 构建设置

在 **Build settings** 中配置：

```
Build command: npm install
Build output directory: .
Root directory: /
```

#### 3.2.3 环境变量配置

在 **Settings** -> **Environment variables** 中添加：

```bash
# Telegram 渠道配置（必需）
TG_BOT_TOKEN=your_bot_token_here
TG_CHAT_ID=your_chat_id_here

# S3 存储配置（可选）
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=your_bucket_name
S3_ENDPOINT=your_s3_endpoint
S3_REGION=auto
S3_PATH_STYLE=false

# R2 存储配置（可选）
R2PublicUrl=your_r2_public_url

# Leaflow 容器配置（可选）
LEAFLOW_API=https://your-leaflow-host
LEAFLOW_TOKEN=your_leaflow_token
```

#### 3.2.4 绑定资源

在 **Settings** -> **Functions** 中配置绑定：

```bash
# KV 存储绑定（可选）
Variable name: img_url
KV namespace: 选择已创建的 KV 命名空间

# D1 数据库绑定（可选）
Variable name: img_d1
D1 database: 选择已创建的 D1 数据库

# R2 存储绑定（可选）
Variable name: img_r2
R2 bucket: 选择已创建的 R2 存储桶
```

### 3.3 D1 数据库初始化

#### 3.3.1 创建 D1 数据库

```bash
# 创建 D1 数据库
wrangler d1 create imgbed-database

# 记录返回的 database_id
```

#### 3.3.2 初始化数据库结构

```bash
# 执行初始化脚本
wrangler d1 execute imgbed-database --file=./database/init.sql

# 或逐条执行 SQL
wrangler d1 execute imgbed-database --command="CREATE TABLE IF NOT EXISTS files (...)"
```

#### 3.3.3 绑定 D1 到 Pages

在 Cloudflare Pages 设置中绑定 D1 数据库：
- Variable name: `img_d1`
- D1 database: 选择刚创建的数据库

### 3.4 KV 存储配置

#### 3.4.1 创建 KV 命名空间

```bash
# 创建 KV 命名空间
wrangler kv:namespace create "IMG_URL"

# 记录返回的 id
```

#### 3.4.2 绑定 KV 到 Pages

在 Cloudflare Pages 设置中绑定 KV：
- Variable name: `img_url`
- KV namespace: 选择刚创建的 KV 命名空间

### 3.5 R2 存储配置

#### 3.5.1 创建 R2 存储桶

```bash
# 创建 R2 存储桶
wrangler r2 bucket create imgbed-r2

# 设置公共访问（可选）
wrangler r2 bucket put --public imgbed-r2
```

#### 3.5.2 绑定 R2 到 Pages

在 Cloudflare Pages 设置中绑定 R2：
- Variable name: `img_r2`
- R2 bucket: 选择刚创建的存储桶

### 3.6 Docker 容器部署

#### 3.6.1 直接运行 Docker

```bash
# 构建镜像
docker build -t cloudflare-imgbed .

# 运行容器
docker run -d \
  --name imgbed \
  -p 7658:8080 \
  -v $(pwd)/wrangler.toml:/app/wrangler.toml \
  -v $(pwd)/data:/app/data \
  cloudflare-imgbed
```

#### 3.6.2 使用 Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  imgbed:
    image: marseventh/cloudflare-imgbed:latest
    ports:
      - "7658:8080"
    volumes:
      - ./wrangler.toml:/app/wrangler.toml
      - ./data:/app/data
    restart: unless-stopped
    environment:
      - TG_BOT_TOKEN=your_bot_token
      - TG_CHAT_ID=your_chat_id
```

运行命令：
```bash
docker-compose up -d
```

#### 3.6.3 Docker 环境变量配置

创建 `wrangler.toml` 文件：

```toml
name = "cloudflare-imgbed"
compatibility_date = "2024-01-01"

[env.production.vars]
TG_BOT_TOKEN = "your_bot_token_here"
TG_CHAT_ID = "your_chat_id_here"
S3_ACCESS_KEY_ID = "your_access_key"
S3_SECRET_ACCESS_KEY = "your_secret_key"
S3_BUCKET_NAME = "your_bucket_name"
S3_ENDPOINT = "your_s3_endpoint"
R2PublicUrl = "your_r2_public_url"
LEAFLOW_API = "https://your-leaflow-host"
LEAFLOW_TOKEN = "your_leaflow_token"
```

### 3.7 Leaflow 容器部署（高级）

#### 3.7.1 部署架构

- **Worker**：鉴权、路由、缓存头、直链签名
- **Leaflow 容器**：提供与 KV 读写语义兼容的 REST API
- **Telegram**：实际文件存储

#### 3.7.2 容器接口要求

Leaflow 容器需要实现以下接口：

```
PUT /kv/:key        # 写入配置/索引
GET /kv/:key        # 读取配置/索引
DELETE /kv/:key     # 删除
GET /kv?prefix=&cursor=&limit=  # 列表遍历
```

#### 3.7.3 环境变量配置

```bash
# Worker 环境变量
LEAFLOW_API=https://your-leaflow-host
LEAFLOW_TOKEN=your_leaflow_token
```

### 3.8 Telegram Bot 配置

#### 3.8.1 创建 Telegram Bot

1. 在 Telegram 中搜索 `@BotFather`
2. 发送 `/newbot` 创建新机器人
3. 按提示设置机器人名称和用户名
4. 记录获得的 **Bot Token**

#### 3.8.2 创建 Telegram Channel

1. 在 Telegram 中创建新频道
2. 将频道类型设置为 **公开** 或 **私有**
3. 将创建的 Bot 添加为频道管理员
4. 获取频道 ID（公开频道：`@channelname`，私有频道：通过机器人获取）

#### 3.8.3 获取私有频道 ID

```python
# 使用以下 Python 脚本获取私有频道 ID
import requests

def get_chat_id(bot_token, channel_username):
    url = f"https://api.telegram.org/bot{bot_token}/getChat"
    params = {"chat_id": channel_username}
    response = requests.get(url, params=params)
    return response.json()

# 使用方法
chat_info = get_chat_id("YOUR_BOT_TOKEN", "@channel_username")
print(chat_info)
```

### 3.9 部署验证

#### 3.9.1 功能测试

1. **访问主页**：确认页面正常加载
2. **上传测试**：上传不同类型文件测试各存储渠道
3. **管理功能**：登录管理后台测试配置功能
4. **API 测试**：测试 RESTful API 接口

#### 3.9.2 性能测试

```bash
# 使用 curl 测试上传
curl -X POST -F "file=@test.jpg" \
  "https://your-domain.com/upload"

# 测试文件获取
curl -I "https://your-domain.com/file/your_file_id"
```

---

## 4. 技术原理

### 4.1 项目架构说明

#### 4.1.1 整体架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端界面      │    │   Cloudflare    │    │   存储后端      │
│   (Static)      │───▶│   Pages/Workers │───▶│   (Multi-Backend)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                        │
                              ▼                        ▼
                       ┌──────────────┐    ┌──────────────────────┐
                       │   路由层     │    │  Telegram Channel    │
                       │   (Functions)│    │  Cloudflare R2      │
                       └──────────────┘    │  S3 Compatible       │
                              │            │  Leaflow Container   │
                              ▼            └──────────────────────┘
                       ┌──────────────┐
                       │   数据层     │
                       │ (D1/KV/Leaflow)│
                       └──────────────┘
```

#### 4.1.2 前端架构

- **静态文件**：HTML、CSS、JavaScript 静态资源
- **单页应用**：基于现代前端框架的用户界面
- **响应式设计**：支持桌面和移动设备

#### 4.1.3 后端架构

- **Cloudflare Functions**：无服务器函数处理业务逻辑
- **路由系统**：基于文件路径的函数路由
- **中间件**：认证、数据库检查、请求处理

### 4.2 Cloudflare Pages/Workers 工作流程

#### 4.2.1 请求处理流程

```
用户请求 → CDN → Cloudflare Pages → Functions Router → 业务逻辑 → 存储层 → 响应
```

#### 4.2.2 函数路由系统

```
/functions/
├── api/           # API 接口
│   ├── login.js   # 用户登录
│   ├── manage/    # 管理接口
│   └── userConfig.js # 用户配置
├── upload/        # 文件上传
│   ├── index.js   # 上传处理
│   ├── chunkUpload.js # 分片上传
│   └── chunkMerge.js   # 分片合并
├── file/          # 文件访问
│   └── [[path]].js # 文件路由
├── dav/           # WebDAV 协议
└── utils/         # 工具函数
```

#### 4.2.3 中间件系统

- **认证中间件**：`userAuth.js` 处理用户认证
- **数据库中间件**：`middleware.js` 检查数据库配置
- **配置中间件**：`sysConfig.js` 加载系统配置

### 4.3 API 端点和路由设计

#### 4.3.1 核心 API 端点

```javascript
// 文件上传
POST /upload                    # 单文件上传
POST /upload?initChunked=true   # 初始化分片上传
POST /upload?chunked=true       # 分片上传
POST /upload?merge=true         # 分片合并

// 文件访问
GET /file/:id                   # 文件访问
DELETE /file/:id                # 文件删除

// 用户认证
POST /api/login                 # 用户登录
GET /api/userConfig             # 获取用户配置

// 管理接口
GET /api/manage/*               # 获取管理配置
POST /api/manage/*              # 保存管理配置

// WebDAV
PROPFIND /dav/*                 # WebDAV 列表
GET /dav/*                      # WebDAV 获取
PUT /dav/*                      # WebDAV 上传
DELETE /dav/*                   # WebDAV 删除

// 随机图片
GET /random                     # 随机图片
GET /random/:category           # 分类随机图片
```

#### 4.3.2 请求/响应格式

```javascript
// 成功响应
{
  "success": true,
  "data": {
    "src": "/file/file_id",
    "id": "file_id"
  }
}

// 错误响应
{
  "success": false,
  "error": "Error message"
}
```

### 4.4 存储方案详解

#### 4.4.1 Telegram Channel 存储

**原理**：
- 利用 Telegram Bot API 将文件发送到频道
- 文件存储在 Telegram 服务器上
- 通过 `file_id` 和 `file_path` 访问文件

**优势**：
- 免费无限存储空间
- 全球 CDN 加速
- 高可靠性

**限制**：
- 单文件最大 50MB
- 需要配置 Bot Token 和 Chat ID
- 依赖 Telegram 服务可用性

**实现流程**：
```javascript
// 1. 发送文件到 Telegram
const response = await telegramAPI.sendFile(file, chatId, 'sendDocument', 'document');
const fileInfo = telegramAPI.getFileInfo(response);

// 2. 获取文件路径
const filePath = await telegramAPI.getFilePath(fileInfo.file_id);

// 3. 构建访问链接
const fileUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
```

#### 4.4.2 Cloudflare R2 存储

**原理**：
- 使用 Cloudflare R2 对象存储
- 文件直接存储在 R2 存储桶中
- 通过公共 URL 访问文件

**优势**：
- 与 Cloudflare 生态系统深度集成
- 无出站流量费用
- 高性能全球访问

**配置**：
```javascript
// R2 上传示例
await r2Bucket.put(fileId, file);
const publicUrl = `https://pub-xxxxx.r2.dev/${fileId}`;
```

#### 4.4.3 S3 兼容存储

**原理**：
- 使用 AWS S3 或 S3 兼容存储
- 支持自定义端点
- 支持路径风格和虚拟主机风格 URL

**配置**：
```javascript
// S3 客户端配置
const s3Client = new S3Client({
  region: region || "auto",
  endpoint: customEndpoint,
  credentials: {
    accessKeyId,
    secretAccessKey
  },
  forcePathStyle: pathStyle
});
```

#### 4.4.4 数据库适配器

**多数据库支持架构**：
```javascript
// 数据库适配器优先级
1. Leaflow API (LEAFLOW_API)
2. D1 Database (img_d1)
3. KV Storage (img_url)
```

**适配器实现**：
```javascript
export function getDatabase(env) {
  // 优先使用 Leaflow 容器 API
  if (env.LEAFLOW_API) {
    return new LeaflowAdapter(env.LEAFLOW_API, env.LEAFLOW_TOKEN);
  }
  
  // 使用 D1 数据库
  if (env.img_d1) {
    return new D1Database(env.img_d1);
  }
  
  // 使用 KV 存储
  if (env.img_url) {
    return new KVAdapter(env.img_url);
  }
  
  throw new Error('No database configured');
}
```

### 4.5 认证和授权机制

#### 4.5.1 多层认证系统

```javascript
// 认证层级
1. IP 白名单/黑名单
2. 访问域名限制
3. 用户认证码
4. 管理员认证
5. 文件访问权限
```

#### 4.5.2 用户认证流程

```javascript
// 认证检查
export async function userAuthCheck(env, url, request, requiredPermission) {
  // 1. 检查 IP 限制
  if (await isBlockedIP(env, getUploadIp(request))) {
    return false;
  }
  
  // 2. 检查域名白名单
  if (await isDomainBlocked(env, url.hostname)) {
    return false;
  }
  
  // 3. 检查用户认证码
  if (requiredPermission === 'upload') {
    return await checkUploadAuth(env, url);
  }
  
  // 4. 检查管理员权限
  if (requiredPermission === 'admin') {
    return await checkAdminAuth(env, request);
  }
  
  return true;
}
```

#### 4.5.3 权限控制

| 权限级别 | 访问范围 | 认证方式 |
|---------|---------|---------|
| 公开访问 | 文件浏览 | 无需认证 |
| 上传权限 | 文件上传 | 认证码 |
| 管理权限 | 系统管理 | 用户名密码 |

### 4.6 文件处理流程

#### 4.6.1 文件上传流程

```
文件选择 → 权限检查 → 文件验证 → 存储渠道选择 → 文件上传 → 元数据保存 → 缓存清理 → 返回结果
```

#### 4.6.2 分片上传机制

```javascript
// 大文件分片上传流程
1. 客户端检查文件大小
2. 如果 > 20MB，启用分片上传
3. 初始化分片上传 → 获取 uploadId
4. 分片上传 → 每片 20MB
5. 分片合并 → 重新组装文件
6. 完成上传 → 保存元数据
```

#### 4.6.3 文件类型处理

```javascript
// 文件类型映射
const fileTypeMap = {
  'image/': { url: 'sendPhoto', type: 'photo' },
  'video/': { url: 'sendVideo', type: 'video' },
  'audio/': { url: 'sendAudio', type: 'audio' },
  'application/pdf': { url: 'sendDocument', type: 'document' }
};

// 特殊处理
if (fileType === 'image/gif' || fileType === 'image/webp') {
  // GIF 和 WebP 需要特殊处理，避免被 Telegram 压缩
  sendFunction = { url: 'sendAnimation', type: 'animation' };
}
```

---

## 5. 常见问题和故障排查

### 5.1 部署常见错误及解决方案

#### 5.1.1 构建失败

**错误**：`Build command failed`

**解决方案**：
```bash
# 确保使用正确的构建命令
# Cloudflare Pages 设置中应该使用：
Build command: npm install
# 而不是 npm run build
```

#### 5.1.2 环境变量未生效

**错误**：`Environment variables not working`

**解决方案**：
1. 检查环境变量名称是否正确
2. 确保在正确的环境（Production）中设置
3. 重新部署项目以应用新的环境变量
4. 检查是否有缓存问题

#### 5.1.3 数据库连接失败

**错误**：`Database connection failed`

**解决方案**：
```bash
# 检查 D1 数据库绑定
wrangler d1 list

# 检查数据库初始化
wrangler d1 execute imgbed-database --command="SELECT * FROM files LIMIT 1"

# 检查 KV 绑定
wrangler kv:namespace list
```

### 5.2 Telegram 配置问题

#### 5.2.1 Bot Token 无效

**错误**：`Telegram bot token is invalid`

**解决方案**：
1. 重新生成 Bot Token
2. 确保没有多余的空格或换行符
3. 测试 Bot Token 有效性：
```bash
curl "https://api.telegram.org/botYOUR_TOKEN/getMe"
```

#### 5.2.2 Chat ID 错误

**错误**：`Bad Request: chat not found`

**解决方案**：
1. 确保已将 Bot 添加为频道管理员
2. 检查频道 ID 格式（公开频道：`@channelname`）
3. 对于私有频道，使用数字 ID

#### 5.2.3 文件上传失败

**错误**：`Failed to upload file to Telegram`

**解决方案**：
1. 检查文件大小是否超过 50MB
2. 确保文件类型被 Telegram 支持
3. 检查 Bot 是否有发送消息权限

### 5.3 R2/S3 存储问题

#### 5.3.1 R2 公共访问失败

**错误**：`R2 public URL not accessible`

**解决方案**：
```bash
# 设置 R2 存储桶为公共
wrangler r2 bucket put --public imgbed-r2

# 配置自定义域名（可选）
wrangler r2 bucket domain add imgbed-r2 custom-domain.com
```

#### 5.3.2 S3 连接失败

**错误**：`S3 connection failed`

**解决方案**：
1. 检查访问密钥和秘密密钥
2. 确认端点 URL 正确
3. 检查区域设置
4. 验证存储桶名称

### 5.4 API 调用和权限问题

#### 5.4.1 认证失败

**错误**：`Unauthorized access`

**解决方案**：
1. 检查认证码配置
2. 确认管理端设置已保存
3. 检查 IP 白名单设置
4. 验证域名限制配置

#### 5.4.2 CORS 问题

**错误**：`CORS policy violation`

**解决方案**：
```javascript
// 在函数中添加 CORS 头
export async function onRequest(context) {
  return new Response(response.body, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
```

### 5.5 性能和缓存问题

#### 5.5.1 文件访问缓慢

**解决方案**：
1. 启用 Cloudflare 缓存
2. 配置适当的缓存头
3. 使用 CDN 加速
4. 优化图片大小

#### 5.5.2 上传速度慢

**解决方案**：
1. 启用分片上传（大文件）
2. 选择就近的存储区域
3. 优化网络连接
4. 考虑负载均衡

### 5.6 故障排查工具

#### 5.6.1 日志查看

```bash
# Wrangler 本地日志
wrangler pages dev ./ --kv img_url --r2 img_r2

# Cloudflare Pages 日志
# 1. 进入 Cloudflare Dashboard
# 2. 选择 Pages 项目
# 3. 查看 Functions logs

# 实时日志流
wrangler pages deployment tail
```

#### 5.6.2 调试工具

```javascript
// 添加调试日志
console.log('Request URL:', request.url);
console.log('Environment variables:', Object.keys(env));
console.log('Database config:', checkDatabaseConfig(env));

// 使用 Sentry 错误追踪（已集成）
import * as Sentry from "@sentry/browser";
Sentry.captureException(error);
```

---

## 6. 部署检查清单

### 6.1 部署前检查

#### 6.1.1 账户和权限
- [ ] Cloudflare 账户已创建
- [ ] GitHub 仓库已 Fork 或克隆
- [ ] Telegram Bot 已创建
- [ ] Telegram Channel 已创建
- [ ] Bot 已添加为频道管理员

#### 6.1.2 配置文件
- [ ] `wrangler.toml` 已配置（Docker 部署）
- [ ] 环境变量已准备
- [ ] 数据库初始化脚本已检查

#### 6.1.3 工具安装
- [ ] Node.js 18+ 已安装
- [ ] Wrangler CLI 已安装
- [ ] Docker 已安装（容器部署）

### 6.2 部署过程检查

#### 6.2.1 Cloudflare Pages 部署
- [ ] Pages 项目已创建
- [ ] Git 仓库已连接
- [ ] 构建设置已配置（`npm install`）
- [ ] 环境变量已添加
- [ ] 资源绑定已配置（KV/D1/R2）

#### 6.2.2 数据库初始化
- [ ] D1 数据库已创建
- [ ] 数据库表结构已初始化
- [ ] KV 命名空间已创建
- [ ] R2 存储桶已创建

#### 6.2.3 存储配置
- [ ] Telegram Bot Token 已配置
- [ ] Telegram Chat ID 已配置
- [ ] S3 配置已添加（如使用）
- [ ] R2 公共 URL 已配置（如使用）

### 6.3 部署后验证

#### 6.3.1 基础功能测试
- [ ] 主页可以正常访问
- [ ] 管理后台可以登录
- [ ] 系统设置可以保存

#### 6.3.2 上传功能测试
- [ ] Telegram 渠道上传正常
- [ ] R2 渠道上传正常（如配置）
- [ ] S3 渠道上传正常（如配置）
- [ ] 大文件分片上传正常

#### 6.3.3 访问功能测试
- [ ] 文件可以正常访问
- [ ] 文件列表可以正常显示
- [ ] 随机图片功能正常
- [ ] WebDAV 功能正常（如需要）

#### 6.3.4 安全功能测试
- [ ] 访问控制正常工作
- [ ] IP 限制功能正常
- [ ] 认证码验证正常
- [ ] 管理员权限控制正常

### 6.4 性能优化检查

#### 6.4.1 缓存配置
- [ ] Cloudflare 缓存已启用
- [ ] 静态资源缓存已配置
- [ ] 文件访问缓存已优化

#### 6.4.2 CDN 配置
- [ ] 自定义域名已配置（可选）
- [ ] SSL 证书已配置
- [ ] 压缩已启用

### 6.5 监控和维护

#### 6.5.1 日志配置
- [ ] 错误日志已配置
- [ ] 访问日志已记录
- [ ] Sentry 错误追踪已启用

#### 6.5.2 备份策略
- [ ] 数据库备份已配置
- [ ] 配置备份已制定
- [ ] 恢复流程已测试

### 6.6 故障排查准备

#### 6.6.1 调试工具
- [ ] 日志查看工具已准备
- [ ] API 测试工具已配置
- [ ] 性能监控已设置

#### 6.6.2 文档和联系
- [ ] 技术文档已保存
- [ ] 社区支持渠道已记录
- [ ] 紧急联系方式已确认

---

## 附录

### A. 环境变量完整列表

```bash
# Telegram 配置（必需）
TG_BOT_TOKEN=your_bot_token_here
TG_CHAT_ID=your_chat_id_here

# S3 存储配置（可选）
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=your_bucket_name
S3_ENDPOINT=your_s3_endpoint
S3_REGION=auto
S3_PATH_STYLE=false

# R2 存储配置（可选）
R2PublicUrl=your_r2_public_url

# Leaflow 容器配置（可选）
LEAFLOW_API=https://your-leaflow-host
LEAFLOW_TOKEN=your_leaflow_token

# 其他配置（可选）
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password
AUTH_CODE=your_auth_code
```

### B. 有用的命令

```bash
# Cloudflare Wrangler 命令
wrangler pages dev ./ --kv img_url --r2 img_r2 --port 8080
wrangler d1 execute imgbed-database --file=./database/init.sql
wrangler r2 bucket create imgbed-r2
wrangler kv:namespace create "IMG_URL"

# Docker 命令
docker build -t cloudflare-imgbed .
docker run -d --name imgbed -p 7658:8080 cloudflare-imgbed
docker-compose up -d

# 测试命令
curl -X POST -F "file=@test.jpg" "https://your-domain.com/upload"
curl -I "https://your-domain.com/file/your_file_id"
```

### C. 相关链接

- [项目 GitHub 仓库](https://github.com/MarSeventh/CloudFlare-ImgBed)
- [官方文档](https://cfbed.sanyue.de)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
- [Cloudflare R2 文档](https://developers.cloudflare.com/r2/)
- [Telegram Bot API 文档](https://core.telegram.org/bots/api)

### D. 社区支持

- [GitHub Issues](https://github.com/MarSeventh/CloudFlare-ImgBed/issues)
- [项目讨论区](https://github.com/MarSeventh/CloudFlare-ImgBed/discussions)
- [作者赞助](https://afdian.com/a/marseventh)

---

**注意**：本文档基于 CloudFlare-ImgBed v2.0 版本编写，如版本更新可能存在差异，请以最新官方文档为准。