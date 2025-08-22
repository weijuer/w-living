import { logger } from "../utils/log";

// 定义消息类型
export type MessageType = "AI_REQUEST" | "CONFIG_UPDATE" | "USER_ACTION";

export interface ExtensionMessage<T = any> {
    type: MessageType;
    payload?: T;
    requestId?: string;
}

export interface MessageResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * 发送消息到background脚本
 */
export async function sendMessageToBackground<T = any>(
    type: MessageType,
    payload?: any
): Promise<MessageResponse<T>> {
    return new Promise((resolve, reject) => {
        const requestId = crypto.randomUUID();
        const message: ExtensionMessage = {
            type,
            payload,
            requestId,
        };

        logger.log(`Sending message to background: ${type}`);

        chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
                logger.error(
                    `Message error: ${chrome.runtime.lastError.message}`
                );
                reject(new Error(chrome.runtime.lastError.message));
                return;
            }

            if (!response) {
                reject(new Error("No response from background"));
                return;
            }

            resolve(response as MessageResponse<T>);
        });
    });
}

/**
 * 获取当前激活的标签页
 */
export async function getActiveTab() {
    return new Promise<chrome.tabs.Tab>((resolve) => {
        chrome.tabs.query(
            {
                active: true,
                currentWindow: true,
            },
            (tabs) => {
                resolve(tabs[0]);
            }
        );
    });
}
