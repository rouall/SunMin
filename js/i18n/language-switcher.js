/**
 * SunMin i18n 语言切换器
 * 自定义下拉组件：鼠标点击、点击外部、ESC、方向键、Home / End 均可操作
 */
(function (global) {
    'use strict';

    var I18n = global.I18n;
    if (!I18n) {
        console.error('[i18n] 缺少 i18n.js，语言切换器无法初始化');
        return;
    }

    function init() {
        var root = document.getElementById('langSwitcher');
        if (!root) return;

        var trigger = root.querySelector('.lang-trigger');
        var codeLabel = root.querySelector('.lang-trigger-code');
        var menu = root.querySelector('.lang-menu');
        if (!trigger || !codeLabel || !menu) return;

        var options = [];
        var isOpen = false;

        function createOptions() {
            I18n.languages.forEach(function (language) {
                var option = document.createElement('button');
                option.type = 'button';
                option.className = 'lang-option';
                option.setAttribute('role', 'option');
                option.setAttribute('data-lang', language.code);

                var name = document.createElement('span');
                name.className = 'lang-name';
                name.lang = language.code;
                name.dir = 'auto';
                name.textContent = language.nativeName;

                var check = document.createElement('span');
                check.className = 'lang-check';
                check.setAttribute('aria-hidden', 'true');
                check.textContent = '✓';

                option.appendChild(name);
                option.appendChild(check);

                option.addEventListener('click', function () {
                    I18n.setLang(language.code);
                    closeMenu(true);
                });

                menu.appendChild(option);
                options.push(option);
            });
        }

        function render() {
            var activeLanguage = I18n.getLang();
            var meta = I18n.languages.filter(function (language) {
                return language.code === activeLanguage;
            })[0] || I18n.languages[0];

            codeLabel.textContent = meta.shortLabel;
            trigger.setAttribute('aria-label', I18n.t('lang.label'));
            menu.setAttribute('aria-label', I18n.t('lang.label'));

            options.forEach(function (option) {
                var isActive = option.getAttribute('data-lang') === activeLanguage;
                option.classList.toggle('active', isActive);
                option.setAttribute('aria-selected', isActive ? 'true' : 'false');
            });
        }

        function setOpen(open) {
            isOpen = open;
            root.classList.toggle('open', open);
            trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
        }

        function focusOption(index) {
            var option = options[index];
            if (option) option.focus();
        }

        function getActiveIndex() {
            var activeLanguage = I18n.getLang();
            for (var i = 0; i < options.length; i++) {
                if (options[i].getAttribute('data-lang') === activeLanguage) return i;
            }
            return 0;
        }

        function openMenu() {
            setOpen(true);
            focusOption(getActiveIndex());
        }

        function closeMenu(returnFocus) {
            if (!isOpen) return;
            setOpen(false);
            if (returnFocus) trigger.focus();
        }

        trigger.addEventListener('click', function (event) {
            event.stopPropagation();
            if (isOpen) {
                closeMenu(false);
            } else {
                openMenu();
            }
        });

        trigger.addEventListener('keydown', function (event) {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                openMenu();
            }
        });

        menu.addEventListener('keydown', function (event) {
            var index = options.indexOf(document.activeElement);

            if (event.key === 'ArrowDown') {
                event.preventDefault();
                focusOption(index < 0 ? 0 : (index + 1) % options.length);
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                focusOption(index <= 0 ? options.length - 1 : index - 1);
            } else if (event.key === 'Home') {
                event.preventDefault();
                focusOption(0);
            } else if (event.key === 'End') {
                event.preventDefault();
                focusOption(options.length - 1);
            } else if (event.key === 'Escape') {
                event.preventDefault();
                closeMenu(true);
            } else if (event.key === 'Tab') {
                closeMenu(false);
            }
        });

        document.addEventListener('click', function (event) {
            if (isOpen && !root.contains(event.target)) {
                closeMenu(false);
            }
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && isOpen) {
                closeMenu(true);
            }
        });

        createOptions();
        render();
        I18n.onChange(render);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})(typeof window !== 'undefined' ? window : this);
