// ==UserScript==
// @name         水木社区自动加载多页（自定义页数/SPA/GBK）
// @namespace    https://www.newsmth.net/
// @version      1.4
// @description  自动加载水木社区文章前N页，支持SPA与GBK，页数可自定义
// @author       GPT-4
// @match        https://www.newsmth.net/nForum/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // ====== 只需修改下面这个参数 ======
    const AUTOLOAD_PAGES = 10; // 想加载几页就写几页！

    // ==== 以下无需修改 ====
    let lastArticleUrl = null;

    async function autoloadPages() {
        if (!location.hash.startsWith('#!article/')) return;
        if (lastArticleUrl === location.href) {
            console.log('[BBS-Autoload] Already loaded this article, skip.');
            return;
        }
        lastArticleUrl = location.href;
        console.log('[BBS-Autoload] 进入文章页:', location.href);

        let retry = 30;
        let mainSection;
        while (retry-- > 0) {
            mainSection = document.querySelector('#body');
            if (mainSection && mainSection.querySelector('.a-wrap.corner')) break;
            await new Promise(r => setTimeout(r, 200));
        }
        if (!mainSection) {
            console.log('[BBS-Autoload] 没有找到主内容区 #body');
            return;
        }
        console.log('[BBS-Autoload] 找到主内容区，开始处理分页...');

        function getPageUrls() {
            let pageNav = document.querySelector('.page-main');
            if (!pageNav) {
                console.log('[BBS-Autoload] 没有分页导航。');
                return [location.href];
            }
            let links = Array.from(pageNav.querySelectorAll('a[title^="转到第"]'));
            let urls = [];
            urls.push(location.href);
            for (let i = 0; i < links.length; i++) {
                let url = links[i].href;
                if (!urls.includes(url) && urls.length < AUTOLOAD_PAGES) {
                    urls.push(url);
                }
            }
            if (urls.length < AUTOLOAD_PAGES) {
                let base = location.href.replace(/(\?|&)p=\d+/, '').replace(/#.*$/, '');
                for (let p = 2; urls.length < AUTOLOAD_PAGES; p++) {
                    let candidate = base + (base.includes('?') ? '&' : '?') + 'p=' + p;
                    if (!urls.includes(candidate)) urls.push(candidate);
                }
            }
            console.log('[BBS-Autoload] 分页URL:', urls);
            return urls.slice(0, AUTOLOAD_PAGES);
        }

        function isAlreadyLoaded(url) {
            return !!document.querySelector('[data-autoloaded-page="' + url + '"]');
        }

        async function fetchAndAppend(url, afterNode) {
            if (isAlreadyLoaded(url)) {
                console.log(`[BBS-Autoload] 已加载: ${url}`);
                return;
            }
            console.log(`[BBS-Autoload] 拉取: ${url}`);
            try {
                let resp = await fetch(url, { credentials: 'include' });
                if (!resp.ok) throw new Error('Failed to load page: ' + url);
                let abuf = await resp.arrayBuffer();
                let text;
                try {
                    text = new TextDecoder("gbk").decode(abuf);
                    console.log(`[BBS-Autoload] 使用 GBK 编码解码成功: ${url}`);
                } catch (e) {
                    text = new TextDecoder("utf-8").decode(abuf);
                    console.log(`[BBS-Autoload] GBK 解码失败，使用 UTF-8: ${url}`);
                }
                let doc = new DOMParser().parseFromString(text, 'text/html');
                let wraps = doc.querySelectorAll('#body .a-wrap.corner');
                console.log(`[BBS-Autoload] ${url} 有 ${wraps.length} 个帖子块`);
                wraps.forEach(wrap => {
                    wrap.setAttribute('data-autoloaded-page', url);
                    wrap.style.borderTop = '2px dashed #ccc';
                    wrap.style.marginTop = '16px';
                    afterNode.parentNode.insertBefore(wrap, afterNode.nextSibling);
                    afterNode = wrap;
                });
            } catch (e) {
                console.error(`[BBS-Autoload] 拉取失败 ${url}:`, e);
            }
        }

        let indicator = document.createElement('div');
        indicator.textContent = `正在自动加载前${AUTOLOAD_PAGES}页……`;
        indicator.style = 'padding:8px;color:#888;text-align:center;font-size:15px;';
        mainSection.appendChild(indicator);

        let lastWraps = mainSection.querySelectorAll('.a-wrap.corner');
        let lastWrap = Array.from(lastWraps).pop();
        if (!lastWrap) {
            console.log('[BBS-Autoload] 当前页面没有找到帖子块！');
            return;
        }

        let urls = getPageUrls();
        for (let i = 1; i < urls.length; i++) {
            console.log(`[BBS-Autoload] 开始加载第${i+1}页: ${urls[i]}`);
            await fetchAndAppend(urls[i], lastWrap);
            lastWrap = Array.from(mainSection.querySelectorAll('.a-wrap.corner')).pop();
        }

        indicator.textContent = `前${AUTOLOAD_PAGES}页已加载完毕`;
        setTimeout(() => indicator.remove(), 2000);
        console.log('[BBS-Autoload] 所有页面加载完毕。');
    }

    window.addEventListener('hashchange', autoloadPages);
    autoloadPages();

})();