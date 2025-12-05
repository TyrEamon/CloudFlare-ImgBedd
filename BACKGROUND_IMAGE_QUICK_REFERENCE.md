# 背景图修改快速参考

> 快速查找 CloudFlare-ImgBed 项目中背景图相关的所有配置位置

---

## 📍 一图速查

```
CloudFlare-ImgBed 背景图配置位置
│
├── 1️⃣ 管理端界面配置（推荐）
│   ├── 位置：管理端 → 系统设置 → 页面设置
│   ├── 客户端登录页背景图 (loginBkImg)
│   ├── 客户端上传页背景图 (uploadBkImg)
│   ├── 管理端登录页背景图 (adminLoginBkImg)
│   ├── 背景切换间隔 (bkInterval)
│   └── 背景图透明度 (bkOpacity)
│
├── 2️⃣ 后端配置文件
│   └── functions/api/manage/sysConfig/page.js
│       └── 定义背景图配置项和默认值
│
├── 3️⃣ CSS 样式配置
│   └── css/app.dab02a4f.css
│       ├── :root (明亮模式)
│       │   ├── --bg-color
│       │   ├── --admin-container-bg-color
│       │   └── 其他背景相关变量...
│       └── .dark (暗黑模式)
│           ├── --bg-color
│           ├── --admin-container-bg-color
│           └── 其他背景相关变量...
│
└── 4️⃣ 静态资源目录
    ├── /static - 公开访问的静态资源
    ├── /img - 图标和图片资源
    └── 推荐创建 /static/backgrounds 用于背景图
```

---

## ⚡ 快速配置

### 方式 1：使用必应壁纸（最简单）

```
管理端 → 系统设置 → 页面设置 → 填写 "bing"
```

### 方式 2：使用单张自定义图片

```json
["https://example.com/background.jpg"]
```

### 方式 3：使用多张图片轮播

```json
["https://img1.jpg","https://img2.jpg","https://img3.jpg"]
```
+ 设置背景切换间隔：`3000` (毫秒)

---

## 📂 所有背景相关配置文件位置总览

| 配置项 | 文件路径 | 修改方式 |
|--------|----------|----------|
| **页面背景图配置** | `functions/api/manage/sysConfig/page.js` | 通过管理端界面修改（推荐） |
| **主页面背景色** | `css/app.dab02a4f.css` | 修改 `--bg-color` 变量 |
| **管理端背景色** | `css/app.dab02a4f.css` | 修改 `--admin-container-bg-color` 变量 |
| **登录容器背景** | `css/app.dab02a4f.css` | 修改 `--login-container-bg-color` 变量 |
| **上传区背景** | `css/app.dab02a4f.css` | 修改 `--el-upload-dragger-bg-color` 变量 |
| **对话框背景** | `css/app.dab02a4f.css` | 修改 `--dialog-bg-color` 变量 |
| **静态背景图资源** | `/static/` 或 `/img/` | 直接放置图片文件 |

---

## 🎨 CSS 背景变量速查表

### 明亮模式 (`:root`)

```css
--bg-color: linear-gradient(90deg, #efe8e8, #e4f8ff);
--admin-container-bg-color: linear-gradient(90deg, #fdf3f6, #e4f8ff);
--upload-list-card-bg-color: hsla(0, 0%, 100%, .7);
--el-upload-dragger-bg-color: hsla(0, 0%, 100%, .6);
--dialog-bg-color: hsla(0, 0%, 100%, .7);
--login-container-bg-color: hsla(0, 0%, 100%, .6);
```

### 暗黑模式 (`.dark`)

```css
--bg-color: linear-gradient(90deg, #1c1c1c, #000);
--admin-container-bg-color: linear-gradient(90deg, #464545, #2d2d2d);
--upload-list-card-bg-color: rgba(0, 0, 0, .7);
--el-upload-dragger-bg-color: rgba(0, 0, 0, .6);
--dialog-bg-color: rgba(0, 0, 0, .8);
--login-container-bg-color: rgba(0, 0, 0, .6);
```

---

## 🔍 JavaScript/前端中的背景图引用

预编译的前端代码中，背景图相关的逻辑分布在以下文件：

| 文件 | 功能说明 |
|------|----------|
| `js/45.629978d9.js` | 客户端登录页组件，处理 `loginBkImg` |
| `js/472.7915167a.js` | 客户端上传页组件，处理 `uploadBkImg` |
| `js/app.7b4ce17b.js` | 主应用入口，处理全局背景配置 |
| `js/226.4c3e9291.js` | 管理端相关组件，处理 `adminLoginBkImg` |

> **注意**：这些是打包后的文件，不建议直接修改。如需修改前端逻辑，请访问前端源码仓库 [MarSeventh/Sanyue-ImgHub](https://github.com/MarSeventh/Sanyue-ImgHub)。

---

## 🛠️ 背景图配置 API 接口

### 读取页面配置

```http
GET /api/manage/sysConfig/page
Authorization: Bearer <token>
```

**响应示例：**
```json
{
  "config": [
    {
      "id": "loginBkImg",
      "label": "登录页背景图",
      "category": "客户端设置",
      "value": "bing"
    },
    {
      "id": "uploadBkImg",
      "label": "上传页背景图",
      "category": "客户端设置",
      "value": "[\"https://example.com/bg.jpg\"]"
    },
    {
      "id": "bkInterval",
      "label": "背景切换间隔",
      "category": "全局设置",
      "value": "3000"
    },
    {
      "id": "bkOpacity",
      "label": "背景图透明度",
      "category": "全局设置",
      "value": "0.8"
    }
  ]
}
```

### 保存页面配置

```http
POST /api/manage/sysConfig/page
Authorization: Bearer <token>
Content-Type: application/json

{
  "config": [
    {
      "id": "loginBkImg",
      "value": "bing"
    },
    {
      "id": "uploadBkImg",
      "value": "[\"https://example.com/bg.jpg\"]"
    }
  ]
}
```

---

## 📝 配置示例集合

### 示例 1：纯色背景（通过 CSS）

```css
/* 修改 css/app.dab02a4f.css */
:root {
    --bg-color: #f5f5f5;
}

.dark {
    --bg-color: #1a1a1a;
}
```

### 示例 2：渐变背景（通过 CSS）

```css
:root {
    --bg-color: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.dark {
    --bg-color: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
}
```

### 示例 3：CSS 背景图片

```css
:root {
    --bg-color: url('https://example.com/light-bg.jpg');
}

.dark {
    --bg-color: url('https://example.com/dark-bg.jpg');
}

.container {
    background: var(--bg-color);
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
}
```

### 示例 4：自托管静态背景图

```bash
# 1. 创建目录并上传图片
mkdir -p static/backgrounds
cp your-image.jpg static/backgrounds/

# 2. 在管理端配置
# 登录页背景图：["https://你的域名/static/backgrounds/your-image.jpg"]
```

### 示例 5：使用图床本身上传背景图

```bash
# 1. 通过图床上传接口上传图片
# 2. 获取返回的文件 URL，如：https://你的域名/file/abc123.jpg
# 3. 在管理端配置
# 登录页背景图：["https://你的域名/file/abc123.jpg"]
```

---

## ❓ 常见问题速查

| 问题 | 解决方案 |
|------|----------|
| 背景图不显示 | 检查 URL 格式、CORS、浏览器控制台错误 |
| 必应壁纸不生效 | 填写小写 `bing`，检查网络连接 |
| 背景切换不工作 | 确保配置了多张图片且设置了切换间隔 |
| CSS 修改不生效 | 清除缓存，检查文件路径，确认是否需要重新构建 |
| 图片加载慢 | 压缩图片，使用 WebP 格式，使用 CDN |
| 透明度不生效 | 填写 0-1 之间的小数（如 0.8），刷新页面 |
| 不同页面需要不同背景 | 使用 `loginBkImg`、`uploadBkImg`、`adminLoginBkImg` 分别配置 |

---

## 🔗 相关链接

- **完整指南**：[背景图修改完整指南](BACKGROUND_IMAGE_GUIDE.md)
- **前端源码**：[MarSeventh/Sanyue-ImgHub](https://github.com/MarSeventh/Sanyue-ImgHub)
- **项目文档**：[https://cfbed.sanyue.de](https://cfbed.sanyue.de)
- **问题反馈**：[GitHub Issues](https://github.com/MarSeventh/CloudFlare-ImgBed/issues)

---

## ⚙️ 环境变量方式配置（已废弃）

> **注意**：V2.0 版本后，推荐通过管理端界面配置，环境变量方式已废弃。

如果仍需使用环境变量（不推荐），可在 Cloudflare Pages 设置中添加：

```bash
USER_CONFIG='{"loginBkImg":"bing","uploadBkImg":"[\\"url1\\",\\"url2\\"]"}'
```

---

**最后更新**：2025-01-09

如有疑问，请查看[完整指南](BACKGROUND_IMAGE_GUIDE.md)或在 [GitHub Issues](https://github.com/MarSeventh/CloudFlare-ImgBed/issues) 反馈。
