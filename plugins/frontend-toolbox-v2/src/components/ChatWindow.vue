<template>
    <div class="chat-window">
        <div class="chat-header">
            <h3>AI Assistant</h3>
            <div class="controls">
                <button @click="minimize">{{ isMinimized ? "+" : "-" }}</button>
                <button @click="close">×</button>
            </div>
        </div>
        <div class="chat-messages" v-if="!isMinimized">
            <Message v-for="(msg, index) in messages" :key="index" :content="msg.content" :is-user="msg.isUser" />
            <div v-if="isLoading" class="loading-indicator">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        </div>
        <PromptInput v-if="!isMinimized" @submit="sendMessage" :disabled="isLoading" />
    </div>
</template>

<script setup lang="js">
import { ref, onMounted } from "vue";
import Message from "./Message.vue";
import PromptInput from "./PromptInput.vue";

const isMinimized = ref(false);
const isLoading = ref(false);
const messages = ref([]);


let session;

async function runPrompt(prompt, params) {
    try {
        if (!session) {
            session = await LanguageModel.create(params);
        }
        return session.prompt(prompt);
    } catch (e) {
        console.log('Prompt failed');
        console.error(e);
        console.log('Prompt:', prompt);
        // Reset session
        reset();
        throw e;
    }
}

async function reset() {
    if (session) {
        session.destroy();
    }
    session = null;
}

async function initDefaults() {
    const defaults = await LanguageModel.params();
    console.log("Model default:", defaults);
    if (!("LanguageModel" in self)) {
        console.error("Model not available");
        return;
    }
}

const sendMessage = async (content) => {
    if (!content.trim()) return;

    // 添加用户消息
    messages.value.push({ content, isUser: true });
    isLoading.value = true;

    try {
        const params = {
            initialPrompts: [
                { role: 'system', content: 'You are a helpful and friendly assistant.' }
            ],
            temperature: 1,
            topK: 3
        };
        // 调用AI API
        const response = await runPrompt(content, params);
        messages.value.push({ content: response, isUser: false });
    } catch (error) {
        messages.value.push({
            content: "Error: Could not get response from AI",
            isUser: false,
        });
    } finally {
        isLoading.value = false;
    }
};

const minimize = () => {
    isMinimized.value = !isMinimized.value;
};

const close = () => {
    // 可以发送事件给父组件关闭窗口
    emit("close");
};

// 定义事件
const emit = defineEmits(["close"]);


onMounted(async () => {
    await initDefaults();
});
</script>

<style lang="scss" scoped>
.chat-window {
    width: 380px;
    height: 500px;
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
</style>
