<template>
    <div class="chat-window">
        <div class="chat-messages">
            <Message v-for="(msg, index) in messages" :key="index" :content="parseMarkdown(msg.content)"
                :is-user="msg.isUser" class="markdown-content" />
            <div v-if="isLoading" class="loading-indicator">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        </div>
        <PromptInput @submit="sendMessage" :disabled="isLoading" />
    </div>
</template>

<script setup lang="js">
import { ref, onMounted } from "vue";
import Message from "./Message.vue";
import PromptInput from "./PromptInput.vue";
import { PromptService } from "@/services/PromptService";
import { Logger } from "../utils/log";
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const isLoading = ref(false);
const messages = ref([]);
const promptService = ref(null);
const logger = new Logger({ prefix: "ChatWindow" });

async function initDefaults() {
    try {
        const defaults = await PromptService.getParams();
        logger.info("Model default:", defaults);
    } catch (error) {
        logger.error("Failed to get model parameters:", error);
    }
}

/**
 * 将Markdown转换为安全的HTML
 * @param content - 原始Markdown内容
 * @returns 净化后的HTML字符串
 */
const parseMarkdown = (content) => {
    if (!content) return '';
    // 先使用marked解析Markdown为HTML
    const html = marked.parse(content);
    // 再使用DOMPurify净化HTML，防止XSS攻击
    return DOMPurify.sanitize(html);
};

async function sendMessage(content) {
    if (!content.trim()) return;

    // 添加用户消息
    messages.value.push({ content, isUser: true });
    isLoading.value = true;

    try {
        const createOptions = {
            initialPrompts: [
                { role: 'system', content: 'You are a helpful and friendly assistant. Format your responses using Markdown for better readability.' }
            ]
        };

        // 初始化PromptService
        if (!promptService.value) {
            promptService.value = await PromptService.create(createOptions);
        }

        // 创建流式响应的临时消息对象
        const responseMessage = { content: '', isUser: false };
        messages.value.push(responseMessage);

        // 调用流式API并处理响应
        const stream = promptService.value.sendPromptStreaming(content, {
            temperature: 1,
            topK: 3,
            stream: true
        });

        // 逐块处理流式响应
        for await (const chunk of stream) {
            responseMessage.content += chunk;
            // 触发Vue响应式更新
            messages.value = [...messages.value];
        }
    } catch (error) {
        logger.error("Streamed prompt failed:", error);
        // 替换错误消息
        const lastMessage = messages.value[messages.value.length - 1];
        if (lastMessage && !lastMessage.isUser) {
            lastMessage.content = "Error: Could not stream response from AI";
        } else {
            messages.value.push({
                content: "Error: Could not stream response from AI",
                isUser: false,
            });
        }
    } finally {
        isLoading.value = false;
    }
}

onMounted(async () => {
    await initDefaults();

    // 设置配额溢出处理
    if (promptService.value) {
        promptService.value.onQuotaOverflow(() => {
            messages.value.push({
                content: "Warning: Your input quota has been exceeded.",
                isUser: false,
            });
        });
    }
});
</script>

<style lang="scss" scoped>
.chat-window {
    width: 100dvw;
    height: 100dvh;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .chat-header {
        padding: 12px 16px;
        background: #f5f5f5;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .controls {
            button {
                width: 24px;
                height: 24px;
                border: none;
                background: none;
                cursor: pointer;
                border-radius: 4px;

                &:hover {
                    background: #e0e0e0;
                }
            }
        }
    }

    .chat-messages {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    // 加载动画
    .loading-indicator {
        display: flex;
        gap: 6px;
        padding: 12px;

        .dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #666;
            animation: bounce 1.4s infinite ease-in-out both;

            &:nth-child(1) {
                animation-delay: -0.32s;
            }

            &:nth-child(2) {
                animation-delay: -0.16s;
            }
        }
    }
}

@keyframes bounce {

    0%,
    80%,
    100% {
        transform: scale(0);
    }

    40% {
        transform: scale(1);
    }
}

/* 添加Markdown内容样式 */
.markdown-content {
    .content {
        // 基础样式
        line-height: 1.6;
        white-space: pre-wrap;

        // 标题样式
        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
            margin: 1em 0 0.5em;
            font-weight: bold;
        }

        // 列表样式
        ul,
        ol {
            margin: 0.5em 0;
            padding-left: 2em;
        }

        // 代码块样式
        pre {
            background: #f5f5f5;
            padding: 1em;
            border-radius: 4px;
            overflow-x: auto;
            font-family: monospace;
        }

        // 行内代码样式
        code {
            background: #f5f5f5;
            padding: 0.2em 0.4em;
            border-radius: 4px;
            font-family: monospace;
        }

        // 引用样式
        blockquote {
            border-left: 4px solid #ddd;
            padding-left: 1em;
            margin: 0.5em 0;
            color: #666;
        }
    }
}
</style>