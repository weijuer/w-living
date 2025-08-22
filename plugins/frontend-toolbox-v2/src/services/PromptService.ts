import { Logger } from "../utils/log";

// 定义Prompt相关类型接口
export type PromptRole = "system" | "user" | "assistant";

export interface PromptMessage {
    role: PromptRole;
    content: string;
}

export interface CreateOptions {
    initialPrompts?: PromptMessage[];
}

export interface LanguageModelParams {
    defaultTopK: number;
    maxTopK: number;
    defaultTemperature: number;
}

export interface SendPromptOptions {
    temperature?: number;
    topK?: number;
    stream?: boolean;
}

export interface LanguageModelSession {
    prompt: (
        input: string | PromptMessage,
        options?: SendPromptOptions
    ) => Promise<string>;
    promptStreaming: (
        input: string | PromptMessage,
        options?: SendPromptOptions
    ) => AsyncGenerator<string>;
    clone: () => Promise<LanguageModelSession>;
    destroy: () => void;
    inputUsage: number;
    inputQuota: number;
    onquotaoverflow?: () => void;
}

/**
 * Prompt服务类，封装与语言模型的交互
 * 提供会话管理、消息发送和配额监控功能
 */
export class PromptService {
    private session: LanguageModelSession;
    private readonly logger: Logger;
    private quotaOverflowListeners: (() => void)[] = [];

    private constructor(session: LanguageModelSession) {
        this.session = session;
        this.logger = new Logger({ prefix: "PromptService" });
        this.setupQuotaOverflowHandler();
    }

    /**
     * 创建新的PromptService实例
     * @param options 创建选项，包含初始提示消息
     * @returns PromptService实例
     * @throws {Error} 当LanguageModel不可用时抛出错误
     */
    static async create(options?: CreateOptions): Promise<PromptService> {
        if (!globalThis.LanguageModel?.create) {
            throw new Error(
                "LanguageModel is not available in the current environment"
            );
        }

        try {
            const session = await globalThis.LanguageModel.create(options);
            return new PromptService(session);
        } catch (error) {
            const logger = new Logger({ prefix: "PromptService" });
            logger.error("Failed to create PromptService instance:", error);
            throw error;
        }
    }

    /**
     * 发送提示消息并获取完整响应
     * @param input 输入消息，可以是字符串或PromptMessage对象
     * @param options 发送选项，包含温度和topK等参数
     * @returns 模型返回的完整响应字符串
     */
    async sendPrompt(
        input: string | PromptMessage,
        options?: SendPromptOptions
    ): Promise<string> {
        try {
            return await this.session.prompt(input, options);
        } catch (error) {
            this.logger.error("Failed to send prompt:", error);
            throw error;
        }
    }

    /**
     * 流式发送提示消息
     * @param input 输入消息，可以是字符串或PromptMessage对象
     * @param options 发送选项，包含温度和topK等参数
     * @returns 异步生成器，用于获取流式响应
     */
    async *sendPromptStreaming(
        input: string | PromptMessage,
        options?: SendPromptOptions
    ): AsyncGenerator<string> {
        try {
            const stream = this.session.promptStreaming(input, options);
            for await (const chunk of stream) {
                yield chunk;
            }
        } catch (error) {
            this.logger.error("Failed to stream prompt:", error);
            throw error;
        }
    }

    /**
     * 获取语言模型参数信息
     * @returns 模型参数对象或null
     */
    static async getParams(): Promise<LanguageModelParams | null> {
        if (!globalThis.LanguageModel?.params) {
            return null;
        }

        try {
            return await globalThis.LanguageModel.params();
        } catch (error) {
            const logger = new Logger({ prefix: "PromptService" });
            logger.error("Failed to get model parameters:", error);
            return null;
        }
    }

    /**
     * 克隆当前会话
     * @returns 新的PromptService实例
     */
    async clone(): Promise<PromptService> {
        try {
            const newSession = await this.session.clone();
            return new PromptService(newSession);
        } catch (error) {
            this.logger.error("Failed to clone session:", error);
            throw error;
        }
    }

    /**
     * 销毁当前会话
     */
    destroy(): void {
        try {
            this.session.destroy();
            this.quotaOverflowListeners = [];
        } catch (error) {
            this.logger.error("Failed to destroy session:", error);
        }
    }

    /**
     * 获取当前输入使用量
     * @returns 已使用的输入量
     */
    getInputUsage(): number {
        return this.session.inputUsage;
    }

    /**
     * 获取输入配额
     * @returns 输入配额总量
     */
    getInputQuota(): number {
        return this.session.inputQuota;
    }

    /**
     * 添加配额溢出监听器
     * @param callback 配额溢出时调用的回调函数
     * @returns 用于移除监听器的函数
     */
    onQuotaOverflow(callback: () => void): () => void {
        this.quotaOverflowListeners.push(callback);

        // 返回用于移除监听器的函数
        return () => {
            this.quotaOverflowListeners = this.quotaOverflowListeners.filter(
                (listener) => listener !== callback
            );
        };
    }

    /**
     * 设置配额溢出处理程序
     * 内部方法，用于统一触发所有监听器
     */
    private setupQuotaOverflowHandler(): void {
        this.session.onquotaoverflow = () => {
            this.logger.warn("Input quota has been exceeded");
            this.quotaOverflowListeners.forEach((callback) => {
                try {
                    callback();
                } catch (error) {
                    this.logger.error(
                        "Error in quota overflow callback:",
                        error
                    );
                }
            });
        };
    }
}
