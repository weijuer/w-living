import { BaseComponent } from '../base/BaseComponent.js';

// 翻译工具
class Translate extends BaseComponent {
    template() {
        return `
      <textarea placeholder="输入要翻译的文字..." id="translate-input"></textarea>
      <div class="result" id="translate-result"></div>
    `;
    }

    setupEvents() {
        const input = this.shadowRoot.getElementById('translate-input');
        const result = this.shadowRoot.getElementById('translate-result');

        input.addEventListener('input', () => {
            const text = input.value.trim();
            result.textContent = text ? `翻译结果: ${text.split('').reverse().join('')}` : '';
        });
    }
}

export const registerTranslate = () => customElements.define('w-translate', Translate);