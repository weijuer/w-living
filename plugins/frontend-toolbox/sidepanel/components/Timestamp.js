import { BaseComponent } from '../base/BaseComponent.js';

// 时间戳转换工具
class Timestamp extends BaseComponent {
    template() {
        return `
      <input type="number" placeholder="输入时间戳" id="timestamp-input">
      <div class="result" id="timestamp-result"></div>
    `;
    }

    setupEvents() {
        const input = this.shadowRoot.getElementById('timestamp-input');
        const result = this.shadowRoot.getElementById('timestamp-result');

        input.addEventListener('input', () => {
            const timestamp = parseInt(input.value);
            if (!isNaN(timestamp)) {
                const date = new Date(timestamp * 1000);
                result.textContent = date.toLocaleString();
            }
        });
    }
}

export const registerTimestamp = () => customElements.define('w-timestamp', Timestamp);