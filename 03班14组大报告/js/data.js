/**
 * 数据管理模块 - 中石大克校区资源共享论坛
 * 支持本地模式（localStorage）和服务器模式（API）
 */

var DataStore = {
    // 配置
    _config: {
        apiBase: '/api',           // API 基础路径
        useServer: false,          // 是否使用服务器模式
        serverAvailable: false     // 服务器是否可用
    },

    // 本地数据存储（localStorage 模式）
    _data: {
        resources: [],
        users: [],
        comments: [],
        favorites: []
    },

    // 序号计数器
    _counters: {
        resource: 0,
        user: 0,
        comment: 0,
        favorite: 0
    },

    // 分类名称映射
    categoryNames: {
        math: "数学",
        cs: "计算机",
        physics: "物理",
        language: "语言",
        economics: "经济",
        humanities: "人文"
    },

    // 资源文件基础路径
    resourceBasePath: 'files/',

    // 初始化
    init: function(callback) {
        var self = this;
        
        // 先尝试连接服务器
        this._checkServer(function(available) {
            self._config.serverAvailable = available;
            self._config.useServer = available;
            
            if (available) {
                console.log('服务器已连接，使用服务器模式');
                // 从服务器加载数据
                self._loadFromServer(callback);
            } else {
                console.log('服务器未连接，使用本地模式');
                // 从 localStorage 加载数据
                self._loadFromLocalStorage();
                self._initSampleUsers();
                self._initSampleData();
                if (callback) callback();
            }
        });
    },

    // 检测服务器是否可用
    _checkServer: function(callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', this._config.apiBase + '/stats', true);
        xhr.timeout = 2000;
        xhr.onload = function() {
            callback(true);
        };
        xhr.onerror = function() {
            callback(false);
        };
        xhr.ontimeout = function() {
            callback(false);
        };
        xhr.send();
    },

    // 从服务器加载数据
    _loadFromServer: function(callback) {
        var self = this;
        var pending = 4; // 需要加载的数据类型数
        var done = function() {
            pending--;
            if (pending === 0 && callback) callback();
        };

        // 加载资源
        this._fetch('/resources', function(data) {
            self._data.resources = data || [];
            done();
        });

        // 加载用户
        this._fetch('/users', function(data) {
            self._data.users = data || [];
            done();
        });

        // 加载评论
        this._fetch('/comments', function(data) {
            self._data.comments = data || [];
            done();
        });

        // 加载收藏
        this._fetch('/favorites', function(data) {
            self._data.favorites = data || [];
            done();
        });
    },

    // 通用 GET 请求
    _fetch: function(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', this._config.apiBase + url, true);
        xhr.onload = function() {
            if (xhr.status === 200) {
                try {
                    callback(JSON.parse(xhr.responseText));
                } catch (e) {
                    callback([]);
                }
            } else {
                callback([]);
            }
        };
        xhr.onerror = function() {
            callback([]);
        };
        xhr.send();
    },

    // 通用 POST 请求
    _post: function(url, data, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', this._config.apiBase + url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
            if (xhr.status === 200 || xhr.status === 201) {
                try {
                    callback(JSON.parse(xhr.responseText));
                } catch (e) {
                    callback({ success: true });
                }
            } else {
                try {
                    var err = JSON.parse(xhr.responseText);
                    callback({ error: err.error || '操作失败' });
                } catch (e) {
                    callback({ error: '操作失败' });
                }
            }
        };
        xhr.onerror = function() {
            callback({ error: '网络错误' });
        };
        xhr.send(JSON.stringify(data));
    },

    // 从 localStorage 加载数据
    _loadFromLocalStorage: function() {
        var saved = localStorage.getItem('DataStore');
        if (saved) {
            try {
                var data = JSON.parse(saved);
                this._data = data._data || this._data;
                this._counters = data._counters || this._counters;
            } catch (e) {
                console.log('数据加载失败，使用默认数据');
            }
        }
    },

    // 保存到 localStorage
    _saveToLocalStorage: function() {
        localStorage.setItem('DataStore', JSON.stringify({
            _data: this._data,
            _counters: this._counters
        }));
    },

    // 初始化示例用户（6个石油学院软件工程专业同学）
    _initSampleUsers: function() {
        if (this._data.users.length === 0) {
            this._counters.user = 6;
            this._data.users = [
                { id: "USR_000001", username: "廖同学", password: "admin", email: "liao@cupk.edu.cn", school: "cupk", college: "石油学院", major: "软件工程", grade: "2024" },
                { id: "USR_000002", username: "浩同学", password: "admin", email: "hao@cupk.edu.cn", school: "cupk", college: "石油学院", major: "软件工程", grade: "2024" },
                { id: "USR_000003", username: "泽同学", password: "admin", email: "ze@cupk.edu.cn", school: "cupk", college: "石油学院", major: "软件工程", grade: "2024" },
                { id: "USR_000004", username: "马同学", password: "admin", email: "ma@cupk.edu.cn", school: "cupk", college: "石油学院", major: "软件工程", grade: "2024" },
                { id: "USR_000005", username: "胡同学", password: "admin", email: "hu@cupk.edu.cn", school: "cupk", college: "石油学院", major: "软件工程", grade: "2024" },
                { id: "USR_000006", username: "高同学", password: "admin", email: "gao@cupk.edu.cn", school: "cupk", college: "石油学院", major: "软件工程", grade: "2024" }
            ];
        }
    },

    // 初始化示例数据
    _initSampleData: function() {
        if (this._data.resources.length === 0) {
            this._counters.resource = 12;
            this._data.resources = [
                { id: "RES_000001", title: "高等数学笔记", category: "math", description: "大一高等数学完整笔记整理，包含各章节重点公式和典型例题", uploader: "廖同学", uploaderId: "USR_000001", uploadTime: "2025-06-10", downloads: 128, views: 456, favorites: 45, fileName: "高等数学笔记.pdf", filePath: "files/math/高等数学笔记.pdf" },
                { id: "RES_000002", title: "线性代数资料", category: "math", description: "线性代数知识点总结与习题，含矩阵、行列式、特征值等", uploader: "浩同学", uploaderId: "USR_000002", uploadTime: "2025-06-09", downloads: 96, views: 234, favorites: 23, fileName: "线性代数资料.pdf", filePath: "files/math/线性代数资料.pdf" },
                { id: "RES_000003", title: "C语言程序设计教程", category: "cs", description: "C语言基础教程和示例代码，适合初学者入门", uploader: "泽同学", uploaderId: "USR_000003", uploadTime: "2025-06-08", downloads: 215, views: 567, favorites: 67, fileName: "C语言程序设计.pdf", filePath: "files/cs/C语言程序设计.pdf" },
                { id: "RES_000004", title: "数据结构与算法", category: "cs", description: "常见数据结构与算法实现，含代码示例", uploader: "马同学", uploaderId: "USR_000004", uploadTime: "2025-06-07", downloads: 87, views: 345, favorites: 34, fileName: "数据结构与算法.pdf", filePath: "files/cs/数据结构与算法.pdf" },
                { id: "RES_000005", title: "Python入门指南", category: "cs", description: "Python编程入门教程，含基础语法和实战项目", uploader: "胡同学", uploaderId: "USR_000005", uploadTime: "2025-06-06", downloads: 156, views: 423, favorites: 56, fileName: "Python入门指南.pdf", filePath: "files/cs/Python入门指南.pdf" },
                { id: "RES_000006", title: "大学物理公式汇总", category: "physics", description: "大学物理常用公式整理，力学、热学、电磁学全覆盖", uploader: "高同学", uploaderId: "USR_000006", uploadTime: "2025-06-05", downloads: 203, views: 512, favorites: 78, fileName: "大学物理公式汇总.pdf", filePath: "files/physics/大学物理公式汇总.pdf" },
                { id: "RES_000007", title: "电路分析基础", category: "physics", description: "电路分析学习资料，含电路定理和分析方法", uploader: "廖同学", uploaderId: "USR_000001", uploadTime: "2025-06-04", downloads: 432, views: 876, favorites: 89, fileName: "电路分析基础.pdf", filePath: "files/physics/电路分析基础.pdf" },
                { id: "RES_000008", title: "英语四六级词汇", category: "language", description: "四六级核心词汇表，分类记忆更高效", uploader: "浩同学", uploaderId: "USR_000002", uploadTime: "2025-06-03", downloads: 74, views: 198, favorites: 15, fileName: "英语四六级词汇.pdf", filePath: "files/language/英语四六级词汇.pdf" },
                { id: "RES_000009", title: "大学英语教程答案", category: "language", description: "大学英语教材习题答案，附详细解析", uploader: "泽同学", uploaderId: "USR_000003", uploadTime: "2025-06-02", downloads: 156, views: 432, favorites: 32, fileName: "大学英语教程答案.pdf", filePath: "files/language/大学英语教程答案.pdf" },
                { id: "RES_000010", title: "经济学原理笔记", category: "economics", description: "微观经济学与宏观经济学笔记，含图表分析", uploader: "马同学", uploaderId: "USR_000004", uploadTime: "2025-06-01", downloads: 203, views: 543, favorites: 54, fileName: "经济学原理笔记.pdf", filePath: "files/economics/经济学原理笔记.pdf" },
                { id: "RES_000011", title: "心理学概论", category: "humanities", description: "心理学基础知识点整理，含案例分析", uploader: "胡同学", uploaderId: "USR_000005", uploadTime: "2025-05-30", downloads: 98, views: 267, favorites: 21, fileName: "心理学概论.pdf", filePath: "files/humanities/心理学概论.pdf" },
                { id: "RES_000012", title: "中国近代史纲要", category: "humanities", description: "中国近代史重要事件时间线，重点事件梳理", uploader: "高同学", uploaderId: "USR_000006", uploadTime: "2025-05-29", downloads: 112, views: 321, favorites: 28, fileName: "中国近代史纲要.pdf", filePath: "files/humanities/中国近代史纲要.pdf" }
            ];
            
            // 初始化示例评论
            this._counters.comment = 5;
            this._data.comments = [
                { id: "CMT_000001", resourceId: "RES_000001", userId: "USR_000002", userName: "浩同学", content: "笔记非常详细，对复习帮助很大！", rating: 5, time: "2025-06-11 10:30", helpful: 12 },
                { id: "CMT_000002", resourceId: "RES_000001", userId: "USR_000003", userName: "泽同学", content: "高数救星，感谢分享！", rating: 5, time: "2025-06-10 15:20", helpful: 8 },
                { id: "CMT_000003", resourceId: "RES_000003", userId: "USR_000004", userName: "马同学", content: "代码示例很实用，推荐初学者看看", rating: 4, time: "2025-06-09 09:15", helpful: 15 },
                { id: "CMT_000004", resourceId: "RES_000006", userId: "USR_000005", userName: "胡同学", content: "公式总结得很全面，复习时省了不少时间", rating: 5, time: "2025-06-06 14:45", helpful: 20 },
                { id: "CMT_000005", resourceId: "RES_000010", userId: "USR_000001", userName: "廖同学", content: "经济学入门好资料，适合预习和复习", rating: 4, time: "2025-06-02 11:30", helpful: 6 }
            ];
            
            this._saveToLocalStorage();
        }
    },

    // 生成新ID
    generateId: function(type) {
        this._counters[type]++;
        var prefix = {
            resource: 'RES',
            user: 'USR',
            comment: 'CMT',
            favorite: 'FAV',
            file: 'FILE'
        }[type] || 'ID';
        return prefix + '_' + String(this._counters[type]).padStart(6, '0');
    },

    // 获取所有资源
    getAllResources: function() {
        return this._data.resources;
    },

    // 根据ID获取用户
    getUser: function(userId) {
        var user = this._data.users.find(function(u) { return u.id === userId; });
        if (user) return user;
        // 也支持通过用户名查找
        return this._data.users.find(function(u) { return u.username === userId; });
    },

    // 根据ID获取资源
    getResource: function(id) {
        return this._data.resources.find(function(r) { return r.id === id; });
    },

    // 根据ID获取资源（兼容旧格式ID）
    getResourceByAnyId: function(id) {
        var resource = this.getResource(id);
        if (resource) return resource;

        if (id && id.indexOf('upload_') === 0) {
            return this._data.resources.find(function(r) { return r.id === 'UPLOAD_' + id; });
        }

        if (id && id.indexOf('res_') === 0) {
            var num = id.replace('res_', '');
            var paddedNum = String(parseInt(num)).padStart(6, '0');
            return this._data.resources.find(function(r) { return r.id === 'RES_' + paddedNum; });
        }

        return null;
    },

    // 搜索资源
    searchResources: function(query, category) {
        var results = this._data.resources;

        if (query) {
            query = query.toLowerCase();
            results = results.filter(function(r) {
                return r.title.toLowerCase().indexOf(query) !== -1 ||
                       r.description.toLowerCase().indexOf(query) !== -1 ||
                       r.uploader.toLowerCase().indexOf(query) !== -1;
            });
        }

        if (category) {
            results = results.filter(function(r) { return r.category === category; });
        }

        return results;
    },

    // 添加资源
    addResource: function(data, callback) {
        var self = this;
        
        if (this._config.useServer) {
            this._post('/resources', data, function(result) {
                if (!result.error) {
                    self._data.resources.unshift(result);
                    if (callback) callback(result);
                } else {
                    alert(result.error);
                    if (callback) callback(null);
                }
            });
        } else {
            var newResource = {
                id: this.generateId('resource'),
                title: data.title || '未命名资料',
                category: data.category || 'other',
                description: data.description || '',
                uploader: data.uploader || '匿名',
                uploaderId: data.uploaderId || '',
                uploadTime: this._formatDate(new Date()),
                downloads: 0,
                views: 0,
                favorites: 0,
                fileName: data.fileName || '',
                filePath: data.filePath || '',
                fileSize: data.fileSize || 0,
                tags: data.tags || []
            };
            this._data.resources.unshift(newResource);
            this._saveToLocalStorage();
            if (callback) callback(newResource);
        }
    },

    // 更新资源
    updateResource: function(id, updates, callback) {
        var self = this;
        
        if (this._config.useServer) {
            var xhr = new XMLHttpRequest();
            xhr.open('PUT', this._config.apiBase + '/resources/' + id, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = function() {
                if (xhr.status === 200) {
                    var result = JSON.parse(xhr.responseText);
                    var index = self._data.resources.findIndex(function(r) { return r.id === id; });
                    if (index !== -1) {
                        self._data.resources[index] = result;
                    }
                    if (callback) callback(result);
                } else {
                    if (callback) callback(null);
                }
            };
            xhr.onerror = function() {
                if (callback) callback(null);
            };
            xhr.send(JSON.stringify(updates));
        } else {
            var index = this._data.resources.findIndex(function(r) { return r.id === id; });
            if (index !== -1) {
                Object.assign(this._data.resources[index], updates);
                this._saveToLocalStorage();
                if (callback) callback(this._data.resources[index]);
            } else {
                if (callback) callback(null);
            }
        }
    },

    // 增加下载次数
    incrementDownloads: function(id, callback) {
        if (this._config.useServer) {
            this._post('/resources/' + id + '/download', {}, function(result) {
                if (callback) callback(result);
            });
        } else {
            var resource = this.getResource(id);
            if (resource) {
                resource.downloads++;
                this._saveToLocalStorage();
            }
            if (callback) callback({ success: true, downloads: resource ? resource.downloads : 0 });
        }
    },

    // 增加浏览次数
    incrementViews: function(id, callback) {
        if (this._config.useServer) {
            this._post('/resources/' + id + '/view', {}, function(result) {
                if (callback) callback(result);
            });
        } else {
            var resource = this.getResource(id);
            if (resource) {
                resource.views++;
                this._saveToLocalStorage();
            }
            if (callback) callback({ success: true, views: resource ? resource.views : 0 });
        }
    },

    // 获取用户的资源
    getResourcesByUploader: function(uploaderId) {
        return this._data.resources.filter(function(r) { return r.uploaderId === uploaderId; });
    },

    // 获取相关推荐
    getRelatedResources: function(id, limit) {
        var resource = this.getResource(id);
        if (!resource) return [];

        limit = limit || 5;
        return this._data.resources
            .filter(function(r) { return r.id !== id && r.category === resource.category; })
            .slice(0, limit);
    },

    // 评论相关
    getComments: function(resourceId) {
        return this._data.comments.filter(function(c) { return c.resourceId === resourceId; });
    },

    addComment: function(data, callback) {
        var self = this;
        
        if (this._config.useServer) {
            this._post('/comments', data, function(result) {
                if (!result.error) {
                    self._data.comments.push(result);
                    if (callback) callback(result);
                } else {
                    alert(result.error);
                    if (callback) callback(null);
                }
            });
        } else {
            var comment = {
                id: this.generateId('comment'),
                resourceId: data.resourceId,
                userId: data.userId || '',
                userName: data.userName || '匿名',
                content: data.content,
                rating: data.rating || 0,
                time: this._formatDate(new Date()),
                helpful: 0
            };
            this._data.comments.push(comment);
            this._saveToLocalStorage();
            if (callback) callback(comment);
        }
    },

    // 收藏相关
    getUserFavorites: function(userId) {
        return this._data.favorites.filter(function(f) { return f.userId === userId; });
    },

    isFavorited: function(userId, resourceId) {
        return this._data.favorites.some(function(f) {
            return f.userId === userId && f.resourceId === resourceId;
        });
    },

    addFavorite: function(userId, resourceId, callback) {
        var self = this;
        
        if (this._config.useServer) {
            this._post('/favorites', { userId: userId, resourceId: resourceId }, function(result) {
                if (!result.error) {
                    self._data.favorites.push(result);
                    if (callback) callback(true);
                } else {
                    alert(result.error);
                    if (callback) callback(false);
                }
            });
        } else {
            if (!this.isFavorited(userId, resourceId)) {
                var favorite = {
                    id: this.generateId('favorite'),
                    userId: userId,
                    resourceId: resourceId,
                    time: this._formatDate(new Date())
                };
                this._data.favorites.push(favorite);

                var resource = this.getResource(resourceId);
                if (resource) {
                    resource.favorites++;
                }

                this._saveToLocalStorage();
                if (callback) callback(true);
            } else {
                if (callback) callback(false);
            }
        }
    },

    removeFavorite: function(userId, resourceId, callback) {
        var self = this;
        
        if (this._config.useServer) {
            var xhr = new XMLHttpRequest();
            xhr.open('DELETE', this._config.apiBase + '/favorites/' + userId + '/' + resourceId, true);
            xhr.onload = function() {
                if (xhr.status === 200) {
                    var index = self._data.favorites.findIndex(function(f) {
                        return f.userId === userId && f.resourceId === resourceId;
                    });
                    if (index !== -1) {
                        self._data.favorites.splice(index, 1);
                    }
                    if (callback) callback(true);
                } else {
                    if (callback) callback(false);
                }
            };
            xhr.onerror = function() {
                if (callback) callback(false);
            };
            xhr.send();
        } else {
            var index = this._data.favorites.findIndex(function(f) {
                return f.userId === userId && f.resourceId === resourceId;
            });
            if (index !== -1) {
                this._data.favorites.splice(index, 1);

                var resource = this.getResource(resourceId);
                if (resource && resource.favorites > 0) {
                    resource.favorites--;
                }

                this._saveToLocalStorage();
                if (callback) callback(true);
            } else {
                if (callback) callback(false);
            }
        }
    },

    // 获取统计数据
    getStats: function() {
        var totalDownloads = 0;
        var totalViews = 0;
        this._data.resources.forEach(function(r) {
            totalDownloads += r.downloads || 0;
            totalViews += r.views || 0;
        });
        return {
            resourceCount: this._data.resources.length,
            userCount: this._data.users.length,
            commentCount: this._data.comments.length,
            totalDownloads: totalDownloads,
            totalViews: totalViews
        };
    },

    // 重置数据
    reset: function() {
        localStorage.removeItem('DataStore');
        this._data = { resources: [], users: [], comments: [], favorites: [] };
        this._counters = { resource: 0, user: 0, comment: 0, favorite: 0 };
        this._initSampleUsers();
        this._initSampleData();
    },

    // 格式化日期
    _formatDate: function(date) {
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, '0');
        var day = String(date.getDate()).padStart(2, '0');
        var hour = String(date.getHours()).padStart(2, '0');
        var minute = String(date.getMinutes()).padStart(2, '0');
        return year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
    },

    // 判断是否使用服务器模式
    isServerMode: function() {
        return this._config.useServer;
    }
};
