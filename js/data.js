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
        humanities: "人文",
        clubs: "社团",
        life: "生活"
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

        // 超时保护：1秒后强制初始化（确保服务器检测失败时也能工作）
        setTimeout(function() {
            if (self._data.resources.length === 0) {
                console.log('超时保护：强制初始化数据');
                self._loadFromLocalStorage();
                self._initSampleUsers();
                self._initSampleData();
            }
        }, 1000);
    },

    // 检测服务器是否可用
    _checkServer: function(callback) {
        // 如果是本地文件模式（file:// 协议），直接使用本地模式，跳过服务器检测
        if (window.location.protocol === 'file:' || window.location.origin === 'null') {
            console.log('本地文件模式，跳过服务器检测');
            callback(false);
            return;
        }

        var xhr = new XMLHttpRequest();
        var hasResponded = false;
        var respond = function(available) {
            if (!hasResponded) {
                hasResponded = true;
                callback(available);
            }
        };

        xhr.open('GET', this._config.apiBase + '/stats', true);
        xhr.timeout = 2000;
        xhr.onload = function() {
            respond(true);
        };
        xhr.onerror = function() {
            respond(false);
        };
        xhr.ontimeout = function() {
            respond(false);
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
            this._counters.resource = 32;
            this._data.resources = [
                // ===== 课程学习资料 =====
                { id: "RES_000001", title: "高等数学笔记", category: "math", description: "大一高等数学完整笔记整理，包含各章节重点公式和典型例题", uploader: "廖同学", uploaderId: "USR_000001", uploadTime: "2025-06-10 14:30", downloads: 128, views: 456, favorites: 45, fileName: "gaoshu-notes.html", filePath: "files/math/gaoshu-notes.html", fileSize: 5242880, tags: ["高等数学", "笔记", "期末复习"], content: "<h3>第一章 函数与极限</h3><p>本章主要介绍了函数的基本概念、极限的定义与性质，以及连续函数的特性。</p><h4>重点公式：</h4><ul><li>极限的运算法则：若lim f(x)=A, lim g(x)=B，则lim [f(x)±g(x)]=A±B</li><li>两个重要极限：lim(x→0) sinx/x=1, lim(x→∞) (1+1/x)^x=e</li></ul><h3>第二章 导数与微分</h3><p>导数是微分学的核心概念，本章详细讲解了导数的定义、几何意义以及各种求导法则。</p><h4>常用求导公式：</h4><ul><li>(x^n)' = nx^(n-1)</li><li>(sinx)' = cosx, (cosx)' = -sinx</li><li>(e^x)' = e^x, (lnx)' = 1/x</li></ul><h3>第三章 微分中值定理</h3><p>费马定理、罗尔定理、拉格朗日中值定理、柯西中值定理构成了微分学的基本定理体系。</p><h3>第四章 不定积分</h3><p>不定积分是求导的逆运算，本章总结了换元积分法和分部积分法两大基本技巧。</p><h3>第五章 定积分</h3><p>定积分的几何意义是曲边梯形的面积，微积分基本定理建立了定积分与原函数的联系。</p><h3>典型例题精选</h3><p>本笔记包含各章节典型例题50余道，附详细解题步骤，涵盖极限计算、导数应用、积分求解等高频考点。</p>" },

                { id: "RES_000002", title: "线性代数资料", category: "math", description: "线性代数知识点总结与习题，含矩阵、行列式、特征值等", uploader: "浩同学", uploaderId: "USR_000002", uploadTime: "2025-06-09 09:15", downloads: 96, views: 234, favorites: 23, fileName: "linear-algebra.html", filePath: "files/math/linear-algebra.html", fileSize: 3145728, tags: ["线性代数", "矩阵", "期末复习"], content: "<h3>第一章 行列式</h3><p>行列式是线性代数的基础概念，本章介绍了二阶、三阶行列式的计算方法，以及n阶行列式的展开定理。</p><h4>核心内容：</h4><ul><li>行列式的性质：转置值不变、行（列）公因子可提出、对换变号</li><li>行列式按行（列）展开：余子式、代数余子式</li></ul><h3>第二章 矩阵</h3><p>矩阵是线性代数的主要研究对象，本章涵盖矩阵的运算、逆矩阵、秩等核心概念。</p><h4>重点公式：</h4><ul><li>(AB)^T = B^T A^T</li><li>(AB)^(-1) = B^(-1) A^(-1)</li><li>r(AB) ≤ min(r(A), r(B))</li></ul><h3>第三章 向量与线性方程组</h3><p>向量组的线性相关性是线性代数的难点之一，克拉默法则和齐次/非齐次线性方程组的解的结构是考试重点。</p><h3>第四章 特征值与特征向量</h3><p>特征值理论在工程和物理中有广泛应用，本章介绍了特征值、特征向量的求法以及矩阵的相似对角化。</p><h3>第五章 二次型</h3><p>本章讨论了二次型的标准化问题，包括配方法化标准和正交变换化标准。</p>" },

                { id: "RES_000003", title: "C语言程序设计教程", category: "cs", description: "C语言基础教程和示例代码，适合初学者入门", uploader: "泽同学", uploaderId: "USR_000003", uploadTime: "2025-06-08 16:45", downloads: 215, views: 567, favorites: 67, fileName: "c-language.html", filePath: "files/cs/c-language.html", fileSize: 8388608, tags: ["C语言", "编程入门", "代码示例"], content: "<h3>第一章 C语言概述</h3><p>C语言是一种面向过程的计算机程序设计语言，由丹尼斯·里奇在1972年于贝尔实验室开发。</p><h4>第一个C程序：</h4><pre>#include &lt;stdio.h&gt;\nint main() {\n    printf(\"Hello, World!\\n\");\n    return 0;\n}</pre><h3>第二章 数据类型与运算符</h3><p>C语言支持多种数据类型，包括整型、浮点型、字符型等。运算符包括算术运算符、关系运算符、逻辑运算符等。</p><h3>第三章 控制结构</h3><p>顺序结构、选择结构（if-else、switch）、循环结构（while、do-while、for）是程序的三种基本结构。</p><h3>第四章 数组与字符串</h3><p>数组是一组相同类型数据的集合，字符串在C语言中以字符数组的形式存储，以'\\0'结尾。</p><h3>第五章 函数</h3><p>函数是C语言的基本组成单元，本章介绍了函数的定义、调用、参数传递以及递归调用。</p><h3>第六章 指针</h3><p>指针是C语言的精髓所在，本章详细讲解了指针的概念、运算以及与数组、函数的关系。</p><h3>第七章 结构体与文件</h3><p>结构体用于描述复杂数据类型，文件操作包括打开、读取、写入、关闭等基本操作。</p>" },

                { id: "RES_000004", title: "数据结构与算法", category: "cs", description: "常见数据结构与算法实现，含代码示例", uploader: "马同学", uploaderId: "USR_000004", uploadTime: "2025-06-07 11:20", downloads: 87, views: 345, favorites: 34, fileName: "data-structures.html", filePath: "files/cs/data-structures.html", fileSize: 6291456, tags: ["数据结构", "算法", "代码实现"], content: "<h3>第一章 线性表</h3><p>线性表是最基本的数据结构，包括顺序表和链表两种实现方式。</p><h4>顺序表操作时间复杂度：</h4><ul><li>按值查找：O(n)</li><li>按下标访问：O(1)</li><li>插入/删除：O(n)（平均）</li></ul><h3>第二章 栈与队列</h3><p>栈是后进先出（LIFO）的数据结构，队列是先进先出（FIFO）的数据结构。</p><h4>应用场景：</h4><ul><li>栈：括号匹配、表达式求值、函数调用栈</li><li>队列：任务调度、广度优先搜索</li></ul><h3>第三章 树与二叉树</h3><p>二叉树是每个节点最多有两个子树的树结构，本章介绍了二叉树的遍历方法：前序、中序、后序和层序遍历。</p><h3>第四章 图</h3><p>图是一种复杂的非线性结构，本章介绍了图的存储结构（邻接矩阵、邻接表）和遍历算法（DFS、BFS）。</p><h3>第五章 查找与排序</h3><p>常见的查找算法包括顺序查找、二分查找、哈希查找。排序算法包括冒泡排序、快速排序、归并排序、堆排序等。</p><h4>时间复杂度对比：</h4><ul><li>O(n²)：冒泡、选择、插入</li><li>O(nlogn)：快排、归并、堆排</li><li>O(n)：计数、桶排序</li></ul>" },

                { id: "RES_0000041", title: "数据库系统概论", category: "cs", description: "数据库系统概论第6版教材，数据库经典教材，含完整书签和目录", uploader: "廖同学", uploaderId: "USR_000001", uploadTime: "2026-05-26 10:00", downloads: 156, views: 423, favorites: 45, fileName: "数据库系统概论(第6版).pdf", filePath: "files/cs/数据库系统概论(第6版).pdf", fileSize: 18874368, tags: ["数据库", "教材", "第6版"], content: "<h3>数据库系统概论（第6版）</h3><p>本书是数据库领域的经典教材，系统介绍了数据库系统的基本概念、原理和技术。</p><h3>内容简介</h3><p>本书全面介绍了数据库系统的基本概念、关系数据库理论、SQL语言、数据库设计、数据库恢复技术、并发控制、完整性约束、安全性等内容。</p><h3>目录</h3><ul><li>第一章 绪论</li><li>第二章 关系数据库</li><li>第三章 SQL</li><li>第四章 数据库安全性</li><li>第五章 数据库完整性</li><li>第六章 关系数据理论</li><li>第七章 数据库设计</li><li>第八章 关系查询处理和优化</li><li>第九章 恢复技术</li><li>第十章 并发控制</li></ul><h3>推荐理由</h3><p>本书适合计算机科学与技术、软件工程等专业学生使用，是考研和就业面试的必备参考书。</p>" },

                { id: "RES_000005", title: "Python入门指南", category: "cs", description: "Python编程入门教程，含基础语法和实战项目", uploader: "胡同学", uploaderId: "USR_000005", uploadTime: "2025-06-06 08:30", downloads: 156, views: 423, favorites: 56, fileName: "python-guide.html", filePath: "files/cs/python-guide.html", fileSize: 7340032, tags: ["Python", "编程入门", "实战项目"], content: "<h3>第一章 Python简介</h3><p>Python是一种高级解释型编程语言，由Guido van Rossum于1991年创建。Python以简洁易读的语法著称，适合初学者入门。</p><h3>第二章 基本语法</h3><p>Python使用缩进来表示代码块，无需使用大括号。变量无需声明类型，使用前直接赋值即可。</p><h4>基本语法示例：</h4><pre># 变量赋值\nname = \"Alice\"\nage = 20\n\n# 列表操作\nfruits = [\"apple\", \"banana\", \"orange\"]\nfruits.append(\"grape\")\n\n# 条件判断\nif age >= 18:\n    print(\"成年人\")\nelse:\n    print(\"未成年人\")</pre><h3>第三章 函数与模块</h3><p>函数使用def关键字定义，模块是一系列函数的集合，通过import关键字引入。</p><h3>第四章 面向对象编程</h3><p>Python支持面向对象编程，类使用class关键字定义，支持继承、多态等特性。</p><h3>第五章 实战项目</h3><p>本章包含三个实战项目：学生成绩管理系统、图片批量处理工具、简易爬虫程序。</p>" },

                { id: "RES_000006", title: "大学物理公式汇总", category: "physics", description: "大学物理常用公式整理，力学、热学、电磁学全覆盖", uploader: "高同学", uploaderId: "USR_000006", uploadTime: "2025-06-05 15:00", downloads: 203, views: 512, favorites: 78, fileName: "physics-formulas.html", filePath: "files/physics/physics-formulas.html", fileSize: 2621440, tags: ["大学物理", "公式", "复习资料"], content: "<h3>力学部分</h3><h4>运动学：</h4><ul><li>速度：v = v₀ + at</li><li>位移：s = v₀t + ½at²</li><li>速度-位移关系：v² - v₀² = 2as</li></ul><h4>动力学：</h4><ul><li>牛顿第二定律：F = ma</li><li>动量定理：Ft = mv - mv₀</li><li>动能定理：W = ½mv² - ½mv₀²</li></ul><h3>热学部分</h3><h4>理想气体状态方程：</h4><p>PV = nRT</p><h4>热力学第一定律：</h4><p>ΔU = Q + W（吸收热量Q为正，对外做功W为负）</p><h3>电磁学部分</h3><h4>库仑定律：</h4><p>F = kq₁q₂/r²</p><h4>欧姆定律：</h4><p>I = U/R</p><h4>法拉第电磁感应定律：</h4><p>ε = -dΦ/dt</p><h3>光学部分</h3><p>干涉、衍射、偏振是波动光学的三大基本现象。</p><h3>近代物理部分</h3><p>相对论质能方程：E = mc²<br>光电效应方程：Ek = hν - W</p>" },

                { id: "RES_000007", title: "电路分析基础", category: "physics", description: "电路分析学习资料，含电路定理和分析方法", uploader: "廖同学", uploaderId: "USR_000001", uploadTime: "2025-06-04 10:45", downloads: 432, views: 876, favorites: 89, fileName: "circuit-analysis.html", filePath: "files/physics/circuit-analysis.html", fileSize: 3670016, tags: ["电路", "电路分析", "定理"], content: "<h3>第一章 电路基本概念</h3><p>电路由电源、负载、导线和控制元件组成。本章介绍了电流、电压、电功率等基本物理量的定义和方向约定。</p><h3>第二章 电路定律</h3><h4>欧姆定律：</h4><p>U = IR，电流与电压成正比，与电阻成反比。</p><h4>基尔霍夫定律：</h4><ul><li>KCL（电流定律）：流入节点的电流之和等于流出节点的电流之和</li><li>KVL（电压定律）：沿任意闭合回路，所有元件电压的代数和为零</li></ul><h3>第三章 电路分析方法</h3><p>介绍了支路电流法、节点电压法、网孔电流法、叠加定理、戴维南定理等分析方法。</p><h3>第四章 动态电路</h3><p>一阶电路（RC、RL电路）的暂态分析，换路定则，时间常数τ的物理意义。</p><h3>第五章 正弦交流电路</h3><p>相量法分析正弦交流电路，阻抗、导纳的概念，复功率的计算。</p>" },

                { id: "RES_000008", title: "英语四六级词汇", category: "language", description: "四六级核心词汇表，分类记忆更高效", uploader: "浩同学", uploaderId: "USR_000002", uploadTime: "2025-06-03 07:00", downloads: 74, views: 198, favorites: 15, fileName: "cet-vocabulary.html", filePath: "files/language/cet-vocabulary.html", fileSize: 1048576, tags: ["四六级", "词汇", "英语"], content: "<h3>高频核心词汇表</h3><p>本词汇表精选四六级考试高频词汇2000+，按主题分类编排，标注词频和重要程度。</p><h3>词汇分类：</h3><ul><li><b>教育类</b>：education, academic, scholar, campus, curriculum</li><li><b>科技类</b>：technology, innovation, digital, artificial intelligence</li><li><b>经济类</b>：economy, financial, investment, commerce, market</li><li><b>环境类</b>：environment, climate, pollution, sustainable</li><li><b>社会类</b>：society, culture, tradition, population</li></ul><h3>记忆方法：</h3><p>建议采用词根词缀记忆法、联想记忆法、语境记忆法相结合的方式，提高记忆效率。</p><h3>常考短语：</h3><ul><li>account for - 占...比例；解释</li><li>adapt to - 适应</li><li>attribute to - 归因于</li><li>carry out - 执行，实施</li><li>contribute to - 贡献；导致</li></ul>" },

                { id: "RES_000009", title: "大学英语教程答案", category: "language", description: "大学英语教材习题答案，附详细解析", uploader: "泽同学", uploaderId: "USR_000003", uploadTime: "2025-06-02 14:20", downloads: 156, views: 432, favorites: 32, fileName: "english-answers.html", filePath: "files/language/english-answers.html", fileSize: 2097152, tags: ["英语", "答案", "习题解析"], content: "<h3>教材各单元习题答案</h3><p>本资料包含大学英语综合教程1-4册所有单元的课后习题答案及详细解析。</p><h3>使用说明：</h3><ol><li>建议先独立完成习题，再对照答案检查</li><li>阅读理解部分附有文章大意和重点词汇解析</li><li>翻译题提供多种参考译文供参考</li></ol><h3>重点单元解析：</h3><h4>Unit 1 - College Life</h4><p>重点词汇：campus, faculty, curriculum, extracurricular</p><p>重点句型：It is + adj. + to do sth. / The + n. + is + that...</p><h4>Unit 3 - Environment Protection</h4><p>阅读技巧：识别文章中的因果关系词（therefore, thus, consequently）</p>" },

                { id: "RES_000010", title: "经济学原理笔记", category: "economics", description: "微观经济学与宏观经济学笔记，含图表分析", uploader: "马同学", uploaderId: "USR_000004", uploadTime: "2025-06-01 16:00", downloads: 203, views: 543, favorites: 54, fileName: "economics-notes.html", filePath: "files/economics/economics-notes.html", fileSize: 4718592, tags: ["经济学", "微观", "宏观"], content: "<h3>微观经济学部分</h3><h4>第一章 供求理论</h4><p>需求定理：价格上升，需求量减少（其他条件不变）<br>供给定理：价格上升，供给量增加（其他条件不变）</p><h4>第二章 消费者行为理论</h4><p>基数效用论：边际效用递减规律<br>序数效用论：无差异曲线与预算约束线</p><h4>第三章 生产者行为理论</h4><p>短期生产函数：边际报酬递减规律<br>长期生产函数：规模经济与规模不经济</p><h3>宏观经济学部分</h3><h4>国民收入核算</h4><p>GDP = C + I + G + (X - M)<br>（消费 + 投资 + 政府购买 + 净出口）</p><h4>凯恩斯主义</h4><p>乘数效应：政府支出增加会带来成倍的国民收入增加<br>流动性偏好理论：人们偏好持有货币的三个动机</p><h4>通货膨胀</h4><p>通胀率 = (本期CPI - 上期CPI) / 上期CPI × 100%</p>" },

                { id: "RES_000011", title: "心理学概论", category: "humanities", description: "心理学基础知识点整理，含案例分析", uploader: "胡同学", uploaderId: "USR_000005", uploadTime: "2025-05-30 11:30", downloads: 98, views: 267, favorites: 21, fileName: "psychology.html", filePath: "files/humanities/psychology.html", fileSize: 3145728, tags: ["心理学", "行为", "认知"], content: "<h3>第一章 心理学概述</h3><p>心理学是研究人的心理现象及其规律的科学，包括认知、情感、意志三个方面。</p><h3>第二章 认知过程</h3><h4>感觉与知觉：</h4><ul><li>感觉：直接作用于感觉器官的客观事物的个别属性</li><li>知觉：人脑对直接作用于感觉器官的事物的整体属性的反映</li></ul><h4>记忆：</h4><p>瞬时记忆 → 短时记忆 → 长时记忆<br>遗忘曲线：艾宾浩斯遗忘规律</p><h3>第三章 情绪与情感</h3><p>情绪的基本形式：喜、怒、哀、惧<br>情绪调节策略：认知重评、表达抑制</p><h3>第四章 人格心理学</h3><p>人格结构：本我、自我、超我（弗洛伊德）<br>气质类型：胆汁质、多血质、粘液质、抑郁质</p><h3>第五章 社会心理学</h3><p>从众、服从、偏见是社会影响的主要形式。社会助长与社会懈怠效应说明了他人存在对个体行为的影响。</p>" },

                { id: "RES_000012", title: "中国近代史纲要", category: "humanities", description: "中国近代史重要事件时间线，重点事件梳理", uploader: "高同学", uploaderId: "USR_000006", uploadTime: "2025-05-29 09:45", downloads: 112, views: 321, favorites: 28, fileName: "modern-history.html", filePath: "files/humanities/modern-history.html", fileSize: 2359296, tags: ["历史", "中国近代史", "纲要"], content: "<h3>第一章 鸦片战争与半殖民地半封建社会的形成</h3><p>1840年鸦片战争是中国近代史的开端。《南京条约》的签订使中国开始沦为半殖民地半封建社会。</p><h4>重要条约：</h4><ul><li>1842年《南京条约》- 五口通商、割让香港岛</li><li>1858年《天津条约》- 长江航行权</li><li>1860年《北京条约》- 承认《天津条约》</li></ul><h3>第二章 太平天国运动</h3><p>1851-1864年，洪秀全领导的太平天国运动是中国历史上规模最大的农民战争。</p><h3>第三章 洋务运动与戊戌变法</h3><p>洋务运动：\"师夷长技以制夷\"，创办近代军事工业和民用工业<br>戊戌变法：1898年康有为、梁启超推动的资产阶级改良运动</p><h3>第四章 辛亥革命</h3><p>1911年辛亥革命推翻了清王朝统治，建立了中华民国。孙中山先生是伟大的民主革命先行者。</p><h3>第五章 五四运动与中国共产党成立</h3><p>1919年五四运动是中国新民主主义革命的开端。1921年中国共产党成立，中国革命面貌焕然一新。</p>" },

                // ===== 社团资料 =====
                { id: "RES_000013", title: "学生会纳新报名表", category: "clubs", description: "中国石油大学（北京）克拉玛依校区学生会纳新报名表，包含个人基本信息、特长爱好、报名部门等信息", uploader: "马同学", uploaderId: "USR_000004", uploadTime: "2025-09-01 08:00", downloads: 67, views: 234, favorites: 12, fileName: "student-union-form.html", filePath: "files/clubs/student-union-form.html", fileSize: 51200, tags: ["学生会", "纳新", "报名表"], content: "<h3>中国石油大学（北京）克拉玛依校区学生会</h3><h4>2025-2026学年纳新报名表</h4><h3>一、基本信息</h3><table border='1' cellpadding='8' style='border-collapse:collapse;width:100%'><tr><td>姓名</td><td></td><td>性别</td><td></td></tr><tr><td>学号</td><td></td><td>学院</td><td></td></tr><tr><td>专业</td><td></td><td>班级</td><td></td></tr><tr><td>联系方式</td><td></td><td>政治面貌</td><td></td></tr></table><h3>二、特长爱好</h3><p>□ 文艺 □ 体育 □ 写作 □ 摄影 □ 演讲 □ 计算机 □ 组织协调 □ 其他：______</p><h3>三、报名部门（可多选）</h3><ul><li>□ 主席团 □ 秘书处 □ 组织部 □ 宣传部</li><li>□ 学术部 □ 文艺部 □ 体育部 □ 外联部</li><li>□ 实践部 □ 权益部 □ 新媒体中心</li></ul><h3>四、个人简介</h3><p>（请简要介绍自己，包括获奖经历、社会实践等）</p><p>_________________________________________________</p><p>_________________________________________________</p><h3>五、入会承诺</h3><p>本人承诺以上信息真实有效，愿意遵守学生会的各项规章制度，积极参加学生会组织的各项活动。</p><p>签名：__________ 日期：__________</p>" },

                { id: "RES_000014", title: "研究生会活动策划模板", category: "clubs", description: "研究生会各类活动策划案的标准模板，包含晚会、讲座、比赛等多种类型", uploader: "高同学", uploaderId: "USR_000006", uploadTime: "2025-08-15 14:00", downloads: 45, views: 156, favorites: 8, fileName: "event-template.html", filePath: "files/clubs/event-template.html", fileSize: 45056, tags: ["研究生会", "活动策划", "模板"], content: "<h3>活动策划案模板</h3><h4>（适用于晚会、讲座、比赛、志愿服务等各类活动）</h4><h3>一、活动基本信息</h3><table border='1' cellpadding='8' style='border-collapse:collapse;width:100%'><tr><td>活动名称</td><td></td></tr><tr><td>活动类型</td><td>□ 学术讲座 □ 文娱活动 □ 体育比赛 □ 社会实践 □ 其他</td></tr><tr><td>主办单位</td><td></td></tr><tr><td>协办单位</td><td></td></tr><tr><td>活动负责人</td><td></td><td>联系方式</td><td></td></tr><tr><td>活动时间</td><td></td><td>活动地点</td><td></td></tr></table><h3>二、活动背景与目的</h3><p>（简要说明举办本次活动的背景和意义）</p><h3>三、活动内容与流程</h3><table border='1' cellpadding='8' style='border-collapse:collapse;width:100%'><tr><td>时间</td><td>环节</td><td>负责人</td><td>备注</td></tr><tr><td></td><td></td><td></td><td></td></tr></table><h3>四、经费预算</h3><table border='1' cellpadding='8' style='border-collapse:collapse;width:100%'><tr><td>项目</td><td>单价</td><td>数量</td><td>金额</td></tr><tr><td></td><td></td><td></td><td></td></tr><tr><td colspan='3'>合计</td><td></td></tr></table><h3>五、应急预案</h3><p>（针对可能出现的突发情况制定应对方案）</p><h3>六、宣传方案</h3><p>（线上宣传、线下宣传的具体安排）</p>" },

                { id: "RES_000015", title: "社团联合会管理制度", category: "clubs", description: "克拉玛依校区社团联合会章程及管理制度，包含社团注册、考核、奖惩等规定", uploader: "马同学", uploaderId: "USR_000004", uploadTime: "2025-07-20 10:30", downloads: 34, views: 89, favorites: 5, fileName: "club-rules.html", filePath: "files/clubs/club-rules.html", fileSize: 307200, tags: ["社团", "管理", "制度"], content: "<h3>中国石油大学（北京）克拉玛依校区</h3><h2>社团联合会管理制度</h2><h3>第一章 总则</h3><p>第一条 为加强校区学生社团管理，促进社团健康发展，丰富校园文化生活，特制定本制度。</p><p>第二条 学生社团联合会是在校团委指导下，对全校学生社团进行管理与服务的学生组织。</p><h3>第二章 社团注册</h3><p>第三条 新社团成立须满足以下条件：</p><ul><li>有10名以上学生发起，发起人须为在校本科生或研究生</li><li>有规范的社团章程</li><li>有至少一名指导教师</li><li>有固定的社团活动场所或形式</li></ul><p>第四条 社团注册时间为每学年开学后一个月内。</p><h3>第三章 考核制度</h3><p>第五条 社团联合会每学期对各社团进行考核，考核内容包括：</p><ul><li>活动开展情况（次数、质量、参与人数）</li><li>财务管理情况</li><li>会员满意度</li><li>遵守法规和校纪校规情况</li></ul><h3>第四章 奖惩制度</h3><p>第六条 对表现优秀的社团给予表彰：</p><ul><li>年度\"优秀社团\"称号</li><li>优先推荐参加校级及以上评比</li><li>活动经费倾斜支持</li></ul><p>第七条 对违规社团，视情节轻重给予警告、限期整改、暂停活动、取缔社团资格等处分。</p>" },

                { id: "RES_000016", title: "青年志愿者协会入会指南", category: "clubs", description: "校青协入会流程、志愿服务时长记录办法及常见问题解答", uploader: "胡同学", uploaderId: "USR_000005", uploadTime: "2025-09-05 09:00", downloads: 89, views: 345, favorites: 23, fileName: "volunteer-guide.html", filePath: "files/clubs/volunteer-guide.html", fileSize: 204800, tags: ["青协", "志愿者", "入会指南"], content: "<h3>校青年志愿者协会入会指南</h3><h4>传递爱心，奉献社会</h4><h3>一、入会条件</h3><ul><li>具有本校学籍的全日制本科生或研究生</li><li>品学兼优，热心公益事业</li><li>身体健康，能适应志愿服务工作</li><li>遵守协会章程，按时参加志愿服务活动</li></ul><h3>二、入会流程</h3><ol><li>关注\"CUPK青协\"微信公众号，获取报名信息</li><li>填写电子入会申请表（每年9月开放申请）</li><li>参加志愿者见面会，了解协会文化</li><li>完成第一次志愿服务活动</li><li>正式成为注册志愿者，颁发志愿者证</li></ol><h3>三、志愿服务时长记录</h3><p>志愿服务时长是志愿者服务的重要记录，请按以下步骤操作：</p><ol><li>活动前在\"志愿北京\"平台报名</li><li>活动中签到签退</li><li>活动后由负责人录入时长</li><li>可在平台查询和打印志愿服务证明</li></ol><h3>四、常见问题解答</h3><p><b>Q: 志愿服务时长有什么用？</b><br>A: 可作为综合素质评价、奖学金评定、推优入党的参考依据。</p><p><b>Q: 如何参加校级大型志愿服务活动？</b><br>A: 关注协会公告，优先报名参加过活动的老志愿者。</p><p><b>Q: 服务时长有最低要求吗？</b><br>A: 每学期至少参加2次志愿服务活动（累计不少于10小时）。</p>" },

                { id: "RES_000017", title: "2025年志愿服务活动一览", category: "clubs", description: "本年度计划开展的志愿服务活动清单，包含活动时间、内容、招募人数等信息", uploader: "胡同学", uploaderId: "USR_000005", uploadTime: "2025-01-10 11:00", downloads: 123, views: 567, favorites: 34, fileName: "volunteer-activities.html", filePath: "files/clubs/volunteer-activities.html", fileSize: 409600, tags: ["志愿服务", "活动", "2025年"], content: "<h3>2025年志愿服务活动一览</h3><h4>克拉玛依校区青年志愿者协会</h4><h3>上半年活动</h3><table border='1' cellpadding='8' style='border-collapse:collapse;width:100%'><tr><td>时间</td><td>活动名称</td><td>内容简介</td><td>招募人数</td></tr><tr><td>3月</td><td>雷锋月主题活动</td><td>社区服务、校园清洁</td><td>100人</td></tr><tr><td>4月</td><td>清明祭英烈</td><td>烈士陵园祭扫</td><td>50人</td></tr><tr><td>5月</td><td>五四青年志愿服务周</td><td>各类便民服务</td><td>150人</td></tr><tr><td>6月</td><td>毕业季志愿服务</td><td>协助毕业生离校</td><td>80人</td></tr></table><h3>下半年活动</h3><table border='1' cellpadding='8' style='border-collapse:collapse;width:100%'><tr><td>时间</td><td>活动名称</td><td>内容简介</td><td>招募人数</td></tr><tr><td>9月</td><td>迎新志愿服务</td><td>新生报到引导</td><td>200人</td></tr><tr><td>10月</td><td>重阳节敬老服务</td><td>敬老院慰问演出</td><td>60人</td></tr><tr><td>11月</td><td>国际志愿者日活动</td><td>志愿者嘉年华</td><td>120人</td></tr><tr><td>12月</td><td>年终总结表彰大会</td><td>优秀志愿者表彰</td><td>全体会员</td></tr></table><h3>长期项目</h3><ul><li>社区帮扶：每周六上午 克拉玛依区各社区</li><li>图书馆志愿服务：每周三下午 校区图书馆</li><li>支教服务：每周二、四下午 定点中小学</li></ul>" },

                { id: "RES_000018", title: "机器人协会技术培训资料", category: "clubs", description: "机器人协会内部培训资料，含Arduino基础、单片机入门、传感器原理等", uploader: "泽同学", uploaderId: "USR_000003", uploadTime: "2025-10-12 16:00", downloads: 156, views: 423, favorites: 45, fileName: "robotics-training.html", filePath: "files/clubs/robotics-training.html", fileSize: 5242880, tags: ["机器人", "Arduino", "单片机"], content: "<h3>机器人协会技术培训系列</h3><h4>Arduino基础 + 单片机入门 + 传感器应用</h4><h3>第一章 Arduino基础</h3><p>Arduino是一款开源的单片机开发板，适合初学者入门嵌入式开发。</p><h4>开发环境搭建：</h4><ol><li>下载Arduino IDE</li><li>安装USB驱动</li><li>连接开发板</li></ol><h4>基础实验：</h4><pre>void setup() {\n  pinMode(LED_BUILTIN, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(LED_BUILTIN, HIGH);\n  delay(1000);\n  digitalWrite(LED_BUILTIN, LOW);\n  delay(1000);\n}</pre><h3>第二章 单片机入门（STM32）</h3><p>STM32是一款基于ARM Cortex-M内核的32位微控制器，性能更强，适合进阶学习。</p><h3>第三章 传感器应用</h3><ul><li>温度传感器：DHT11</li><li>距离传感器：HC-SR04超声波模块</li><li>运动传感器：MPU6050六轴加速度计</li><li>颜色传感器：TCS34725</li></ul><h3>第四章 电机控制</h3><p>PWM调速原理、直流电机驱动（TB6612FNG）、舵机控制（SG90）</p><h3>第五章 循迹小车项目</h3><p>综合运用红外巡线传感器和电机控制，实现自主循迹功能。</p>" },

                { id: "RES_000019", title: "计算机协会招新宣传单", category: "clubs", description: "计算机协会招新宣传资料，包含协会介绍、品牌活动、往届荣誉等内容", uploader: "浩同学", uploaderId: "USR_000002", uploadTime: "2025-09-03 10:00", downloads: 78, views: 289, favorites: 19, fileName: "csclub-recruit.html", filePath: "files/clubs/csclub-recruit.html", fileSize: 1536000, tags: ["计算机协会", "招新", "宣传"], content: "<h2>计算机协会 2025年秋季招新</h2><h3>🚀 期待志同道合的你</h3><h3>关于我们</h3><p>计算机协会成立于2015年，是校区成立最早、规模最大的技术类学生社团。协会致力于为同学们提供计算机技术交流和学习的平台。</p><h3>我们的荣誉</h3><ul><li>2024年获评\"自治区优秀学生社团\"</li><li>2023年获评\"校级优秀社团\"</li><li>ACM-ICPC区域赛银奖2项、铜奖5项</li><li>蓝桥杯全国总决赛一等奖3项</li><li>中国高校计算机大赛团体程序设计天梯赛全国二等奖</li></ul><h3>品牌活动</h3><ul><li><b>编程训练营</b>：每学期开设C/Python/Java等编程课程</li><li><b>Codeforces周赛</b>：每周线上算法竞赛</li><li><b>黑客马拉松</b>：每年举办一次48小时编程挑战</li><li><b>技术分享会</b>：邀请企业工程师、优秀学长分享</li></ul><h3>招新对象</h3><p>对计算机技术感兴趣的全体在校学生，不限专业！零基础也没关系，我们有完善的培训体系。</p><h3>加入我们</h3><p>招新时间：9月15日-9月30日<br>招新地点：学生活动中心一楼大厅<br>咨询群：QQ群 123456789</p>" },

                { id: "RES_000020", title: "数学建模竞赛经验分享", category: "clubs", description: "往届数学建模竞赛获奖选手的经验分享，包含选题策略、论文写作、团队合作等方面", uploader: "廖同学", uploaderId: "USR_000001", uploadTime: "2025-05-18 14:30", downloads: 234, views: 678, favorites: 67, fileName: "math-modeling.html", filePath: "files/clubs/math-modeling.html", fileSize: 2097152, tags: ["数学建模", "竞赛", "经验"], content: "<h3>数学建模竞赛经验分享</h3><h4>从校赛到国赛的进阶之路</h4><h3>一、赛前准备</h3><h4>知识储备：</h4><ul><li>数学建模基础知识：优化、统计、微分方程</li><li>编程能力：MATLAB、Python、R任选其一</li><li>论文写作：LaTeX排版</li></ul><h4>常用参考书：</h4><ul><li>《数学建模算法与应用》司守奎</li><li>《MATLAB数学建模经典案例实战》</li><li>历年优秀论文集</li></ul><h3>二、选题策略</h3><p>选题时间：比赛开始后4-6小时</p><p>考虑因素：</p><ul><li>题目难度是否与团队能力匹配</li><li>资料和数据获取的可行性</li><li>指导老师的擅长领域</li></ul><p>建议：A题偏机理、B题偏优化、C题数据驱动</p><h3>三、时间分配</h3><table border='1' cellpadding='8' style='border-collapse:collapse;width:100%'><tr><td>阶段</td><td>时间</td><td>任务</td></tr><tr><td>第一天</td><td>上午</td><td>选题、查资料</td></tr><tr><td>第一晚</td><td>确定思路</td><td>开始建模</td></tr><tr><td>第二天</td><td>全天</td><td>编程求解</td></tr><tr><td>第三天</td><td>上午</td><td>论文撰写</td></tr><tr><td>第三天</td><td>下午</td><td>检查修改、提交</td></tr></table><h3>四、论文写作要点</h3><ul><li>摘要要精炼，突出方法和结果</li><li>问题分析要清晰，模型假设要合理</li><li>结果要用图表可视化</li><li>留足时间检查格式和错别字</li></ul>" },

                { id: "RES_000021", title: "社团招新季活动策划", category: "clubs", description: "每学年开学季社团联合招新活动的完整策划方案，包含宣传、场地、流程安排等", uploader: "马同学", uploaderId: "USR_000004", uploadTime: "2025-08-28 09:00", downloads: 56, views: 178, favorites: 11, fileName: "club-recruit-plan.html", filePath: "files/clubs/club-recruit-plan.html", fileSize: 34816, tags: ["社团招新", "策划", "百团大战"], content: "<h3>2025年社团招新季策划案</h3><h4>\"百团大战\"社团联合招新活动</h4><h3>一、活动概述</h3><p>活动名称：2025年秋季社团招新季<br>活动主题：青春有你，社团同行<br>活动时间：2025年9月15日-9月20日<br>活动地点：校区主干道、学生活动中心</p><h3>二、活动内容</h3><h4>Day 1-2：线上预热</h4><ul><li>各社团制作招新宣传视频（1-2分钟）</li><li>通过微信公众号、抖音、B站等平台发布</li><li>设置转发抽奖活动，扩大影响力</li></ul><h4>Day 3：社团嘉年华</h4><ul><li>各社团设置互动展位</li><li>才艺表演、技能展示</li><li>扫码关注送小礼品</li></ul><h4>Day 4-5：百团大战</h4><ul><li>主干道设置招新咨询点</li><li>现场报名、缴费、发放会员证</li></ul><h3>三、宣传方案</h3><ul><li>线上：微信推送、朋友圈广告、抖音挑战赛</li><li>线下：海报、横幅、宣传单、广播站</li></ul><h3>四、预算清单</h3><table border='1' cellpadding='8' style='border-collapse:collapse;width:100%'><tr><td>项目</td><td>数量</td><td>单价</td><td>金额</td></tr><tr><td>宣传海报</td><td>50张</td><td>10元</td><td>500元</td></tr><tr><td>横幅</td><td>10条</td><td>30元</td><td>300元</td></tr><tr><td>礼品</td><td>200份</td><td>5元</td><td>1000元</td></tr><tr><td colspan='3'>合计</td><td>1800元</td></tr></table>" },

                { id: "RES_000022", title: "社团文化节活动总结", category: "clubs", description: "上届社团文化节的活动总结报告，包含参与社团数、活动参与人次、媒体报道等数据", uploader: "马同学", uploaderId: "USR_000004", uploadTime: "2025-06-15 16:30", downloads: 43, views: 134, favorites: 7, fileName: "culture-festival.html", filePath: "files/clubs/culture-festival.html", fileSize: 256000, tags: ["社团文化节", "总结", "活动报告"], content: "<h3>第十届社团文化节活动总结</h3><h4>2024年5月-6月</h4><h3>一、活动概述</h3><p>本届社团文化节以\"青春有你，社团精彩\"为主题，历时一个月，共举办各类活动58场，覆盖全校所有学生社团。</p><h3>二、基本数据</h3><table border='1' cellpadding='8' style='border-collapse:collapse;width:100%'><tr><td>参与社团数</td><td>42个</td></tr><tr><td>活动总场次</td><td>58场</td></tr><tr><td>参与学生人次</td><td>12500人次</td></tr><tr><td>覆盖学生比例</td><td>78%</td></tr><tr><td>媒体报道次数</td><td>15次</td></tr><tr><td>微信阅读量</td><td>8.5万</td></tr></table><h3>三、精彩活动回顾</h3><ul><li><b>开幕式</b>：社团嘉年华，42个社团设展位展示特色</li><li><b>社团风采大赛</b>：23支队伍参赛，评选出10个优秀社团节目</li><li><b>社团开放日</b>：各社团开放实验室/活动室供同学体验</li><li><b>闭幕式晚会</b>：社团之星颁奖典礼，观看人数达2000+</li></ul><h3>四、媒体宣传</h3><ul><li>校区官网报道4篇</li><li>校团委公众号推送6篇</li><li>克拉玛依日报报道2篇</li><li>石榴云/新疆是个好地方转载3篇</li></ul><h3>五、经验与不足</h3><h4>经验：</h4><ul><li>提前制定详细方案，确保活动有序进行</li><li>充分利用新媒体扩大宣传影响力</li><li>鼓励跨社团合作，丰富活动形式</li></ul><h4>不足：</h4><ul><li>部分活动场地协调不够充分</li><li>学生参与度在不同学院间分布不均</li></ul><h3>六、下届改进方向</h3><p>进一步优化活动场地分配，增加学院特色社团活动的展示机会，扩大闭幕式晚会的影响力。</p>" },

                // ===== 生活指南 =====
                { id: "RES_000023", title: "第一食堂美食地图", category: "life", description: "一食堂各楼层餐饮档口分布图，包含热门窗口推荐、必吃美食榜单、价格参考", uploader: "浩同学", uploaderId: "USR_000002", uploadTime: "2025-09-10 12:00", downloads: 345, views: 1234, favorites: 89, fileName: "cante1-food-map.html", filePath: "files/life/cante1-food-map.html", fileSize: 819200, tags: ["食堂", "美食", "攻略"], content: "<h3>第一食堂美食地图</h3><h4>克拉玛依校区一食堂共三层楼</h4><h3>一楼：大众快餐区</h3><p>主营各类家常菜，价格实惠，分量足。</p><ul><li><b>A区</b>：川湘菜窗口 - 招牌菜：酸菜鱼、水煮肉片</li><li><b>B区</b>：北方菜窗口 - 招牌菜：红烧肉、宫保鸡丁</li><li><b>C区</b>：面食窗口 - 招牌面：兰州拉面、刀削面</li></ul><p>参考价格：8-12元/份</p><h3>二楼：特色小吃区</h3><p>汇集各地特色小吃，适合换换口味。</p><ul><li><b>D区</b>：麻辣烫/麻辣香锅 - 12-20元/份</li><li><b>E区</b>：黄焖鸡/煲仔饭 - 15-18元/份</li><li><b>F区</b>：水饺/馄饨 - 8-12元/份</li><li><b>G区</b>：石锅拌饭 - 12-15元/份</li></ul><h3>三楼：风味餐厅</h3><p>提供更具特色的餐饮服务，适合朋友聚餐。</p><ul><li><b>H区</b>：自助小火锅 - 29元/位</li><li><b>I区</b>：烤肉拌饭 - 15-18元/份</li><li><b>J区</b>：锡纸包饭 - 13-16元/份</li></ul><h3>必吃推荐 TOP 5</h3><ol><li>一楼C区兰州拉面（8元）</li><li>二楼D区麻辣香锅（15元）</li><li>二楼E区黄焖鸡（16元）</li><li>三楼H区自助火锅（29元）</li><li>一楼B区红烧肉套餐（10元）</li></ol><h3>营业时间</h3><p>早餐：7:00-9:00<br>午餐：11:00-13:00<br>晚餐：17:00-19:30</p>" },

                { id: "RES_000024", title: "第二食堂隐藏菜单", category: "life", description: "二食堂内部人员才知道的隐藏菜品和小吃，价格实惠味道好", uploader: "浩同学", uploaderId: "USR_000002", uploadTime: "2025-09-12 18:00", downloads: 267, views: 987, favorites: 76, fileName: "cantee2-secrets.html", filePath: "files/life/cantee2-secrets.html", fileSize: 614400, tags: ["食堂", "隐藏菜单", "美食"], content: "<h3>第二食堂隐藏菜单</h3><h4>只有老油条才知道的美食秘密</h4><h3>一楼隐藏美食</h3><ul><li><b>糖醋里脊（隐藏项）</b><br>正常菜单上没有，直接跟窗口阿姨说\"要糖醋里脊\"即可<br>价格：12元  推荐指数：★★★★★</li><li><b>加蛋加肉炒饭</b><br>在普通炒饭基础上加1元加蛋、2元加肉<br>价格：7+1+2=10元  推荐指数：★★★★☆</li></ul><h3>二楼隐藏美食</h3><ul><li><b>番茄牛腩面</b><br>只有周三才能吃到的限定款<br>价格：15元  推荐指数：★★★★★</li><li><b>双拼盖饭</b><br>可以选两个菜混在一起，性价比超高<br>价格：10元  推荐指数：★★★★☆</li><li><b>夜宵档炒河粉</b><br>晚上8点后才出摊，味道一绝<br>价格：8元  推荐指数：★★★★★</li></ul><h3>隐藏点餐技巧</h3><ol><li>跟阿姨说\"少放辣/多放醋\"可以调整口味</li><li>加钱可以让阿姨多打菜（加2元多一勺）</li><li>错过饭点可以去找值班窗口，价格一样</li><li>周五下午有卤味供应，超便宜</li></ol><h3>注意事项</h3><p>隐藏菜单可能因窗口调整而变化，建议多跟学长学姐打听最新情报！</p>" },

                { id: "RES_000025", title: "校园网使用完全指南", category: "life", description: "校园网连接设置、常见故障排查、带宽升级方法、路由器配置等详细教程", uploader: "泽同学", uploaderId: "USR_000003", uploadTime: "2025-09-01 10:00", downloads: 456, views: 1567, favorites: 123, fileName: "campus-network.html", filePath: "files/life/campus-network.html", fileSize: 1048576, tags: ["校园网", "WiFi", "教程"], content: "<h3>校园网使用完全指南</h3><h4>连接设置 | 故障排查 | 带宽升级</h4><h3>一、连接设置</h3><h4>Windows系统：</h4><ol><li>打开\"设置\" → \"网络和Internet\" → \"WLAN\"</li><li>找到并连接网络：CUPK或CUPK-5G</li><li>在浏览器中输入任意网址，会自动弹出认证页面</li><li>输入学号和密码登录</li></ol><h4>移动设备（iOS/Android）：</h4><ol><li>连接CUPK或CUPK-5G网络</li><li>打开浏览器访问任意网址</li><li>在认证页面输入学号和密码</li></ul><h3>二、账号与密码</h3><p>校园网账号：学号<br>初始密码：身份证后6位<br>（可在网络信息中心修改密码）</p><h3>三、常见问题排查</h3><table border='1' cellpadding='8' style='border-collapse:collapse;width:100%'><tr><td>问题</td><td>解决方法</td></tr><tr><td>连不上WiFi</td><td>检查是否已欠费，确认密码正确</td></tr><tr><td>认证页面打不开</td><td>尝试清除浏览器缓存或换用Chrome</td></tr><tr><td>频繁掉线</td><td>可能是信号弱，靠近窗户或使用有线连接</td></tr><tr><td>网速很慢</td><td>晚高峰（20:00-23:00）限速，避开高峰期</td></tr></table><h3>四、带宽升级服务</h3><p>基础带宽：4Mbps（免费）<br>升级带宽：20Mbps - 30元/月<br>升级带宽：50Mbps - 60元/月</p><p>办理地点：网络信息中心（行政楼102室）<br>办理时间：工作日 8:30-12:00, 14:30-18:00</p><h3>五、自备路由器配置</h3><p>可以使用自己的路由器，但需要在信息中心进行MAC地址绑定，具体配置方法可参考信息中心提供的教程。</p>" },

                { id: "RES_000026", title: "学生卡使用与充值攻略", category: "life", description: "学生卡充值、挂失补办、消费查询、门禁权限等使用指南", uploader: "浩同学", uploaderId: "USR_000002", uploadTime: "2025-09-02 11:30", downloads: 234, views: 876, favorites: 67, fileName: "student-card.html", filePath: "files/life/student-card.html", fileSize: 716800, tags: ["学生卡", "一卡通", "充值"], content: "<h3>学生卡使用攻略</h3><h4>一卡通 = 校园卡 + 门禁卡 + 公交卡</h4><h3>一、功能说明</h3><ul><li><b>食堂消费</b>：各食堂刷卡就餐</li><li><b>图书借阅</b>：图书馆借书、预约座位</li><li><b>门禁通行</b>：宿舍楼、图书馆、体育馆等</li><li><b>校巴乘坐</b>：校内通勤车</li><li><b>校园超市</b>：教育超市购物</li></ul><h3>二、充值方式</h3><h4>方式一：完美校园APP（推荐）</h4><ol><li>下载并打开\"完美校园\"APP</li><li>绑定校园卡</li><li>点击\"充值\"，选择金额和支付方式</li><li>充值后需在食堂刷卡机或圈存机上\"领款\"</li></ol><h4>方式二：圈存机</h4><p>位置：各食堂一楼大厅、图书馆一楼大厅</p><ol><li>将校园卡放入圈存机</li><li>选择\"充值\" → 输入金额</li><li>确认充值（从绑定银行卡扣款）</li></ol><h4>方式三：现金充值</h4><p>地点：学生事务中心（行政楼一楼）<br>时间：工作日 9:00-17:00</p><h3>三、余额查询</h3><ul><li>完美校园APP实时查询</li><li>圈存机查询</li><li>食堂消费时小票显示余额</li></ul><h3>四、挂失与补办</h3><p>挂失方式：</p><ul><li>完美校园APP自助挂失</li><li>圈存机挂失</li><li>学生事务中心办理</li></ul><p>补办流程：</p><ol><li>携带身份证到学生事务中心</li><li>填写补办申请表</li><li>缴纳工本费15元</li><li>现场制卡，立即可用</li></ol><h3>五、注意事项</h3><ul><li>初始密码为身份证后6位，请及时修改</li><li>卡内余额上限500元</li><li>丢失后请尽快挂失，防止余额被盗用</li></ul>" },

                { id: "RES_000027", title: "图书馆借阅全攻略", category: "life", description: "图书馆开放时间、借阅规则、预约座位方法、电子资源访问等完整指南", uploader: "胡同学", uploaderId: "USR_000005", uploadTime: "2025-09-05 14:00", downloads: 389, views: 1432, favorites: 98, fileName: "library-guide.html", filePath: "files/life/library-guide.html", fileSize: 921600, tags: ["图书馆", "借阅", "座位预约"], content: "<h3>图书馆借阅全攻略</h3><h4>开放时间 | 借阅规则 | 座位预约 | 电子资源</h4><h3>一、开放时间</h3><table border='1' cellpadding='8' style='border-collapse:collapse;width:100%'><tr><td>区域</td><td>周一至周五</td><td>周末</td></tr><tr><td>阅览区</td><td>8:00-22:00</td><td>9:00-22:00</td></tr><tr><td>自习区</td><td>7:00-23:00</td><td>8:00-23:00</td></tr><tr><td>借阅区</td><td>8:30-21:30</td><td>9:00-17:00</td></tr><tr><td>电子阅览室</td><td>8:30-21:30</td><td>9:00-17:00</td></tr></table><p>注：节假日开放时间可能调整，请关注图书馆公告。</p><h3>二、借阅规则</h3><table border='1' cellpadding='8' style='border-collapse:collapse;width:100%'><tr><td>读者类型</td><td>借书数量</td><td>借期</td><td>续借次数</td></tr><tr><td>本科生</td><td>10册</td><td>30天</td><td>1次</td></tr><tr><td>研究生</td><td>20册</td><td>60天</td><td>2次</td></tr><tr><td>教师</td><td>30册</td><td>90天</td><td>3次</td></tr></table><h3>三、座位预约</h3><p>为解决占座问题，图书馆实行座位预约制：</p><ol><li>微信搜索\"图书馆座位预约\"小程序</li><li>选择楼层和座位</li><li>预约成功后到图书馆签到</li><li>离开时记得点击\"释放座位\"</li></ol><p>违约处理：连续3次违约将被禁止预约一周。</p><h3>四、电子资源访问</h3><p>校园网内可免费访问：</p><ul><li>中国知网（CNKI）</li><li>万方数据</li><li>维普期刊</li><li>超星电子图书</li><li>Springer、EBSCO等外文数据库</li></ul><p>VPN使用方法：在校外访问需先连接学校VPN，具体配置见信息中心官网。</p><h3>五、常见问题</h3><p><b>Q: 图书超期怎么办？</b><br>A: 每册每天0.1元超期费，可在自助机或网上缴费。</p><p><b>Q: 想借的书被别人借走了怎么办？</b><br>A: 可在网上图书馆申请\"预约\"或\"馆际互借\"。</p>" },

                { id: "RES_000028", title: "校园快递点分布图", category: "life", description: "各快递公司取件点位置、营业时间、取件流程汇总，包含菜鸟驿站、京东派等", uploader: "高同学", uploaderId: "USR_000006", uploadTime: "2025-09-08 09:30", downloads: 312, views: 1123, favorites: 87, fileName: "express-delivery.html", filePath: "files/life/express-delivery.html", fileSize: 655360, tags: ["快递", "取件", "菜鸟驿站"], content: "<h3>校园快递点分布图</h3><h4>各快递公司取件点一览</h4><h3>一、菜鸟驿站（主要快递点）</h3><p>位置：学生宿舍区南侧，近3号宿舍楼<br>营业时间：9:00-21:00（周一至周日）<br>存放期限：3天</p><h4>支持的快递：</h4><ul><li>圆通、申通、中通、韵达</li><li>极兔、邮政小包</li><li>天猫超市、淘特</li></ul><h4>取件流程：</h4><ol><li>收到取件码短信（格式：菜鸟驿站-A区-123-4）</li><li>到对应货架区自取</li><li>出库机扫描取件码完成取件</li></ol><h3>二、京东派</h3><p>位置：菜鸟驿站旁边<br>营业时间：10:00-20:00<br>存放期限：5天</p><p>取件方式：凭取件码或身份证取件</p><h3>三、顺丰速运</h3><p>位置：校区东门外左侧便利店代收点<br>营业时间：9:00-21:00</p><h3>四、邮政/EMS</h3><p>位置：邮政储蓄银行内（校区西门）<br>营业时间：9:00-17:00（周一至周五）</p><h3>五、丰巢快递柜</h3><p>位置分布：</p><ul><li>1号宿舍楼北侧</li><li>2号宿舍楼南侧</li><li>菜鸟驿站门口</li></ul><p>免费存放时长：18小时，超时收费</p><h3>六、寄件服务</h3><p>菜鸟驿站提供寄件服务，营业时间内均可办理。<br>价格参考：首重1kg内约8-12元（视快递公司而定）</p><h3>七、温馨提示</h3><ul><li>高峰期（双十一、开学季）取件可能需要排队</li><li>请及时取件，超期将被退回</li><li>贵重物品建议选择有保障的快递柜存放</li></ul>" },

                { id: "RES_000029", title: "宿舍生活完全指南", category: "life", description: "宿舍设施介绍、报修流程、用电规定、安全须知、室友相处建议等", uploader: "高同学", uploaderId: "USR_000006", uploadTime: "2025-09-03 15:00", downloads: 423, views: 1543, favorites: 112, fileName: "dormitory-guide.html", filePath: "files/life/dormitory-guide.html", fileSize: 819200, tags: ["宿舍", "生活", "指南"], content: "<h3>宿舍生活完全指南</h3><h4>设施使用 | 报修流程 | 室友相处</h4><h3>一、宿舍配置</h3><p>本科生：4人间，上床下桌，有独立卫浴<br>研究生：2人间，设施更完善</p><h4>房间设施：</h4><ul><li>床铺尺寸：0.9m × 1.9m（需自购床品）</li><li>书桌：含书架、抽屉、USB充电接口</li><li>衣柜：每人一个，约60cm宽</li><li>空调：分体式空调（需自购遥控器或办理租赁）</li><li>暖气：暖气片供暖，冬季室内温度约20-24℃</li></ul><h3>二、用电规定</h3><ul><li>额定功率：每宿舍不超过3000W</li><li>禁止使用大功率电器：电热毯、电暖器、电饭锅、热得快等</li><li>电费：每人每月8度电免费，超出部分按民用电价收费</li><li>查询方式：通过完美校园APP查询用电余额</li></ul><h3>三、报修流程</h3><ol><li>登录完美校园APP → 报修服务</li><li>选择报修类型和详细描述</li><li>可上传图片说明问题</li><li>后勤师傅会在24小时内上门处理</li></ol><p>紧急报修（如漏水、电路故障）：直接拨打后勤值班电话</p><h3>四、安全须知</h3><ul><li>离开宿舍时锁好门窗</li><li>贵重物品妥善保管或存放在保险柜</li><li>禁止在宿舍使用明火</li><li>禁止私拉乱接电线</li><li>电动车电池禁止在宿舍内充电</li></ul><h3>五、室友相处建议</h3><ul><li>制定宿舍公约，明确作息、卫生值日等规则</li><li>尊重彼此的生活习惯，有问题及时沟通</li><li>学会换位思考，互相理解包容</li><li>共同维护宿舍卫生和秩序</li><li>发生矛盾时保持冷静，可寻求辅导员帮助</li></ul>" },

                { id: "RES_000030", title: "校内外交通出行指南", category: "life", description: "校门口公交线路、出租车/网约车指南、共享单车位置、校区通勤车时刻表", uploader: "高同学", uploaderId: "USR_000006", uploadTime: "2025-09-06 08:00", downloads: 287, views: 1098, favorites: 76, fileName: "transportation.html", filePath: "files/life/transportation.html", fileSize: 716800, tags: ["交通", "出行", "公交"], content: "<h3>校内外交通出行指南</h3><h4>公交 | 网约车 | 共享单车 | 通勤车</h4><h3>一、校区位置</h3><p>校区位于克拉玛依市克拉玛依区安定路355号</p><h3>二、公交线路</h3><table border='1' cellpadding='8' style='border-collapse:collapse;width:100%'><tr><td>线路</td><td>起点-终点</td><td>经过校区</td><td>票价</td></tr><tr><td>BRT1号线</td><td>校区-市中心</td><td>校门口站</td><td>1元</td></tr><tr><td>5路</td><td>校区-火车站</td><td>校门口站</td><td>2元</td></tr><tr><td>9路</td><td>校区-机场</td><td>校门口站</td><td>3元</td></tr><tr><td>101路</td><td>校区-商场</td><td>校门口站</td><td>1元</td></tr></table><h3>三、出租车/网约车</h3><ul><li><b>出租车</b>：校门口可扬召，起步价8元</li><li><b>滴滴出行</b>：克拉玛依市区支持滴滴，高峰期约5-10分钟到</li><li><b>曹操出行</b>：本地网约车平台，价格实惠</li></ul><h3>四、共享单车</h3><p>校园内禁止骑行共享单车，校外可使用：</p><ul><li>美团单车：需下载美团APP，扫码骑行</li><li>哈啰单车：需下载哈啰APP</li><li>停车点：校门外两侧均有停车区</li></ul><h3>五、校内通勤车</h3><p>为方便师生在校区内出行，提供通勤车服务：</p><table border='1' cellpadding='8' style='border-collapse:collapse;width:100%'><tr><td>线路</td><td>时间</td><td>间隔</td></tr><tr><td>宿舍区-教学楼</td><td>7:30-21:30</td><td>15分钟</td></tr><tr><td>教学楼-图书馆</td><td>7:30-21:30</td><td>20分钟</td></tr></table><p>凭学生卡/工作证免费乘坐</p><h3>六、前往火车站/机场</h3><ul><li><b>火车站</b>：乘坐5路公交约30分钟，或打车约15元</li><li><b>机场</b>：乘坐9路公交约45分钟，或打车约30元</li></ul>" },

                { id: "RES_000031", title: "校园紧急联系电话一览", category: "life", description: "保卫处、医务室、后勤服务、宿舍管理、水电维修等各部门紧急联系电话", uploader: "廖同学", uploaderId: "USR_000001", uploadTime: "2025-09-01 08:00", downloads: 567, views: 2134, favorites: 145, fileName: "紧急联系电话.html", filePath: "files/life/紧急联系电话.html", fileSize: 409600, tags: ["紧急电话", "求助", "常用"], content: "<h3>校园紧急联系电话一览</h3><h4>建议收藏！关键时刻用得上！</h4><h3>🚨 紧急求助电话</h3><table border='1' cellpadding='8' style='border-collapse:collapse;width:100%'><tr><td>部门</td><td>电话</td><td>备注</td></tr><tr><td>校园报警电话</td><td>6996110</td><td>24小时值班</td></tr><tr><td>保卫处值班室</td><td>6996110</td><td>校园安全</td></tr><tr><td>火警</td><td>119</td><td>火灾报警</td></tr><tr><td>急救</td><td>120</td><td>医疗急救</td></tr><tr><td>报警</td><td>110</td><td>社会报警</td></tr></table><h3>🏥 医疗服务</h3><table border='1' cellpadding='8' style='border-collapse:collapse;width:100%'><tr><td>部门</td><td>电话</td><td>备注</td></tr><tr><td>校医务室</td><td>6991120</td><td>工作时间：8:30-18:00</td></tr><tr><td>校医急诊</td><td>13999545678</td><td>24小时值班</td></tr><tr><td>校医院转诊</td><td>6991130</td><td>开具转诊单</td></tr></table><h3>🏠 后勤服务</h3><table border='1' cellpadding='8' style='border-collapse:collapse;width:100%'><tr><td>部门</td><td>电话</td><td>备注</td></tr><tr><td>后勤值班</td><td>6992110</td><td>24小时</td></tr><tr><td>宿舍管理</td><td>6992120</td><td>住宿相关问题</td></tr><tr><td>水电维修</td><td>6992130</td><td>水电故障</td></tr><tr><td>暖气维修</td><td>6992140</td><td>冬季暖气问题</td></tr><tr><td>网络故障</td><td>6992150</td><td>校园网问题</td></tr><tr><td>食堂投诉</td><td>6992160</td><td>餐饮问题</td></tr></table><h3>📚 教学管理</h3><table border='1' cellpadding='8' style='border-collapse:collapse;width:100%'><tr><td>部门</td><td>电话</td><td>备注</td></tr><tr><td>教务处</td><td>6993110</td><td>选课、成绩</td></tr><tr><td>学生处</td><td>6993120</td><td>学生事务</td></tr><tr><td>图书馆</td><td>6993130</td><td>借阅、座位</td></tr></table><h3>⚠️ 温馨提示</h3><ul><li>非紧急事务请通过正常渠道反映，紧急电话用于紧急情况</li><li>遇突发事件请保持冷静，及时拨打相应电话</li><li>建议将以上电话存入手机通讯录</li></ul>" },

                { id: "RES_000032", title: "后勤服务常见问题解答", category: "life", description: "后勤报修流程、物业服务范围、餐饮投诉渠道、宿舍调整申请等FAQ汇总", uploader: "高同学", uploaderId: "USR_000006", uploadTime: "2025-09-07 10:30", downloads: 198, views: 765, favorites: 54, fileName: "logistics-faq.html", filePath: "files/life/logistics-faq.html", fileSize: 573440, tags: ["后勤", "FAQ", "常见问题"], content: "<h3>后勤服务常见问题解答</h3><h4>报修 | 物业 | 餐饮 | 住宿调整</h4><h3>一、报修相关</h3><p><b>Q: 如何申请报修？</b><br>A: 方式一：通过完美校园APP报修（推荐）；方式二：拨打后勤值班电话 6992110；方式三：到后勤服务中心现场报修。</p><p><b>Q: 报修后多久能来处理？</b><br>A: 一般故障24小时内处理；紧急故障（如漏水、断电）会立即响应。</p><p><b>Q: 报修需要收费吗？</b><br>A: 因质量问题或正常使用造成的损坏免费维修；人为损坏需自费。</p><h3>二、物业服务</h3><p><b>Q: 宿舍公共区域卫生谁来打扫？</b><br>A: 走廊、楼梯、卫生间等公共区域由物业保洁负责；宿舍内部由学生自行打扫。</p><p><b>Q: 宿舍门锁坏了怎么办？</b><br>A: 立即报修，保修期内的门锁免费更换；丢失钥匙可到宿舍管理员处领取备用钥匙。</p><p><b>Q: 快递柜满了取不了件怎么办？</b><br>A: 可联系快递员安排其他时间派送，或到菜鸟驿站人工区办理。</p><h3>三、餐饮服务</h3><p><b>Q: 食堂饭菜吃出问题怎么办？</b><br>A: 保留饭菜样品和消费凭证，拨打食堂投诉电话 6992160 或通过完美校园投诉。</p><p><b>Q: 可以在食堂预订包厢聚餐吗？</b><br>A: 可以，一食堂三楼风味餐厅提供聚餐预订服务，需提前3天预约。</p><p><b>Q: 对食堂有建议怎么反馈？</b><br>A: 每学期会发放问卷调查；也可通过完美校园\"后勤服务\"板块反馈。</p><h3>四、住宿调整</h3><p><b>Q: 可以申请调换宿舍吗？</b><br>A: 因特殊原因（如身体原因、年级调整）可申请调换，需填写申请表，经辅导员和宿舍管理中心审批。</p><p><b>Q: 寒暑假可以留校吗？</b><br>A: 寒暑假留校需提前申请，填写留校申请表，经学院和宿舍管理中心审批。留校期间统一安排集中住宿。</p><p><b>Q: 宿舍空调需要缴费吗？</b><br>A: 空调本身免费使用，电费自理（计入宿舍电费）。遥控器可在完美校园APP申请租赁或自行购买。</p><h3>五、联系方式</h3><p>后勤服务中心办公时间：周一至周五 8:30-12:00, 14:30-18:00<br>后勤值班电话（24小时）：6992110<br>投诉监督电话：6992100</p>" },

            ];
            
            // 初始化示例评论
            this._counters.comment = 30;
            this._data.comments = [
                // RES_000001 高等数学
                { id: "CMT_000001", resourceId: "RES_000001", userId: "USR_000002", userName: "浩同学", content: "笔记非常详细，对复习帮助很大！特别是微分中值定理部分讲得很清楚", rating: 5, time: "2025-06-11 10:30", helpful: 12 },
                { id: "CMT_000002", resourceId: "RES_000001", userId: "USR_000003", userName: "泽同学", content: "高数救星，感谢分享！期末复习全靠这个了", rating: 5, time: "2025-06-10 15:20", helpful: 8 },
                { id: "CMT_000003", resourceId: "RES_000001", userId: "USR_000005", userName: "胡同学", content: "例题很经典，建议配合教材一起看", rating: 4, time: "2025-06-09 09:45", helpful: 5 },

                // RES_000002 线性代数
                { id: "CMT_000004", resourceId: "RES_000002", userId: "USR_000001", userName: "廖同学", content: "特征值部分总结得很到位，考试重点都在里面了", rating: 5, time: "2025-06-10 14:20", helpful: 7 },
                { id: "CMT_000005", resourceId: "RES_000002", userId: "USR_000004", userName: "马同学", content: "配了详细的解题步骤，对新手很友好", rating: 4, time: "2025-06-09 11:30", helpful: 4 },

                // RES_000003 C语言
                { id: "CMT_000006", resourceId: "RES_000003", userId: "USR_000004", userName: "马同学", content: "代码示例很实用，推荐初学者看看", rating: 5, time: "2025-06-09 09:15", helpful: 15 },
                { id: "CMT_000007", resourceId: "RES_000003", userId: "USR_000005", userName: "胡同学", content: "指针部分讲得很清楚，终于理解了", rating: 5, time: "2025-06-08 16:30", helpful: 11 },
                { id: "CMT_000008", resourceId: "RES_000003", userId: "USR_000002", userName: "浩同学", content: "从入门到精通，靠这个就够了", rating: 5, time: "2025-06-07 20:15", helpful: 9 },

                // RES_000004 数据结构
                { id: "CMT_000009", resourceId: "RES_000004", userId: "USR_000003", userName: "泽同学", content: "代码实现很规范，可以直接拿来用", rating: 5, time: "2025-06-08 11:00", helpful: 10 },
                { id: "CMT_000010", resourceId: "RES_000004", userId: "USR_000001", userName: "廖同学", content: "时间复杂度分析很详细，面试必备", rating: 4, time: "2025-06-07 14:30", helpful: 6 },

                // RES_000006 大学物理
                { id: "CMT_000011", resourceId: "RES_000006", userId: "USR_000005", userName: "胡同学", content: "公式总结得很全面，复习时省了不少时间", rating: 5, time: "2025-06-06 14:45", helpful: 20 },
                { id: "CMT_000012", resourceId: "RES_000006", userId: "USR_000002", userName: "浩同学", content: "电磁学部分整理得很好，期末考了90+", rating: 5, time: "2025-06-05 18:00", helpful: 14 },

                // RES_000007 电路分析
                { id: "CMT_000013", resourceId: "RES_000007", userId: "USR_000003", userName: "泽同学", content: "戴维南定理的讲解特别详细，好评！", rating: 5, time: "2025-06-05 10:30", helpful: 13 },
                { id: "CMT_000014", resourceId: "RES_000007", userId: "USR_000006", userName: "高同学", content: "配合电路课本一起看效果更好", rating: 4, time: "2025-06-04 15:20", helpful: 7 },

                // RES_000010 经济学
                { id: "CMT_000015", resourceId: "RES_000010", userId: "USR_000001", userName: "廖同学", content: "经济学入门好资料，适合预习和复习", rating: 4, time: "2025-06-02 11:30", helpful: 6 },
                { id: "CMT_000016", resourceId: "RES_000010", userId: "USR_000003", userName: "泽同学", content: "供需曲线分析很透彻，推荐！", rating: 5, time: "2025-06-01 16:45", helpful: 8 },

                // RES_000023 美食地图
                { id: "CMT_000017", resourceId: "RES_000023", userId: "USR_000004", userName: "马同学", content: "太实用了！一楼C区的拉面确实好吃", rating: 5, time: "2025-09-12 12:30", helpful: 25 },
                { id: "CMT_000018", resourceId: "RES_000023", userId: "USR_000006", userName: "高同学", content: "麻辣香锅必吃！价格实惠分量足", rating: 5, time: "2025-09-11 18:45", helpful: 18 },
                { id: "CMT_000019", resourceId: "RES_000023", userId: "USR_000002", userName: "浩同学", content: "美食地图，干饭人必备！", rating: 5, time: "2025-09-10 20:00", helpful: 22 },

                // RES_000025 校园网
                { id: "CMT_000020", resourceId: "RES_000025", userId: "USR_000001", userName: "廖同学", content: "终于解决了校园网掉线的问题！", rating: 5, time: "2025-09-03 09:15", helpful: 30 },
                { id: "CMT_000021", resourceId: "RES_000025", userId: "USR_000004", userName: "马同学", content: "带宽升级攻略很详细，省了不少钱", rating: 5, time: "2025-09-02 14:30", helpful: 16 },

                // RES_000027 图书馆
                { id: "CMT_000022", resourceId: "RES_000027", userId: "USR_000002", userName: "浩同学", content: "座位预约功能太好用了，再也不用早起占座了", rating: 5, time: "2025-09-08 08:00", helpful: 28 },
                { id: "CMT_000023", resourceId: "RES_000027", userId: "USR_000005", userName: "胡同学", content: "电子资源访问方法很实用，在家也能查文献", rating: 5, time: "2025-09-06 16:20", helpful: 19 },

                // RES_000029 宿舍指南
                { id: "CMT_000024", resourceId: "RES_000029", userId: "USR_000003", userName: "泽同学", content: "新生必看！室友相处建议很有用", rating: 5, time: "2025-09-05 10:00", helpful: 24 },
                { id: "CMT_000025", resourceId: "RES_000029", userId: "USR_000001", userName: "廖同学", content: "报修流程写得很清楚，亲测有效", rating: 5, time: "2025-09-04 11:30", helpful: 15 },

                // RES_000031 紧急电话
                { id: "CMT_000026", resourceId: "RES_000031", userId: "USR_000006", userName: "高同学", content: "建议每个人都收藏！关键时刻能救命", rating: 5, time: "2025-09-02 08:30", helpful: 45 },
                { id: "CMT_000027", resourceId: "RES_000031", userId: "USR_000004", userName: "马同学", content: "上次网络坏了就是打这个解决的", rating: 5, time: "2025-09-01 20:15", helpful: 32 },

                // RES_000019 计算机协会
                { id: "CMT_000028", resourceId: "RES_000019", userId: "USR_000001", userName: "廖同学", content: "已加入！Codeforces周赛真的很锻炼人", rating: 5, time: "2025-09-05 14:00", helpful: 17 },
                { id: "CMT_000029", resourceId: "RES_000019", userId: "USR_000003", userName: "泽同学", content: "ACM银奖学长分享会干货满满", rating: 5, time: "2025-09-04 16:30", helpful: 12 },

                // RES_000020 数学建模
                { id: "CMT_000030", resourceId: "RES_000020", userId: "USR_000002", userName: "浩同学", content: "论文写作技巧太有用了，国赛拿了省一！", rating: 5, time: "2025-05-20 11:00", helpful: 35 }
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
