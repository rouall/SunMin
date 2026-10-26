/**
 * SunMin i18n 运行时
 * - 首次访问跟随浏览器语言，未匹配到支持语言时默认中文
 * - 用户手动切换后写入 localStorage，保留其选择
 * - 阿拉伯语自动切换为 RTL
 */
(function (global) {
    'use strict';

    var data = global.SunMinI18nData;
    if (!data) {
        console.error('[i18n] 缺少 translations.js，无法初始化多语言');
        return;
    }

    var RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];
    var order = data.order;
    var translations = data.translations;
    var localeMap = {};
    data.languages.forEach(function (item) {
        localeMap[item.code] = item.locale;
    });

    var currentLanguage = data.defaultLanguage;
    var listeners = [];

    function readStoredLanguage() {
        try {
            return global.localStorage.getItem(data.storageKey);
        } catch (error) {
            return null;
        }
    }

    function persistLanguage(language) {
        try {
            global.localStorage.setItem(data.storageKey, language);
        } catch (error) {
            /* 隐私模式或存储被禁用时静默降级 */
        }
    }

    /** 将 "zh-CN" / "pt_BR" 等规范化为受支持的语言代码 */
    function normalize(raw) {
        if (!raw || typeof raw !== 'string') return null;
        var base = raw.toLowerCase().replace(/_/g, '-').split('-')[0];
        return order.indexOf(base) !== -1 ? base : null;
    }

    function detectLanguage() {
        var stored = normalize(readStoredLanguage());
        if (stored) return stored;

        var candidates = [];
        if (global.navigator) {
            if (Array.isArray(global.navigator.languages)) {
                candidates = candidates.concat(global.navigator.languages);
            }
            if (global.navigator.language) candidates.push(global.navigator.language);
            if (global.navigator.userLanguage) candidates.push(global.navigator.userLanguage);
        }

        for (var i = 0; i < candidates.length; i++) {
            var matched = normalize(candidates[i]);
            if (matched) return matched;
        }
        return data.defaultLanguage;
    }

    function directionOf(language) {
        return RTL_LANGUAGES.indexOf(language) !== -1 ? 'rtl' : 'ltr';
    }

    function lookup(language, key) {
        var dict = translations[language];
        if (dict && Object.prototype.hasOwnProperty.call(dict, key)) {
            return dict[key];
        }
        var fallback = translations[data.fallbackLanguage];
        if (fallback && Object.prototype.hasOwnProperty.call(fallback, key)) {
            return fallback[key];
        }
        return key;
    }

    function interpolate(value, vars) {
        if (!vars) return value;
        return value.replace(/\{(\w+)\}/g, function (match, name) {
            return Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match;
        });
    }

    /** 翻译指定键；vars 用于替换 {username} 之类的占位符 */
    function t(key, vars) {
        return interpolate(lookup(currentLanguage, key), vars);
    }

    function notify() {
        for (var i = 0; i < listeners.length; i++) {
            try {
                listeners[i](currentLanguage);
            } catch (error) {
                console.error('[i18n] 监听器执行失败', error);
            }
        }
        if (typeof global.CustomEvent === 'function' && document.dispatchEvent) {
            document.dispatchEvent(new global.CustomEvent('i18n:changed', {
                detail: { language: currentLanguage }
            }));
        }
    }

    /** 将当前语言应用到页面所有标记节点 */
    function apply() {
        var root = document.documentElement;
        root.lang = currentLanguage;
        root.dir = directionOf(currentLanguage);
        root.setAttribute('data-lang', currentLanguage);

        document.title = t('meta.title');

        document.querySelectorAll('[data-i18n]').forEach(function (element) {
            var key = element.getAttribute('data-i18n');
            if (key) element.textContent = t(key);
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(function (element) {
            element.setAttribute('placeholder', t(element.getAttribute('data-i18n-placeholder')));
        });

        document.querySelectorAll('[data-i18n-aria-label]').forEach(function (element) {
            element.setAttribute('aria-label', t(element.getAttribute('data-i18n-aria-label')));
        });

        notify();
    }

    function setLanguage(language, options) {
        var next = normalize(language);
        if (!next) return currentLanguage;

        currentLanguage = next;
        if (!options || options.persist !== false) {
            persistLanguage(next);
        }
        apply();
        return currentLanguage;
    }

    function getLanguage() {
        return currentLanguage;
    }

    function getLocale() {
        return localeMap[currentLanguage] || data.defaultLanguage;
    }

    /** 按当前语言格式化数字（如德语使用点作为千位分隔符） */
    function formatNumber(value) {
        var number = Number(value);
        if (!isFinite(number)) return String(value);
        try {
            return number.toLocaleString(getLocale());
        } catch (error) {
            return number.toLocaleString();
        }
    }

    function onChange(listener) {
        if (typeof listener !== 'function') return function () {};
        listeners.push(listener);
        return function () {
            listeners = listeners.filter(function (item) {
                return item !== listener;
            });
        };
    }

    // 尽早写入 lang/dir，减少首屏语言属性闪烁
    currentLanguage = detectLanguage();
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = directionOf(currentLanguage);

    function boot() {
        apply();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }

    global.I18n = {
        t: t,
        setLang: setLanguage,
        getLang: getLanguage,
        getLocale: getLocale,
        direction: function () {
            return directionOf(currentLanguage);
        },
        number: formatNumber,
        apply: apply,
        onChange: onChange,
        languages: data.languages
    };
})(typeof window !== 'undefined' ? window : this);
