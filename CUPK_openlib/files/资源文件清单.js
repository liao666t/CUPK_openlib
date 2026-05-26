/**
 * 资源文件清单 - 用于记录 files 文件夹中的所有文件
 * 
 * 使用说明：
 * 1. 将您的课程资料文件放入对应的分类文件夹
 * 2. 更新此文件中的 fileName 为实际文件名
 * 3. 在 data.js 的 _initSampleData 中更新对应记录
 * 
 * 文件夹路径: files/{category}/{fileName}
 */

// ===== 数学 (math) =====
const mathResources = [
    {
        fileName: "高等数学笔记.pdf",
        filePath: "files/math/高等数学笔记.pdf",
        description: "请将您的大一高等数学笔记放在这里"
    },
    {
        fileName: "线性代数资料.pdf", 
        filePath: "files/math/线性代数资料.pdf",
        description: "请将您的线性代数资料放在这里"
    }
];

// ===== 计算机 (cs) =====
const csResources = [
    {
        fileName: "C语言程序设计.pdf",
        filePath: "files/cs/C语言程序设计.pdf",
        description: "请将您的C语言教程放在这里"
    },
    {
        fileName: "数据结构与算法.pdf",
        filePath: "files/cs/数据结构与算法.pdf",
        description: "请将您的数据结构资料放在这里"
    },
    {
        fileName: "Python入门指南.pdf",
        filePath: "files/cs/Python入门指南.pdf",
        description: "请将您的Python教程放在这里"
    },
    {
        fileName: "数据库实践讲义.pdf",
        filePath: "files/cs/数据库实践讲义.pdf",
        description: "示例：如果有数据库课程，使用此格式命名"
    }
];

// ===== 物理 (physics) =====
const physicsResources = [
    {
        fileName: "大学物理公式汇总.pdf",
        filePath: "files/physics/大学物理公式汇总.pdf",
        description: "请将您的大学物理公式资料放在这里"
    },
    {
        fileName: "电路分析基础.pdf",
        filePath: "files/physics/电路分析基础.pdf",
        description: "请将您的电路分析资料放在这里"
    }
];

// ===== 语言 (language) =====
const languageResources = [
    {
        fileName: "英语四六级词汇.pdf",
        filePath: "files/language/英语四六级词汇.pdf",
        description: "请将您的英语词汇资料放在这里"
    },
    {
        fileName: "大学英语教程答案.pdf",
        filePath: "files/language/大学英语教程答案.pdf",
        description: "请将您的大学英语答案放在这里"
    }
];

// ===== 经济 (economics) =====
const economicsResources = [
    {
        fileName: "经济学原理笔记.pdf",
        filePath: "files/economics/经济学原理笔记.pdf",
        description: "请将您的经济学笔记放在这里"
    }
];

// ===== 人文 (humanities) =====
const humanitiesResources = [
    {
        fileName: "心理学概论.pdf",
        filePath: "files/humanities/心理学概论.pdf",
        description: "请将您的心理学资料放在这里"
    },
    {
        fileName: "中国近代史纲要.pdf",
        filePath: "files/humanities/中国近代史纲要.pdf",
        description: "请将您的近代史资料放在这里"
    }
];

// ===== 使用示例 =====
/*
 * 如何添加新资源到 data.js：
 * 
 * 1. 将文件放入对应文件夹，如：files/cs/数据库实践讲义.pdf
 * 
 * 2. 在 data.js 的 _initSampleData 中添加记录：
 * 
 * { 
 *     id: "RES_000013", 
 *     title: "数据库实践讲义", 
 *     category: "cs", 
 *     description: "数据库系统实践课程讲义",
 *     uploader: "您的名字", 
 *     uploaderId: "USR_000013", 
 *     uploadTime: "2025-06-15", 
 *     downloads: 0, 
 *     views: 0, 
 *     favorites: 0, 
 *     fileName: "数据库实践讲义.pdf", 
 *     filePath: "files/cs/数据库实践讲义.pdf" 
 * }
 */
