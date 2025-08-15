import { WElement } from '@/internal/elements.js';

class Prompt extends WElement {
  get template() {
    return `
      <div class="chat-container">
        <div class="messages" data-ref="messages"></div>
        <div class="input-container">
          <textarea data-ref="input" type="text" placeholder="输入消息..."></textarea>
          <button data-ref="button">发送</button>
        </div>
      </div>
    `;
  }

  get styles() {
    return `
      :host {
        --primary-color: #007bff;
        --background-color: #fff;
        --chat-height: 500px;
        
        width: 100%;
        height: var(--chat-height);
        background: var(--background-color);
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        font-family: system-ui, sans-serif;
      }
      
      .chat-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        
      }
      
      .messages {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
      }
      
      .message {
        max-width: 80%;
        margin-bottom: 12px;
        padding: 8px 12px;
        border-radius: 12px;
        animation: fadeIn 0.3s ease;
      }
      
      .user-message {
        background: #007bff;
        color: white;
        margin-left: auto;
      }
      
      .bot-message {
        background: #f1f3f5;
        margin-right: auto;
      }
      
      .input-container {
        display: flex;
        padding: 16px;
        border-top: 1px solid #ddd;
      }
      
      input {
        flex: 1;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 20px;
        margin-right: 8px;
      }
      
      button {
        padding: 8px 16px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 20px;
        cursor: pointer;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
  }

  setupEventListeners() {
    this.refs.button.addEventListener('click', () => this.sendMessage());
    this.refs.input.addEventListener('keypress', e => {
      if (e.key === 'Enter') this.sendMessage();
    });
  }

  // 发送消息逻辑
  sendMessage() {
    const text = this.input.value.trim();
    if (!text) return;

    this.addMessage(text, 'user');
    this.input.value = '';
    // 这里可以添加机器人回复逻辑
  }

  // 添加消息到对话框
  addMessage(text, sender = 'bot') {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${sender}-message`;
    messageEl.textContent = text;

    this.messagesContainer.appendChild(messageEl);
    // 自动滚动到底部
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }
}

export const registerPrompt = () => Prompt.define('w-prompt');
