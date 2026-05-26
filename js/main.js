/**
 * 主逻辑模块 - 中石大克校区资源共享论坛
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

// ===== 用户状态管理 =====
function getCurrentUser() {
    var userStr = localStorage.getItem("currentUser");
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch (e) {
            return null;
        }
    }
    return null;
}

function updateNavUserState() {
    var user = getCurrentUser();
    var userAvatar = document.getElementById("userAvatarBtn");
    var userDropdown = document.getElementById("userDropdownMenu");
    var loginLink = document.getElementById("loginLink");
    var dropdownUsername = document.getElementById("dropdownUsername");
    
    if (user && userAvatar) {
        // 已登录状态
        var initial = user.username ? user.username.charAt(0).toUpperCase() : '?';
        userAvatar.textContent = initial;
        userAvatar.style.display = "flex";
        if (loginLink) loginLink.style.display = "none";
        if (dropdownUsername) dropdownUsername.textContent = user.username;
        if (userDropdown) userDropdown.style.display = "block";
    } else {
        // 未登录状态
        if (userAvatar) userAvatar.style.display = "none";
        if (loginLink) loginLink.style.display = "inline-block";
        if (userDropdown) userDropdown.style.display = "none";
    }
}

function toggleUserMenu() {
    var menu = document.getElementById("userDropdownMenu");
    if (menu) {
        menu.classList.toggle("show");
    }
}

// 点击其他地方关闭下拉菜单
document.addEventListener("click", function(e) {
    var dropdown = document.getElementById("userDropdown");
    var menu = document.getElementById("userDropdownMenu");
    if (dropdown && menu) {
        if (!dropdown.contains(e.target)) {
            menu.classList.remove("show");
        }
    }
});

function logout() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("savedUsername");
    window.location.href = "index.html";
}

// 页面加载时更新用户状态
document.addEventListener("DOMContentLoaded", function() {
    setTimeout(updateNavUserState, 100);
});

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
    var hotSearches = document.getElementById("hotSearches");
    if (!container) return;

    var query = getUrlParam("q");
    var category = getUrlParam("cat");
    var sortBy = getUrlParam("sort") || "relevance";

    // 恢复筛选状态
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

    // 没有搜索关键词时显示热门搜索
    if (!query && !category) {
        container.innerHTML = "";
        if (hotSearches) hotSearches.style.display = "block";
        return;
    }

    if (hotSearches) hotSearches.style.display = "none";

    // 无结果时显示友好提示
    if (results.length === 0) {
        var suggestions = getSearchSuggestions(query);
        container.innerHTML = '<div class="search-empty">' +
            '<div class="search-empty-icon">🔍</div>' +
            '<h3>未找到相关资源</h3>' +
            '<p>没有找到与 "<strong>' + escapeHtml(query) + '</strong>" 相关的资料</p>' +
            '<p style="margin-top: 10px; font-size: 14px;">试试以下方式：</p>' +
            '<div class="suggestions">' +
            suggestions +
            '</div>' +
            '<div style="margin-top: 25px;">' +
            '<a href="upload.html" class="suggestion-tag">📤 成为第一个上传者</a>' +
            '</div>' +
            '</div>';
        return;
    }

    // 显示结果
    var html = '<div class="results-header">' +
        '<div class="results-count">找到 <strong>' + results.length + '</strong> 个相关资源</div>' +
        '</div>';

    for (var j = 0; j < results.length; j++) {
        var res = results[j];
        var desc = res.description || "暂无描述";
        if (desc.length > 100) desc = desc.substring(0, 100) + "...";
        
        html += '<div class="result-item">';
        html += '<h3><a href="detail.html?id=' + res.id + '" onclick="viewResource(\'' + res.title + '\', \'' + res.id + '\')">' + escapeHtml(res.title) + '</a></h3>';
        html += '<div class="result-meta">';
        html += '<span>📁 ' + (DataStore.categoryNames[res.category] || res.category) + '</span>';
        html += '<span>👤 ' + res.uploader + '</span>';
        html += '<span>📅 ' + res.uploadTime + '</span>';
        html += '<span>⬇️ ' + (res.downloads || 0) + '次下载</span>';
        html += '</div>';
        if (desc !== "暂无描述") {
            html += '<div class="result-desc">' + escapeHtml(desc) + '</div>';
        }
        html += '</div>';
    }
    
    container.innerHTML = html;
}

// 获取搜索建议
function getSearchSuggestions(query) {
    var suggestions = [];
    
    if (query) {
        // 推荐相关搜索词
        suggestions.push('<a href="search.html?q=高等数学" class="suggestion-tag">高等数学</a>');
        suggestions.push('<a href="search.html?q=大学物理" class="suggestion-tag">大学物理</a>');
        suggestions.push('<a href="search.html?q=C语言" class="suggestion-tag">C语言</a>');
        suggestions.push('<a href="search.html?q=线性代数" class="suggestion-tag">线性代数</a>');
        suggestions.push('<a href="search.html?q=英语" class="suggestion-tag">英语四六级</a>');
    }
    
    return suggestions.join('');
}

// HTML转义
function escapeHtml(text) {
    if (!text) return "";
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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

// 性能优化：节流滚动事件
var throttleTimer;
function throttleScroll(callback, delay) {
    return function() {
        if (!throttleTimer) {
            throttleTimer = setTimeout(function() {
                callback();
                throttleTimer = null;
            }, delay);
        }
    };
}

// 导航栏滚动效果（带节流）
var navbar = document.getElementById("navbar");
if (navbar) {
    window.addEventListener("scroll", throttleScroll(function() {
        if (window.pageYOffset > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    }, 100), { passive: true });
}

// 移动端提示功能
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
}

function closeMobileTipPopup() {
    var popup = document.getElementById('mobileTipPopup');
    var bar = document.getElementById('mobileTipBar');
    if (popup) {
        popup.style.display = 'none';
    }
    if (bar) {
        bar.style.display = 'none';
    }
    localStorage.setItem('mobileTipClosed', 'true');
}

function checkMobileTip() {
    if (isMobile() && !localStorage.getItem('mobileTipClosed')) {
        var popup = document.getElementById('mobileTipPopup');
        var bar = document.getElementById('mobileTipBar');
        if (popup) {
            popup.style.display = 'flex';
        }
        if (bar) {
            bar.style.display = 'none';
        }
    }
}

// 自动检查移动端提示
checkMobileTip();
