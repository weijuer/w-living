export type LogLevel = "log" | "info" | "warn" | "error";

/** 日志级别权重映射 */
const LOG_LEVEL_WEIGHT: Record<LogLevel, number> = {
    log: 10,
    info: 20,
    warn: 30,
    error: 40,
};

/** 日志级别常量集合 */
export const LogLevels = {
    LOG: "log" as LogLevel,
    INFO: "info" as LogLevel,
    WARN: "warn" as LogLevel,
    ERROR: "error" as LogLevel,
} as const;

/** 日志配置选项 */
export interface LoggerOptions {
    /** 日志前缀 */
    prefix?: string;
    /** 自定义日志颜色 */
    color?: string;
    /** 是否显示时间戳 */
    showTimestamp?: boolean;
    /** 最小日志级别，低于此级别的日志将被忽略 */
    minLevel?: LogLevel;
    /** 是否禁用所有日志输出 */
    disabled?: boolean;
}

/** 日志颜色配置 */
const LOG_COLORS = {
    log: "color: green;",
    info: "color: blue;",
    warn: "color: orangered;",
    error: "color: red; font-weight: bold;",
    timestamp: "color: #666;",
    prefix: "color: purple; font-weight: bold;",
} as const;

/**
 * 增强型日志工具类
 * 支持多种日志级别、类型安全、自定义格式和错误堆栈捕获
 */
export class Logger {
    private prefix?: string;
    private color?: string;
    private showTimestamp: boolean;
    private minLevel: LogLevel;
    private disabled: boolean;
    private consoleMethodMap: Record<LogLevel, keyof Console> = {
        log: "log",
        info: "info",
        warn: "warn",
        error: "error",
    };

    /**
     * 创建日志工具实例
     * @param options 日志配置选项
     */
    constructor(options: LoggerOptions = {}) {
        this.prefix = options.prefix;
        this.color = options.color;
        this.showTimestamp = options.showTimestamp !== true;
        this.minLevel = options.minLevel || LogLevels.LOG;
        this.disabled = options.disabled || false;
    }

    /**
     * 生成带样式的日志前缀
     */
    private getStyledPrefix(): [string, string] {
        const prefixStyle = this.color || LOG_COLORS.prefix;
        return [prefixStyle, `[${this.prefix}]`];
    }

    /**
     * 生成带样式的时间戳
     */
    private getStyledTimestamp(): [string, string] {
        return [LOG_COLORS.timestamp, new Date().toLocaleTimeString("zh-CN")];
    }

    /**
     * 检查日志级别是否启用
     * @param level 日志级别
     */
    private isLevelEnabled(level: LogLevel): boolean {
        return LOG_LEVEL_WEIGHT[level] >= LOG_LEVEL_WEIGHT[this.minLevel];
    }

    /**
     * 基础日志方法（带级别参数）
     * @param level 日志级别
     * @param args 日志参数
     */
    private logWithLevel(level: LogLevel, ...args: unknown[]): void {
        if (this.disabled || !this.isLevelEnabled(level)) return;

        const consoleMethod = this.consoleMethodMap[level];
        const levelStyle = LOG_COLORS[level];
        const logArgs: unknown[] = [];
        const styleParts: string[] = [];
        const contentParts: unknown[] = [];

        // 收集前缀和时间戳样式与内容
        const [prefixStyle, prefixContent] = this.getStyledPrefix();
        styleParts.push(prefixStyle);
        contentParts.push(prefixContent);

        if (this.showTimestamp) {
            const [timeStyle, timeContent] = this.getStyledTimestamp();
            styleParts.push(timeStyle);
            contentParts.push(timeContent);
        }

        // 添加日志级别样式
        styleParts.push(levelStyle);

        // 构建格式化字符串和参数
        const formatString = styleParts.map(() => "%c%s").join(" ");
        logArgs.push(formatString);

        // 合并样式、内容和日志参数
        styleParts.forEach((style) => logArgs.push(style));
        contentParts.forEach((content) => logArgs.push(content));
        logArgs.push(...args);

        // 调用对应控制台方法
        // eslint-disable-next-line no-console
        (console[consoleMethod] as (...args: unknown[]) => void)(...logArgs);
    }

    /**
     * 常规日志
     * @param args 日志参数
     */
    log(...args: unknown[]): void {
        this.logWithLevel(LogLevels.LOG, ...args);
    }

    /**
     * 信息日志
     * @param args 日志参数
     */
    info(...args: unknown[]): void {
        this.logWithLevel(LogLevels.INFO, ...args);
    }

    /**
     * 警告日志
     * @param args 日志参数
     */
    warn(...args: unknown[]): void {
        this.logWithLevel(LogLevels.WARN, ...args);
    }

    /**
     * 错误日志
     * @param args 日志参数，支持Error对象自动提取堆栈
     */
    error(...args: unknown[]): void {
        const enhancedArgs = args.map((arg) => {
            if (arg instanceof Error) {
                return {
                    message: arg.message,
                    stack: arg.stack,
                    name: arg.name,
                };
            }
            return arg;
        });
        this.logWithLevel(LogLevels.ERROR, ...enhancedArgs);
    }

    /**
     * 动态修改日志级别
     * @param level 新的日志级别
     */
    setMinLevel(level: LogLevel): void {
        this.minLevel = level;
    }

    /**
     * 启用或禁用日志
     * @param disabled 是否禁用
     */
    setDisabled(disabled: boolean): void {
        this.disabled = disabled;
    }

    /**
     * 创建带命名空间的子日志实例
     * @param namespace 子日志命名空间
     * @returns 新的Logger实例
     */
    createChildLogger(namespace: string): Logger {
        return new Logger({
            prefix: `${this.prefix}:${namespace}`,
            color: this.color,
            showTimestamp: this.showTimestamp,
            minLevel: this.minLevel,
            disabled: this.disabled,
        });
    }
}

/** 默认日志实例 */
export const logger = new Logger();
