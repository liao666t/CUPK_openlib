# 石大克拉玛依校区开源资源库 - Railway 部署教程

本教程将帮助你把项目部署到 Railway 云端，让你可以通过互联网访问你的资源库网站。

---

## 准备工作

### 需要准备

1. **GitHub 账号** - 如果没有，请访问 [github.com](https://github.com) 注册
2. **Railway 账号** - 使用 GitHub 登录 [railway.app](https://railway.app)

### 项目结构

确保你的项目包含以下文件：
```
03班14组大报告/
├── index.html          # 前端首页
├── server/             # 后端目录
│   ├── package.json
│   ├── server.js
│   └── railway.json    # Railway 配置文件
└── ...
```

---

## 第一步：上传到 GitHub

### 1.1 创建 GitHub 仓库

1. 登录 GitHub，点击右上角的 **+** 号，选择 **New repository**
2. 填写仓库信息：
   - **Repository name**: `resource-library`（或其他名称）
   - **Description**: `石大克拉玛依校区开源资源库`
   - **Private/Public**: 选择 Public（公开仓库，Railway 免费版需要）
3. 点击 **Create repository**

### 1.2 初始化本地 Git 仓库

在项目根目录打开终端（或 Git Bash），依次执行：

```bash
# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 提交文件
git commit -m "Initial commit: 石大资源库项目"

# 添加远程仓库（将 your-username 替换为你的 GitHub 用户名）
git remote add origin https://github.com/your-username/resource-library.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

### 1.3 验证上传

刷新 GitHub 仓库页面，应该能看到所有文件已上传。

---

## 第二步：部署到 Railway

### 2.1 登录 Railway

1. 访问 [railway.app](https://railway.app)
2. 点击 **Login** → **Login with GitHub**
3. 授权 GitHub 访问

### 2.2 创建新项目

1. 在 Railway 控制台，点击 **New Project**
2. 选择 **Deploy from GitHub repo**
3. 首次使用需要安装 Railway GitHub App：
   - 点击 **Configure GitHub App**
   - 选择要授权的仓库（或选择"All repositories"）
   - 点击 **Install & Authorize**

### 2.3 选择仓库

1. 在项目列表中找到并选择你的 `resource-library` 仓库
2. Railway 会自动检测为 Node.js 项目
3. **重要**：因为 server 目录是后端服务，需要设置根目录：
   - Railway 会尝试部署根目录
   - 但我们需要只部署 `server` 目录
   - 在部署设置中，将 **Root Directory** 设置为 `server`

### 2.4 等待部署

1. Railway 会自动：
   - 安装依赖（npm install）
   - 构建项目
   - 启动服务

2. 可以在 **Deployments** 标签页查看部署进度

### 2.5 获取访问地址

部署成功后，在项目页面可以看到分配的域名：
- 格式：`https://xxx-xxxxx.up.railway.app`
- 点击域名可以直接访问后端 API
- 这个地址就是你的网站后端地址

---

## 第三步：修改前端 API 地址

### 3.1 找到 API 配置文件

打开 `js/main.js` 文件，找到类似以下的代码：

```javascript
// API 配置
const API_BASE = 'http://localhost:3000';
```

### 3.2 修改为 Railway 地址

将 `localhost:3000` 替换为你的 Railway 域名：

```javascript
// API 配置（部署到 Railway）
const API_BASE = 'https://xxx-xxxxx.up.railway.app';
```

### 3.3 提交更改

```bash
git add js/main.js
git commit -m "Update API base URL for Railway deployment"
git push
```

Railway 会自动检测到 GitHub 更新，重新部署。

---

## 如何使用获得的网址

### 完整访问地址

部署成功后，可以通过以下方式访问你的网站：

1. **直接访问前端页面**：
   ```
   https://xxx-xxxxx.up.railway.app/
   ```
   （注意末尾的斜杠）

2. **访问 API**：
   ```
   https://xxx-xxxxx.up.railway.app/api/resources
   ```

### 分享给他人

- 将完整的 URL 分享给同学和老师
- 他们可以直接在浏览器中打开使用

---

## 注意事项

### 1. Railway 免费额度

- 每月有 500 小时的免费使用时间
- 项目不活跃时会自动休眠（首次访问会稍有延迟）
- 休眠后再次访问会自动唤醒

### 2. 数据持久化

- Railway 免费版的文件系统是临时的
- 重新部署或休眠后，上传的文件和新建的数据可能会丢失
- 如需持久化存储，可以升级到付费计划或使用 Railway 的数据库服务

### 3. HTTPS

- Railway 自动提供 HTTPS，无需额外配置
- 所有 API 请求都使用安全连接

### 4. 环境变量

如需配置环境变量（如端口号），可以在 Railway 项目设置中添加。

---

## 常见问题

### Q: 部署失败怎么办？

A: 检查以下几点：
- GitHub 仓库是否公开（Public）
- `server/package.json` 是否存在
- 是否有语法错误

### Q: 网站加载很慢？

A: 首次访问时，Railway 会从休眠状态唤醒，可能需要 10-30 秒。后续访问会正常速度。

### Q: 如何更新网站内容？

A: 直接修改代码后 push 到 GitHub，Railway 会自动重新部署。

---

如有问题，请检查 Railway 控制台的日志输出，或参考 [Railway 官方文档](https://docs.railway.app)。
