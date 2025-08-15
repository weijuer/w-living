import { defineStore } from 'pinia'
import { sendMessageToBackground } from '@/api/chrome'

interface Message {
    content: string
    isUser: boolean
    timestamp?: Date
}

export const useChatStore = defineStore('chat', {
    state: () => ({
        messages: [] as Message[],
        history: [] as { id: string; title: string; messages: Message[] }[],
        currentSessionId: null as string | null,
        settings: {
            model: 'gpt-3.5-turbo',
            temperature: 0.7,
            maxTokens: 1000
        }
    }),
    actions: {
        async sendMessage(content: string) {
            // 添加用户消息到当前会话
            const userMessage: Message = {
                content,
                isUser: true,
                timestamp: new Date()
            }
            this.messages.push(userMessage)

            try {
                // 发送请求到background service worker
                const response = await sendMessageToBackground('AI_REQUEST', {
                    prompt: content,
                    model: this.settings.model,
                    temperature: this.settings.temperature,
                    maxTokens: this.settings.maxTokens
                })

                if (response.success) {
                    // 添加AI响应
                    this.messages.push({
                        content: response.data,
                        isUser: false,
                        timestamp: new Date()
                    })
                    return response.data
                }
                throw new Error('Failed to get AI response')
            } catch (error) {
                console.error('Error sending message:', error)
                throw error
            }
        },
        newSession() {
            // 保存当前会话到历史
            if (this.messages.length > 0 && this.currentSessionId) {
                this.history.push({
                    id: this.currentSessionId,
                    title: this.messages[0].content.substring(0, 30),
                    messages: [...this.messages]
                })
            }
            // 创建新会话
            this.currentSessionId = Date.now().toString()
            this.messages = []
        },
        loadSession(id: string) {
            const session = this.history.find(s => s.id === id)
            if (session) {
                this.currentSessionId = id
                this.messages = [...session.messages]
            }
        },
        updateSettings(newSettings: Partial<typeof this.settings>) {
            this.settings = { ...this.settings, ...newSettings }
            // 保存到chrome.storage
            chrome.storage.sync.set({ settings: this.settings })
        }
    },
    getters: {
        hasUnread: state => state.history.some(s => !s.read),
        currentSessionTitle: state => {
            if (!state.messages.length) return 'New Chat'
            return state.messages[0].content.substring(0, 30) + '...'
        }
    }
})
