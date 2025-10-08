// 视频类规则通用预处理脚本
// 部署路径示例：https://raw.githubusercontent.com/你的用户名/你的仓库/main/video_pre_rule.js

// 全局工具函数：解析HTML字符串为DOM（依赖海阔视界内置的DOMParser）
function parseHtml(html) {
    return new DOMParser().parseFromString(html, 'text/html');
}

// 全局工具函数：提取URL中的参数
function getUrlParams(url) {
    const params = {};
    const queryString = url.split('?')[1];
    if (!queryString) return params;
    queryString.split('&').forEach(item => {
        const [key, value] = item.split('=');
        if (key) params[key] = decodeURIComponent(value || '');
    });
    return params;
}

// 全局工具函数：生成分页URL（根据页码替换占位符）
function getPageUrl(baseUrl, page) {
    return baseUrl.replace(/{{page}}/g, page) || baseUrl;
}

// YouTube专用预处理逻辑（可根据实际需求扩展）
function youtube() {
    // 1. 设置默认请求头（模拟移动端浏览器）
    const defaultHeaders = {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Referer': 'https://m.youtube.com/' // 模拟YouTube移动端 Referer
    };
    // 将 headers 挂载到全局，供后续请求使用
    window.globalHeaders = defaultHeaders;

    // 2. 定义基础解析规则（供find_rule调用）
    window.baseParse = function(html) {
        const doc = parseHtml(html);
        const videoList = [];

        // 示例：提取YouTube移动端页面的视频列表（实际选择器需根据页面结构调整）
        const items = doc.querySelectorAll('ytd-video-renderer, ytd-grid-video-renderer');
        items.forEach(item => {
            try {
                // 标题
                const titleEl = item.querySelector('#video-title');
                const title = titleEl?.textContent?.trim() || '未知标题';

                // 视频链接（相对路径转绝对路径）
                const href = titleEl?.href || '';
                const url = href.startsWith('http') ? href : `https://m.youtube.com${href}`;

                // 封面图
                const coverEl = item.querySelector('img.yt-img-shadow');
                const cover = coverEl?.src || coverEl?.dataset?.src || '';

                // 时长
                const durationEl = item.querySelector('.ytd-thumbnail-overlay-time-status-renderer');
                const duration = durationEl?.textContent?.trim() || '';

                // 作者
                const authorEl = item.querySelector('#channel-name a');
                const author = authorEl?.textContent?.trim() || '未知作者';

                videoList.push({
                    title,
                    url,
                    cover,
                    duration,
                    author,
                    // 海阔视界视频类规则必填字段
                    type: 'video',
                    col_type: 'movie_3'
                });
            } catch (e) {
                console.error('解析单条视频失败：', e);
            }
        });

        // 返回解析结果（符合海阔视界数据格式）
        return {
            list: videoList,
            hasMore: doc.querySelector('#continuation') ? true : false // 检测是否有下一页
        };
    };

    console.log('YouTube预处理完成，已加载工具函数和基础解析逻辑');
}

// 其他平台的预处理函数可在此扩展（如bilibili()、youtubeMusic()等）