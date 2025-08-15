/**
 * 获取兼容的样式表
 * @param {CSSStyleSheet|string} style - 样式表或CSS字符串
 * @returns {CSSStyleSheet} 兼容的样式表
 */
export const getCompatibleStyleSheet = (style) => {
    if (style instanceof CSSStyleSheet) {
        return style;
    }

    const sheet = new CSSStyleSheet();
    try {
        if (typeof style === 'string') {
            sheet.replaceSync(style);
        } else if (Array.isArray(style)) {
            sheet.replaceSync(style.join('\n'));
        }
    } catch (error) {
        console.error('Failed to create stylesheet:', error);
        console.error('Problematic style content:', style);
    }
    return sheet;
};

/**
 * 创建CSS变量字符串
 * @param {Object} variables - CSS变量键值对
 * @returns {string} CSS变量声明字符串
 */
export const createCssVariables = (variables) => {
    return Object.entries(variables)
        .map(([key, value]) => `--${key}: ${value};`)
        .join('\n  ');
};

/**
 * 将样式表数组合并为单个样式表
 * @param {CSSStyleSheet[]} sheets - 样式表数组
 * @returns {CSSStyleSheet} 合并后的样式表
 */
export const mergeStyleSheets = (sheets) => {
    const merged = new CSSStyleSheet();
    const cssText = sheets.map(sheet => {
        try {
            return Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n');
        } catch (e) {
            console.warn('Could not access cssRules for stylesheet:', e);
            return '';
        }
    }).join('\n');

    merged.replaceSync(cssText);
    return merged;
};
