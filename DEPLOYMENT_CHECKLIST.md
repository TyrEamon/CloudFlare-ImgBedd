Cloudflare 账户**已创建并登录
- [ ] **GitHub 账户**已准备（用于连接仓库）
- [ ] **Telegram 账户**已准备
- [ ] **Telegram Bot**已通过 @BotFather 创建
- [ ] **Telegram Channel**已创建并添加 Bot 为管理员

### 工具准备
- [ ] **Node.js 18+**已安装
- [ ] **Wrangler CLI**已安装：`npm install -g wrangler`
- [ ] **Git**已安装
- [ ] **Docker**已安装（容器部署需要）

### 配置信息收集
- [ ] **Bot Token**：从 @BotFather 获得
- [ ] **Chat ID**：Telegram 频道 ID
- [ ] **S3 配置**（如使用）：Access Key、Secret Key、Endpoint 等
- [ ] **R2 配置**（如使用）：Public URL
- [ ] **Leaflow 配置**（如使用）：API 地址和 Token

---

## 🚀 Cloudflare Pages 部署

### 项目创建
- [ ] 进入 **Cloudflare Dashboard** → **Pages**
- [ ] 点击 **Create a project**
- [ ] 选择 **Connect to Git**
- [ ] 授权 GitHub 并选择项目仓库

### 构建配置
- [ ] **Build command** 设置为：`npm install`
- [ ] **Build output directory** 设置为：`.`
- [ ] **Root directory** 设置为：`/`

### 环境变量配置
在 **Settings** → **Environment variables** 中添加：

```bash
# 必需配置
TG_BOT_TOKEN=your_bot_token_here
TG_CHAT_ID=your_chat_id_here

# 可选配置（根据需要添加）
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=your_bucket_name
S3_ENDPOINT=your_s3_endpoint
R2PublicUrl=your_r2_public_url
LEAFLOW_API=https://your-leaflow-host
LEAFLOW_TOKEN=your_leaflow_token
```

- [ ] 所有必需的环境变量已添加
- [ ] 环境变量值已仔细检查（无多余空格）
- [ ] 部署环境选择为 **Production**

### 资源绑定
在 **Settings** → **Functions** 中配置：

- [ ] **KV 绑定**（如使用）
  - Variable name: `img_url`
  - KV namespace: 已创建的 KV 命名空间

- [ ] **D1 绑定**（如使用）
  - Variable name: `img_d1`
  - D1 database: 已创建的 D1 数据库

- [ ] **R2 绑定**（如使用）
  - Variable name: `img_r2`
  - R2 bucket: 已创建的 R2 存储桶

---

## 🗄️ 数据库和存储配置

### D1 数据库（可选）
- [ ] 创建 D1 数据库：`wrangler d1 create imgbed-database`
- [ ] 初始化数据库结构：`wrangler d1 execute imgbed-database --file=./database/init.sql`
- [ ] 验证数据库连接：`wrangler d1 execute imgbed-database --command="SELECT COUNT(*) FROM files"`

### KV 存储（可选）
- [ ] 创建 KV 命名空间：`wrangler kv:namespace create "IMG_URL"`
- [ ] 记录返回的 ID 用于绑定

### R2 存储（可选）
- [ ] 创建 R2 存储桶：`wrangler r2 bucket create imgbed-r2`
- [ ] 设置公共访问：`wrangler r2 bucket put --public imgbed-r2`
- [ ] 配置自定义域名（可选）

---

## 🐳 Docker 容器部署

### 准备工作
- [ ] 项目已克隆：`git clone https://github.com/MarSeventh/CloudFlare-ImgBed.git`
- [ ] 已进入项目目录：`cd CloudFlare-ImgBed`
- [ ] `wrangler.toml` 文件已创建并配置

### wrangler.toml 配置示例
```toml
name = "cloudflare-imgbed"
compatibility_date = "2024-01-01"

[vars]
TG_BOT_TOKEN = "your_bot_token_here"
TG_CHAT_ID = "your_chat_id_here"
S3_ACCESS_KEY_ID = "your_access_key"
S3_SECRET_ACCESS_KEY = "your_secret_key"
S3_BUCKET_NAME = "your_bucket_name"
S3_ENDPOINT = "your_s3_endpoint"
R2PublicUrl = "your_r2_public_url"
```

### 容器运行
- [ ] 构建镜像：`docker build -t cloudflare-imgbed .`
- [ ] 运行容器：`docker run -d --name imgbed -p 7658:8080 cloudflare-imgbed`
- [ ] 或使用 docker-compose：`docker-compose up -d`

---

## ✅ 部署验证测试

### 基础功能测试
- [ ] **主页访问**：浏览器打开部署地址，页面正常显示
- [ ] **管理后台**：能够登录管理界面（默认密码可能需要查看文档）
- [ ] **系统设置**：能够进入系统设置页面

### 上传功能测试
- [ ] **Telegram 上传**：上传小文件测试 Telegram 渠道
- [ ] **大文件上传**：上传 >20MB 文件测试分片上传
- [ ] **多格式支持**：测试图片、视频、文档等不同格式
- [ ] **多渠道切换**：测试不同存储渠道的切换

### 访问功能测试
- [ ] **文件访问**：点击上传的文件能正常访问
- [ ] **文件列表**：管理后台能显示文件列表
- [ ] **随机图片**：随机图片功能正常工作
- [ ] **文件删除**：能够正常删除文件

### 安全功能测试
- [ ] **访问控制**：未授权访问被正确拦截
- [ ] **认证码验证**：上传认证码功能正常
- [ ] **管理员权限**：管理员功能权限控制正常

---

## 🔧 故障排查检查

### 常见问题检查
- [ ] **构建日志**：检查 Cloudflare Pages 构建日志无错误
- [ ] **函数日志**：检查 Functions 运行日志
- [ ] **网络请求**：使用浏览器开发者工具检查网络请求
- [ ] **环境变量**：确认环境变量在正确环境中设置

### 调试命令
```bash
# 本地开发测试
wrangler pages dev ./ --kv img_url --r2 img_r2 --port 8080

# 检查数据库
wrangler d1 execute imgbed-database --command="SELECT * FROM files LIMIT 5"

# 检查 KV 存储
wrangler kv:namespace list
wrangler kv key list --namespace-id=your_namespace_id

# 检查 R2 存储
wrangler r2 object list imgbed-r2
```

---

## 📊 性能优化检查

### 缓存配置
- [ ] **Cloudflare 缓存**：已启用适当的缓存规则
- [ ] **静态资源缓存**：CSS/JS 文件缓存已优化
- [ ] **文件访问缓存**：文件访问设置了合适的缓存头

### CDN 配置
- [ ] **自定义域名**：已配置自定义域名（可选）
- [ ] **SSL 证书**：SSL 证书状态正常
- [ ] **压缩优化**：Gzip/Brotli 压缩已启用

---

## 📈 监控和维护

### 日志配置
- [ ] **错误日志**：能够查看和收集错误日志
- [ ] **访问日志**：访问日志记录正常
- [ ] **性能监控**：页面加载速度在可接受范围

### 备份策略
- [ ] **配置备份**：重要配置已备份
- [ ] **数据备份**：数据库备份策略已制定
- [ ] **恢复测试**：恢复流程已测试

---

## 🎯 快速部署命令参考

### Cloudflare Pages 一键部署脚本

```bash
#!/bin/bash

# 设置变量
PROJECT_NAME="cloudflare-imgbed"
BOT_TOKEN="your_bot_token_here"
CHAT_ID="your_chat_id_here"

# 创建 D1 数据库
echo "创建 D1 数据库..."
wrangler d1 create ${PROJECT_NAME}-db

# 创建 KV 命名空间
echo "创建 KV 命名空间..."
wrangler kv:namespace create "IMG_URL"

# 创建 R2 存储桶
echo "创建 R2 存储桶..."
wrangler r2 bucket create ${PROJECT_NAME}-r2

# 初始化数据库
echo "初始化数据库..."
wrangler d1 execute ${PROJECT_NAME}-db --file=./database/init.sql

echo "部署配置完成！请在 Cloudflare Pages 中配置环境变量和资源绑定。"
```

### Docker 快速启动脚本

```bash
#!/bin/bash

# 创建必要的目录
mkdir -p data

# 创建 wrangler.toml
cat > wrangler.toml << EOF
name = "cloudflare-imgbed"
compatibility_date = "2024-01-01"

[vars]
TG_BOT_TOKEN = "${BOT_TOKEN}"
TG_CHAT_ID = "${CHAT_ID}"
EOF

# 启动容器
docker-compose up -d

echo "容器已启动！访问 http://localhost:7658"
```

---

## 📞 获取帮助

### 官方资源
- [项目文档](https://cfbed.sanyue.de)
- [GitHub Issues](https://github.com/MarSeventh/CloudFlare-ImgBed/issues)
- [GitHub Discussions](https://github.com/MarSeventh/CloudFlare-ImgBed/discussions)

### 社区支持
- [Telegram 群组]（如有）
- [QQ 群组]（如有）
- [作者赞助](https://afdian.com/a/marseventh)

---

## 📝 部署记录

| 项目 | 状态 | 备注 |
|------|------|------|
| 账户准备 | ☐ | |
| 工具安装 | ☐ | |
| 环境变量 | ☐ | |
| 数据库配置 | ☐ | |
| 存储配置 | ☐ | |
| 部署完成 | ☐ | |
| 功能测试 | ☐ | |
| 性能优化 | ☐ | |

---

**提示**：请逐项检查并勾选完成的项目，确保部署过程完整无误。如有问题，请参考故障排查部分或寻求社区帮助。