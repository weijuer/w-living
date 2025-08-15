/**
 * 检查值是否为基本类型
 * @param {*} value - 要检查的值
 * @returns {boolean} 如果是基本类型则返回true
 */
export const isPrimitive = (value) => {
    return (
        value === null ||
        (typeof value !== 'object' && typeof value !== 'function')
    );
};

/**
 * 深度比较两个值是否不同
 * @param {*} a - 第一个值
 * @param {*} b - 第二个值
 * @returns {boolean} 如果值不同则返回true
 */
export const notEqual = (a, b) => {
    // 检查引用是否相同
    if (a === b) return false;

    // 检查是否都是NaN
    if (a !== a && b !== b) return false;

    // 检查对象和数组的深度差异
    if (typeof a === 'object' && a !== null && typeof b === 'object' && b !== null) {
        // 处理数组
        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) return true;
            for (let i = 0; i < a.length; i++) {
                if (notEqual(a[i], b[i])) return true;
            }
            return false;
        }

        // 处理日期
        if (a instanceof Date && b instanceof Date) {
            return a.getTime() !== b.getTime();
        }

        // 处理对象
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);

        if (keysA.length !== keysB.length) return true;

        for (const key of keysA) {
            if (!Object.prototype.hasOwnProperty.call(b, key)) return true;
            if (notEqual(a[key], b[key])) return true;
        }

        return false;
    }

    // 基本类型比较
    return true;
};

/**
 * 安全地解析JSON字符串
 * @param {string} json - 要解析的JSON字符串
 * @param {*} fallback - 解析失败时的回退值
 * @returns {*} 解析结果或回退值
 */
export const safeJsonParse = (json, fallback = undefined) => {
    try {
        return JSON.parse(json);
    } catch {
        return fallback;
    }
};

/**
 * 合并多个对象
 * @param {...Object} sources - 要合并的对象
 * @returns {Object} 合并后的对象
 */
export const mergeObjects = (...sources) => {
    return sources.reduce((acc, source) => {
        if (source) {
            Object.keys(source).forEach(key => {
                if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                    acc[key] = mergeObjects(acc[key] || {}, source[key]);
                } else {
                    acc[key] = source[key];
                }
            });
        }
        return acc;
    }, {});
};
