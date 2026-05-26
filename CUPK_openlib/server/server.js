/**
 * 中石大克校区资源共享论坛 - 后端服务
 * 使用 Express + JSON 文件存储
 */

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('../')); // 提供前端静态文件

// 数据目录
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, '../uploads');

// 确保目录存在
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// 数据文件路径
const RESOURCES_FILE = path.join(DATA_DIR, 'resources.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const COMMENTS_FILE = path.join(DATA_DIR, 'comments.json');
const FAVORITES_FILE = path.join(DATA_DIR, 'favorites.json');

// 初始化数据文件
function initDataFile(filePath, defaultData) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
}

// 读取数据
function readData(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
        return [];
    }
}

// 保存数据
function saveData(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// 生成ID
function generateId(prefix, data) {
    const maxId = data.reduce((max, item) => {
        const num = parseInt(item.id.replace(prefix, '')) || 0;
        return Math.max(max, num);
    }, 0);
    return prefix + String(maxId + 1).padStart(6, '0');
}

// 文件上传配置
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueName = 'FILE_' + Date.now() + '_' + file.originalname;
        cb(null, uniqueName);
    }
});
const upload = multer({ storage });

// ============ 资源相关 API ============

// 获取所有资源
app.get('/api/resources', (req, res) => {
    const resources = readData(RESOURCES_FILE);
    res.json(resources);
});

// 获取单个资源
app.get('/api/resources/:id', (req, res) => {
    const resources = readData(RESOURCES_FILE);
    const resource = resources.find(r => r.id === req.params.id);
    if (resource) {
        res.json(resource);
    } else {
        res.status(404).json({ error: '资源不存在' });
    }
});

// 搜索资源
app.get('/api/resources/search', (req, res) => {
    const { q, category, sort } = req.query;
    let resources = readData(RESOURCES_FILE);
    
    if (q) {
        const query = q.toLowerCase();
        resources = resources.filter(r => 
            r.title.toLowerCase().includes(query) ||
            r.description.toLowerCase().includes(query) ||
            r.uploader.toLowerCase().includes(query)
        );
    }
    
    if (category) {
        resources = resources.filter(r => r.category === category);
    }
    
    if (sort === 'downloads') {
        resources.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    } else if (sort === 'time') {
        resources.sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime));
    }
    
    res.json(resources);
});

// 添加资源
app.post('/api/resources', (req, res) => {
    const resources = readData(RESOURCES_FILE);
    const newResource = {
        id: generateId('RES_', resources),
        title: req.body.title,
        category: req.body.category || 'other',
        description: req.body.description || '',
        uploader: req.body.uploader,
        uploaderId: req.body.uploaderId || '',
        uploadTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
        downloads: 0,
        views: 0,
        favorites: 0,
        fileName: req.body.fileName || '',
        filePath: req.body.filePath || '',
        fileSize: req.body.fileSize || 0,
        tags: req.body.tags || []
    };
    resources.unshift(newResource);
    saveData(RESOURCES_FILE, resources);
    res.json(newResource);
});

// 更新资源
app.put('/api/resources/:id', (req, res) => {
    const resources = readData(RESOURCES_FILE);
    const index = resources.findIndex(r => r.id === req.params.id);
    if (index !== -1) {
        resources[index] = { ...resources[index], ...req.body };
        saveData(RESOURCES_FILE, resources);
        res.json(resources[index]);
    } else {
        res.status(404).json({ error: '资源不存在' });
    }
});

// 增加下载次数
app.post('/api/resources/:id/download', (req, res) => {
    const resources = readData(RESOURCES_FILE);
    const resource = resources.find(r => r.id === req.params.id);
    if (resource) {
        resource.downloads = (resource.downloads || 0) + 1;
        saveData(RESOURCES_FILE, resources);
        res.json({ success: true, downloads: resource.downloads });
    } else {
        res.status(404).json({ error: '资源不存在' });
    }
});

// 增加浏览次数
app.post('/api/resources/:id/view', (req, res) => {
    const resources = readData(RESOURCES_FILE);
    const resource = resources.find(r => r.id === req.params.id);
    if (resource) {
        resource.views = (resource.views || 0) + 1;
        saveData(RESOURCES_FILE, resources);
        res.json({ success: true, views: resource.views });
    } else {
        res.status(404).json({ error: '资源不存在' });
    }
});

// ============ 文件上传 API ============

app.post('/api/upload', upload.single('file'), (req, res) => {
    if (req.file) {
        res.json({
            success: true,
            fileName: req.file.originalname,
            filePath: '/uploads/' + req.file.filename,
            fileSize: req.file.size
        });
    } else {
        res.status(400).json({ error: '没有文件上传' });
    }
});

// ============ 用户相关 API ============

app.get('/api/users', (req, res) => {
    const users = readData(USERS_FILE);
    res.json(users);
});

app.post('/api/users/register', (req, res) => {
    const users = readData(USERS_FILE);
    const { username, password, college, major, grade } = req.body;
    
    // 检查用户名是否已存在
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ error: '用户名已存在' });
    }
    
    const newUser = {
        id: generateId('USR_', users),
        username,
        password, // 实际项目应加密
        college: college || '',
        major: major || '',
        grade: grade || '',
        createdAt: new Date().toISOString()
    };
    users.push(newUser);
    saveData(USERS_FILE, users);
    res.json(newUser);
});

app.post('/api/users/login', (req, res) => {
    const users = readData(USERS_FILE);
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        const { password: _, ...userInfo } = user;
        res.json(userInfo);
    } else {
        res.status(401).json({ error: '用户名或密码错误' });
    }
});

// ============ 评论相关 API ============

app.get('/api/comments/:resourceId', (req, res) => {
    const comments = readData(COMMENTS_FILE);
    const resourceComments = comments.filter(c => c.resourceId === req.params.resourceId);
    res.json(resourceComments);
});

app.post('/api/comments', (req, res) => {
    const comments = readData(COMMENTS_FILE);
    const newComment = {
        id: generateId('CMT_', comments),
        resourceId: req.body.resourceId,
        userId: req.body.userId || '',
        userName: req.body.userName || '匿名',
        content: req.body.content,
        rating: req.body.rating || 0,
        time: new Date().toISOString().replace('T', ' ').substring(0, 16),
        helpful: 0
    };
    comments.push(newComment);
    saveData(COMMENTS_FILE, comments);
    res.json(newComment);
});

// ============ 收藏相关 API ============

app.get('/api/favorites/:userId', (req, res) => {
    const favorites = readData(FAVORITES_FILE);
    const userFavorites = favorites.filter(f => f.userId === req.params.userId);
    res.json(userFavorites);
});

app.post('/api/favorites', (req, res) => {
    const favorites = readData(FAVORITES_FILE);
    const { userId, resourceId } = req.body;
    
    if (favorites.find(f => f.userId === userId && f.resourceId === resourceId)) {
        return res.status(400).json({ error: '已经收藏过了' });
    }
    
    const newFavorite = {
        id: generateId('FAV_', favorites),
        userId,
        resourceId,
        time: new Date().toISOString()
    };
    favorites.push(newFavorite);
    saveData(FAVORITES_FILE, favorites);
    
    // 增加资源的收藏数
    const resources = readData(RESOURCES_FILE);
    const resource = resources.find(r => r.id === resourceId);
    if (resource) {
        resource.favorites = (resource.favorites || 0) + 1;
        saveData(RESOURCES_FILE, resources);
    }
    
    res.json(newFavorite);
});

app.delete('/api/favorites/:userId/:resourceId', (req, res) => {
    const favorites = readData(FAVORITES_FILE);
    const { userId, resourceId } = req.params;
    const index = favorites.findIndex(f => f.userId === userId && f.resourceId === resourceId);
    
    if (index !== -1) {
        favorites.splice(index, 1);
        saveData(FAVORITES_FILE, favorites);
        
        // 减少资源的收藏数
        const resources = readData(RESOURCES_FILE);
        const resource = resources.find(r => r.id === resourceId);
        if (resource && resource.favorites > 0) {
            resource.favorites--;
            saveData(RESOURCES_FILE, resources);
        }
        
        res.json({ success: true });
    } else {
        res.status(404).json({ error: '收藏不存在' });
    }
});

// ============ 统计 API ============

app.get('/api/stats', (req, res) => {
    const resources = readData(RESOURCES_FILE);
    const users = readData(USERS_FILE);
    const comments = readData(COMMENTS_FILE);
    
    const totalDownloads = resources.reduce((sum, r) => sum + (r.downloads || 0), 0);
    const totalViews = resources.reduce((sum, r) => sum + (r.views || 0), 0);
    
    res.json({
        resourceCount: resources.length,
        userCount: users.length,
        commentCount: comments.length,
        totalDownloads,
        totalViews
    });
});

// ============ 初始化 ============

// 初始化数据文件
initDataFile(RESOURCES_FILE, []);
initDataFile(USERS_FILE, []);
initDataFile(COMMENTS_FILE, []);
initDataFile(FAVORITES_FILE, []);

// 启动服务器
app.listen(PORT, () => {
    console.log('========================================');
    console.log('  石大开源资源库服务器已启动');
    console.log('  地址: http://localhost:' + PORT);
    console.log('  数据目录: ' + DATA_DIR);
    console.log('  上传目录: ' + UPLOADS_DIR);
    console.log('========================================');
});
