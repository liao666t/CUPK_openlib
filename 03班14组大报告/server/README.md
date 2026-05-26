# 中石大克校区资源共享论坛 - 后端服务

轻量级的 Node.js 后端服务，用于存储和检索资源数据。

## 功能特性

- 资源管理（增删改查）
- 用户注册/登录
- 评论系统
- 收藏功能
- 文件上传
- 数据持久化（JSON文件存储）

## 环境要求

- Node.js >= 14.x
- npm

## 本地安装步骤

1. 进入 server 目录：
```bash
cd server
```

2. 安装依赖：
```bash
npm install
```

3. 启动服务器：
```bash
npm start
```

4. 打开浏览器访问：
```
http://localhost:3000
```

## 部署到 Railway 云端

详细部署教程请参考项目根目录的 [DEPLOY.md](../DEPLOY.md) 文件。

### Railway 快速部署

1. 将项目上传到 GitHub
2. 在 [Railway](https://railway.app) 创建新项目
3. 连接你的 GitHub 仓库
4. Railway 会自动识别并部署后端服务
5. 部署完成后，复制分配的域名

### 修改前端 API 地址

部署后需要在 `js/main.js` 中修改 API 地址：

```javascript
// 找到类似这样的配置
const API_BASE = 'http://localhost:3000';

// 修改为 Railway 分配的域名，例如：
const API_BASE = 'https://your-app-name.up.railway.app';
```

## 目录结构

```
server/
├── package.json      # 依赖配置
├── server.js         # 后端主程序
├── data/             # 数据存储目录
│   ├── resources.json   # 资源数据
│   ├── users.json       # 用户数据
│   ├── comments.json    # 评论数据
│   └── favorites.json   # 收藏数据
└── README.md
```

## API 接口

### 资源相关

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/resources | 获取所有资源 |
| GET | /api/resources/:id | 获取单个资源 |
| GET | /api/resources/search?q=xxx | 搜索资源 |
| POST | /api/resources | 添加资源 |
| PUT | /api/resources/:id | 更新资源 |
| POST | /api/resources/:id/download | 增加下载次数 |
| POST | /api/resources/:id/view | 增加浏览次数 |

### 用户相关

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/users/register | 注册用户 |
| POST | /api/users/login | 用户登录 |

### 文件上传

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/upload | 上传文件 |

### 评论相关

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/comments/:resourceId | 获取资源评论 |
| POST | /api/comments | 添加评论 |

### 收藏相关

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/favorites/:userId | 获取用户收藏 |
| POST | /api/favorites | 添加收藏 |
| DELETE | /api/favorites/:userId/:resourceId | 取消收藏 |

### 统计

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/stats | 获取统计数据 |

## 注意事项

1. 首次运行会自动创建 data 目录和数据文件
2. 用户上传的文件存储在 `uploads/` 目录
3. 数据保存在 JSON 文件中，便于查看和备份
4. 密码未加密，仅用于演示，实际项目请添加加密
