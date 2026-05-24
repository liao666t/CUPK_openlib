/**
 * 主逻辑模块 - 石大克拉玛依校区开源资源库
 * 使用 DataStore 进行数据管理
 */

// DataStore 初始化完成后的回调
var onDataStoreReady = null;

// 设置 DataStore 就绪时的回调
function setDataStoreReadyCallback(callback) {
    onDataStoreReady = callback;
}

// 等待 DataStore 初始化完成
function waitForDataStore(callback) {
    if (typeof DataStore !== 'undefined') {
        DataStore.init(function() {
            if (callback) callback();
            if (onDataStoreReady) onDataStoreReady();
        });
    } else {
        setTimeout(function() {
            waitForDataStore(callback);
        }, 100);
    }
}

function hideLoading() {
    var overlay = document.getElementById("loadingOverlay");
    if (overlay) {
        setTimeout(function() {
            overlay.style.opacity = "0";
            setTimeout(function() {
                overlay.style.display = "none";
            }, 300);
        }, 100);
    }
}

function doSearch() {
    var input = document.getElementById("searchInput");
    if (!input) {
        input = document.getElementById("courseSearch");
    }
    if (!input) return;
    var query = input.value.trim();
    if (query) {
        window.location.href = "search.html?q=" + encodeURIComponent(query);
    }
}

function handleKeyPress(e) {
    if (e.keyCode === 13) {
        doSearch();
    }
}

function doPageSearch() {
    var input = document.getElementById("searchInputPage");
    if (!input) return;
    var query = input.value.trim();
    if (query) {
        window.location.href = "search.html?q=" + encodeURIComponent(query);
    }
}

function handleSearchKeyPress(e) {
    if (e.keyCode === 13) {
        doPageSearch();
    }
}

function getUrlParam(name) {
    var params = window.location.search.substring(1).split("&");
    for (var i = 0; i < params.length; i++) {
        var pair = params[i].split("=");
        if (pair[0] === name) {
            return decodeURIComponent(pair[1] || "");
        }
    }
    return "";
}

function renderSearchResults() {
    var container = document.getElementById("results");
    if (!container) return;
    
    var query = getUrlParam("q");
    var category = getUrlParam("cat");
    var sortBy = getUrlParam("sort");
    
    if (query) {
        document.getElementById("searchInputPage").value = query;
    }
    if (category) {
        document.getElementById("filterCategory").value = category;
    }
    if (sortBy) {
        document.getElementById("sortBy").value = sortBy;
    }
    
    // 使用 DataStore 搜索资源
    var results = DataStore.searchResources(query, category);
    
    // 排序
    if (sortBy === "downloads") {
        results.sort(function(a, b) { return (b.downloads || 0) - (a.downloads || 0); });
    } else if (sortBy === "time") {
        results.sort(function(a, b) { return new Date(b.uploadTime) - new Date(a.uploadTime); });
    }
    
    if (!query && !category) {
        container.innerHTML = "<p>请输入搜索关键词或选择分类</p>";
        return;
    }
    
    if (results.length === 0) {
        container.innerHTML = "<p>未找到与 \"" + query + "\" 相关的资源</p>";
        return;
    }
    
    var html = "<p>找到 " + results.length + " 个相关资源：</p><div class=\"resource-grid\">";
    for (var j = 0; j < results.length; j++) {
        var res = results[j];
        html += "<div class=\"resource-card\">";
        html += "<div class=\"resource-title\"><a href=\"detail.html?id=" + res.id + "\" onclick=\"viewResource('" + res.title + "', '" + res.id + "')\">" + res.title + "</a></div>";
        html += "<div class=\"resource-meta\">分类：" + (DataStore.categoryNames[res.category] || res.category) + "</div>";
        html += "<div class=\"resource-meta\">上传者：" + res.uploader + "</div>";
        html += "<div class=\"resource-meta\">上传时间：" + res.uploadTime + "</div>";
        html += "<div class=\"resource-meta\">下载：" + (res.downloads || 0) + "次</div>";
        html += "</div>";
    }
    html += "</div>";
    container.innerHTML = html;
}

function viewResource(title, id) {
    var history = JSON.parse(localStorage.getItem("browseHistory") || "[]");
    var now = new Date();
    var timeStr = DataStore._formatDate(now);
    
    var exists = false;
    for (var i = 0; i < history.length; i++) {
        if (history[i].title === title) {
            history[i].time = timeStr;
            if (id) history[i].id = id;
            exists = true;
            break;
        }
    }
    
    if (!exists) {
        history.unshift({ title: title, time: timeStr, id: id });
    }
    
    if (history.length > 20) {
        history = history.slice(0, 20);
    }
    
    localStorage.setItem("browseHistory", JSON.stringify(history));
    
    // 增加浏览次数
    if (id) {
        DataStore.incrementViews(id);
    }
}

function initSearchPage() {
    var input = document.getElementById("searchInput");
    if (input) {
        var query = getUrlParam("q");
        if (query) {
            input.value = query;
        }
    }
    var inputPage = document.getElementById("searchInputPage");
    if (inputPage) {
        var query = getUrlParam("q");
        if (query) {
            inputPage.value = query;
        }
    }
    renderSearchResults();
}

function initResourcesPage() {
    var container = document.getElementById("categoryList");
    if (!container) return;
    
    var allResources = DataStore.getAllResources();
    var categories = {};
    
    for (var i = 0; i < allResources.length; i++) {
        var cat = allResources[i].category;
        if (!categories[cat]) {
            categories[cat] = [];
        }
        categories[cat].push(allResources[i]);
    }
    
    var html = "";
    var catKeys = Object.keys(categories);
    for (var j = 0; j < catKeys.length; j++) {
        var catName = DataStore.categoryNames[catKeys[j]] || catKeys[j];
        html += "<li><strong>" + catName + ":</strong> ";
        var items = categories[catKeys[j]];
        var links = [];
        for (var k = 0; k < items.length; k++) {
            links.push("<a href=\"detail.html?id=" + items[k].id + "\" onclick=\"viewResource('" + items[k].title + "', '" + items[k].id + "')\">" + items[k].title + "</a>");
        }
        html += links.join(", ") + "</li>";
    }
    container.innerHTML = html;
}

function toggleNav() {
    var navLinks = document.getElementById("navLinks");
    if (navLinks) {
        navLinks.classList.toggle("open");
    }
}

function highlightNav() {
    var currentPage = window.location.pathname.split("/").pop() || "index.html";
    var navLinks = document.querySelectorAll(".nav-links-mobile a");
    for (var i = 0; i < navLinks.length; i++) {
        var link = navLinks[i];
        link.classList.remove("active");
        if (link.getAttribute("href") === currentPage) {
            link.classList.add("active");
        }
    }
}

function checkLoginStatus() {
    var currentUser = localStorage.getItem("currentUser");
    var navActions = document.getElementById("navActions");
    if (currentUser && navActions) {
        var user = JSON.parse(currentUser);
        navActions.innerHTML =
            '<a href="upload.html" class="btn-upload">上传资料</a>' +
            '<a href="user.html" class="btn-user">' + user.username + '</a>';
    }
}
