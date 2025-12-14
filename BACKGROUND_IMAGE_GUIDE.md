# CloudFlare-ImgBed 背景图修改指南

本文档详细说明如何在 CloudFlare-ImgBed 项目中修改和配置背景图。

---

## 📑 目录

1. [背景图配置位置概览](#1-背景图配置位置概览)
2. [通过管理界面配置背景图（推荐）](#2-通过管理界面配置背景图推荐)
3. [通过代码修改背景色和渐变](#3-通过代码修改背景色和渐变)
4. [背景图支持的格式](#4-背景图支持的格式)
5. [常见问题](#5-常见问题)

---

## 1. 背景图配置位置概览

CloudFlare-ImgBed 项目中的背景配置分为以下几个层级：

### 1.1 前端配置（通过管理端界面）
- **登录页背景图**（客户端）
- **上传页背景图**（客户端）
- **登录页背景图**（管理端）

### 1.2 样式配置（CSS 变量）
- **主页面背景色**：使用 CSS 渐变色
- **管理端背景色**：使用 CSS 渐变色
- **主题模式**：支持明亮/暗黑模式切换

---

## 2. 通过管理界面配置背景图（推荐）

### 2.1 配置文件位置

背景图配置通过管理端的"系统设置 -> 页面设置"进行管理。

**后端配置文件**：`functions/api/manage/sysConfig/page.js`

该文件定义了三个背景图配置项：

```javascript
// 客户端登录页背景图
{
    id: 'loginBkImg',
    label: '登录页背景图',
    tooltip: '1.填写 bing 使用必应壁纸轮播 <br/> 2.填写 ["url1","url2"] 使用多张图片轮播 <br/> 3.填写 ["url"] 使用单张图片',
    category: '客户端设置',
}

// 客户端上传页背景图
{
    id: 'uploadBkImg',
    label: '上传页背景图',
    tooltip: '1.填写 bing 使用必应壁纸轮播 <br/> 2.填写 ["url1","url2"] 使用多张图片轮播 <br/> 3.填写 ["url"] 使用单张图片',
    category: '客户端设置',
}

// 管理端登录页背景图
{
    id: 'adminLoginBkImg',
    label: '登录页背景图',
    tooltip: '1.填写 bing 使用必应壁纸轮播 <br/> 2.填写 ["url1","url2"] 使用多张图片轮播 <br/> 3.填写 ["url"] 使用单张图片',
    category: '管理端设置',
}
```

### 2.2 配置步骤

1. **登录管理端**
   - 访问 `https://你的域名/admin`
   - 使用管理员账号登录

2. **进入页面设置**
   - 点击左侧菜单"系统设置"
   - 选择"页面设置"标签

3. **配置背景图**

   有三种配置方式：

   #### 方式 1：使用必应每日壁纸
   ```
   bing
   ```

   #### 方式 2：使用单张图片
   ```json
   ["https://example.com/image.jpg"]
   ```

   #### 方式 3：使用多张图片轮播
   ```json
   ["https://example.com/image1.jpg","https://example.com/image2.jpg","https://example.com/image3.jpg"]
   ```

4. **配置背景切换间隔**（可选）
   - 在"背景切换间隔"字段输入毫秒数（如：3000 表示 3 秒）
   - 仅在多张图片轮播时生效

5. **配置背景图透明度**（可选）
   - 在"背景图透明度"字段输入 0-1 之间的小数（如：0.8）
   - 1 表示完全不透明，0 表示完全透明

6. **保存设置**
   - 点击"保存"按钮
   - 刷新页面查看效果

### 2.3 配置示例

#### 示例 1：使用必应壁纸
```
客户端登录页背景图：bing
背景切换间隔：留空或任意值（必应壁纸会自动切换）
```

#### 示例 2：使用自定义单张图片
```
客户端上传页背景图：["https://picsum.photos/1920/1080"]
背景图透明度：0.9
```

#### 示例 3：使用多张图片轮播
```
管理端登录页背景图：["https://example.com/bg1.jpg","https://example.com/bg2.jpg","https://example.com/bg3.jpg"]
背景切换间隔：5000
背景图透明度：0.85
```

### 2.4 自托管背景图与静态资源路径

如果希望将背景图直接托管在 CloudFlare-ImgBed 项目或 Cloudflare Pages 上，可以使用仓库中的静态资源目录。

- **`/static` 目录**：默认用于对外暴露静态资源，部署后访问路径为 `https://你的域名/static/文件名`。例如：将图片保存为 `static/backgrounds/login.webp`，即可使用 `https://example.com/static/backgrounds/login.webp`。
- **`/img` 目录**：同样会被当作静态资源目录暴露，如果需要与项目中现有图片保持一致可以放在此目录。
- **自建子目录**：建议在 `static/` 下创建 `backgrounds/` 或 `assets/` 子目录，以便分类管理不同页面所需的背景图。
- **通过图床本身上传**：也可以使用 CloudFlare-ImgBed 的上传功能上传背景图，复制生成的外链，粘贴到背景图配置项中即可。
- **外部云存储/CDN**：项目也支持引用 Cloudflare R2、S3、Telegram 频道等生成的公开 URL，直接放入配置项中即可。

**静态资源部署示例：**

1. 在本地创建 `static/backgrounds` 目录，并将 `hero-light.webp`、`hero-dark.webp` 拷贝进去。
2. push 后触发 Cloudflare Pages 或 Workers Sites 重新部署。
3. 访问 `https://你的域名/static/backgrounds/hero-light.webp` 验证资源可达。
4. 在管理端页面设置中写入：
   ```json
   ["https://你的域名/static/backgrounds/hero-light.webp","https://你的域名/static/backgrounds/hero-dark.webp"]
   ```

---

## 3. 通过代码修改背景色和渐变

如果您想修改整体的背景颜色（非背景图片），需要修改 CSS 文件中的 CSS 变量。

### 3.1 主要背景配置文件

**文件位置**：`css/app.dab02a4f.css`

> **注意**：由于前端是预构建的，如果要修改 CSS，您需要：
> 1. 修改前端源码项目：[MarSeventh/Sanyue-ImgHub](https://github.com/MarSeventh/Sanyue-ImgHub)
> 2. 重新构建前端
> 3. 或者直接修改构建后的 CSS 文件（不推荐，会在更新时丢失）

### 3.2 明亮模式背景配置

在 `:root` 选择器中定义：

```css
:root {
    /* 主页面背景 - 从左到右的渐变色 */
    --bg-color: linear-gradient(90deg, #efe8e8, #e4f8ff);
    
    /* 管理端容器背景 */
    --admin-container-bg-color: linear-gradient(90deg, #fdf3f6, #e4f8ff);
    
    /* 各种组件背景色 */
    --upload-list-card-bg-color: hsla(0, 0%, 100%, .7);
    --el-upload-dragger-bg-color: hsla(0, 0%, 100%, .6);
    /* ... 更多变量 */
}
```

### 3.3 暗黑模式背景配置

在 `.dark` 选择器中定义：

```css
.dark {
    /* 主页面背景 - 暗黑模式 */
    --bg-color: linear-gradient(90deg, #1c1c1c, #000);
    
    /* 管理端容器背景 - 暗黑模式 */
    --admin-container-bg-color: linear-gradient(90deg, #464545, #2d2d2d);
    
    /* 各种组件背景色 - 暗黑模式 */
    --upload-list-card-bg-color: rgba(0, 0, 0, .7);
    --el-upload-dragger-bg-color: rgba(0, 0, 0, .6);
    /* ... 更多变量 */
}
```

### 3.4 关键的背景相关 CSS 变量说明

| CSS 变量 | 说明 | 明亮模式默认值 | 暗黑模式默认值 |
|---------|------|---------------|---------------|
| `--bg-color` | 主页面背景渐变 | `linear-gradient(90deg, #efe8e8, #e4f8ff)` | `linear-gradient(90deg, #1c1c1c, #000)` |
| `--admin-container-bg-color` | 管理端背景 | `linear-gradient(90deg, #fdf3f6, #e4f8ff)` | `linear-gradient(90deg, #464545, #2d2d2d)` |
| `--upload-list-card-bg-color` | 上传列表卡片背景 | `hsla(0, 0%, 100%, .7)` | `rgba(0, 0, 0, .7)` |
| `--el-upload-dragger-bg-color` | 拖放上传区背景 | `hsla(0, 0%, 100%, .6)` | `rgba(0, 0, 0, .6)` |
| `--dialog-bg-color` | 对话框背景 | `hsla(0, 0%, 100%, .7)` | `rgba(0, 0, 0, .8)` |
| `--login-container-bg-color` | 登录容器背景 | `hsla(0, 0%, 100%, .6)` | `rgba(0, 0, 0, .6)` |

### 3.5 修改背景渐变示例

如果您想将明亮模式的背景从"粉蓝渐变"改为"橙黄渐变"：

**修改前：**
```css
:root {
    --bg-color: linear-gradient(90deg, #efe8e8, #e4f8ff);
}
```

**修改后：**
```css
:root {
    --bg-color: linear-gradient(90deg, #fff4e6, #ffe4cc);
}
```

### 3.6 使用纯色背景

如果不想使用渐变，可以改为纯色：

```css
:root {
    --bg-color: #f5f5f5;  /* 浅灰色纯色背景 */
}

.dark {
    --bg-color: #1a1a1a;  /* 深灰色纯色背景 */
}
```

### 3.7 使用背景图片（CSS 方式）

如果想通过 CSS 设置全局背景图片：

```css
:root {
    --bg-color: url('https://example.com/background.jpg');
}

/* 或者结合渐变和图片 */
:root {
    --bg-color: linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), 
                url('https://example.com/background.jpg');
}
```

然后在容器中应用：

```css
.container {
    background: var(--bg-color);
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
}
```

---

## 4. 背景图支持的格式

### 4.1 支持的图片格式
- **JPG/JPEG**：适合照片类背景
- **PNG**：支持透明度
- **WEBP**：现代格式，体积更小
- **GIF**：支持动画（不推荐用作背景）
- **SVG**：矢量图，适合几何图案

### 4.2 推荐的图片尺寸和规格
- **分辨率**：至少 1920x1080（Full HD）
- **文件大小**：建议小于 500KB（优化加载速度）
- **宽高比**：16:9 或 21:9
- **压缩**：使用工具压缩图片，在保证质量的前提下减小文件大小

### 4.3 图片来源建议

#### 免费图片资源网站：
- [Unsplash](https://unsplash.com/) - 高质量免费图片
- [Pexels](https://www.pexels.com/) - 免费图片和视频
- [Pixabay](https://pixabay.com/) - 免版权图片
- [Picsum](https://picsum.photos/) - 随机图片占位符服务

#### 必应壁纸：
- 使用 `bing` 关键字即可自动使用必应每日壁纸
- 必应壁纸每天自动更新，无需维护

---

## 5. 常见问题

### Q1: 背景图不显示怎么办？

**可能原因和解决方案：**

1. **URL 格式错误**
   - 检查是否正确使用 JSON 数组格式：`["url1","url2"]`
   - 确保 URL 有效且可访问

2. **跨域问题**
   - 图片服务器需要允许跨域访问（CORS）
   - 建议使用支持 CORS 的图片托管服务

3. **缓存问题**
   - 清除浏览器缓存后重试
   - 使用浏览器的开发者工具检查网络请求

4. **图片加载失败**
   - 检查图片 URL 是否正确
   - 尝试在浏览器中直接访问图片 URL

### Q2: 如何禁用背景图？

在管理端页面设置中，将对应的背景图字段留空或删除即可。

### Q3: 背景图切换不生效？

1. 确保"背景切换间隔"字段已填写（单位：毫秒）
2. 确保配置了多张图片（至少 2 张）
3. 刷新页面后重新测试

### Q4: 必应壁纸不显示？

1. 确保填写的是小写的 `bing`，而不是 `"bing"` 或 `Bing`
2. 检查网络连接是否正常
3. 必应壁纸服务可能在某些地区受限，可改用自定义图片

### Q5: 背景图透明度设置不生效？

1. 确保填写的是 0-1 之间的小数（如 0.8），而不是百分比
2. 某些页面可能需要刷新才能看到效果
3. 透明度主要影响背景图层，不影响内容区域

### Q6: 如何同时使用背景图和渐变？

通过 CSS 可以实现，在 `container` 样式中添加：

```css
.container {
    background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), 
                url('https://example.com/bg.jpg');
    background-size: cover;
}
```

### Q7: 修改了 CSS 但没生效？

1. **清除缓存**：浏览器可能缓存了旧的 CSS 文件
2. **检查文件路径**：确保修改的是正确的 CSS 文件
3. **CSS 选择器优先级**：可能被其他样式覆盖了
4. **构建问题**：如果修改了源码，需要重新构建项目

### Q8: 如何为不同页面设置不同背景？

目前系统支持：
- 客户端登录页背景（`loginBkImg`）
- 客户端上传页背景（`uploadBkImg`）
- 管理端登录页背景（`adminLoginBkImg`）

如需更多页面的背景定制，需要修改前端源码。

### Q9: 背景图影响页面加载速度怎么办？

**优化建议：**

1. **压缩图片**：使用 TinyPNG、Squoosh 等工具压缩
2. **使用 WebP 格式**：现代浏览器支持，体积更小
3. **使用 CDN**：将图片托管在 CDN 上加速访问
4. **懒加载**：对非关键背景图使用懒加载
5. **减少图片数量**：轮播图片不要太多（建议 3-5 张）

### Q10: 如何实现动态背景效果？

**方法 1：使用多张图片轮播**
```json
["https://example.com/bg1.jpg","https://example.com/bg2.jpg"]
```

**方法 2：修改 CSS 添加动画**（需要修改源码）
```css
.container {
    animation: backgroundFade 10s infinite;
}

@keyframes backgroundFade {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
}
```

**方法 3：使用视频背景**（需要修改源码）
```html
<video autoplay muted loop id="bgVideo">
    <source src="background.mp4" type="video/mp4">
</video>
```

---

## 📝 总结

本文档涵盖了 CloudFlare-ImgBed 项目中背景图的所有配置方法：

1. **推荐方式**：通过管理端界面配置背景图（支持必应壁纸、单张图片、多张轮播）
2. **进阶方式**：修改 CSS 变量来自定义背景颜色和渐变
3. **技术细节**：包括配置文件位置、代码示例、常见问题解决方案

**快速开始：**
- 最简单的方法：登录管理端 → 系统设置 → 页面设置 → 填写 `bing` 使用必应壁纸
- 自定义图片：填写 `["你的图片URL"]`
- 多图轮播：填写 `["URL1","URL2","URL3"]` + 设置切换间隔

**注意事项：**
- 修改后需要保存设置并刷新页面
- 图片需要支持 CORS 跨域访问
- 建议使用压缩后的图片以提高加载速度
- CSS 修改需要重新构建前端或直接修改构建后的文件

---

## 📚 相关资源

- **前端源码仓库**：[MarSeventh/Sanyue-ImgHub](https://github.com/MarSeventh/Sanyue-ImgHub)
- **项目文档**：[https://cfbed.sanyue.de](https://cfbed.sanyue.de)
- **问题反馈**：[GitHub Issues](https://github.com/MarSeventh/CloudFlare-ImgBed/issues)

---

**最后更新时间**：2025-01-09

如有任何问题或建议，欢迎在 GitHub Issues 中反馈！
