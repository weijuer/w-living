import { BaseComponent } from '../base/BaseComponent.js';

class TimeMachine extends BaseComponent {
    template() {
        return `
            <div class="time-inputs">
                <div>
                    <label>开始时间</label>
                    <input type="datetime-local" id="start-time">
                </div>
                <div>
                    <label>结束时间</label>
                    <input type="datetime-local" id="end-time">
                </div>
                <button id="calculate-btn">计算时间差</button>
            </div>
            <div class="result" id="time-result"></div>
        `;
    }

    setupEvents() {
        const startInput = this.shadowRoot.getElementById('start-time');
        const endInput = this.shadowRoot.getElementById('end-time');
        const calculateBtn = this.shadowRoot.getElementById('calculate-btn');
        const result = this.shadowRoot.getElementById('time-result');

        calculateBtn.addEventListener('click', () => {
            if (startInput.value && endInput.value) {
                const start = new Date(startInput.value);
                const end = new Date(endInput.value);
                const diff = Math.abs(end - start);

                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                result.textContent = `时间差: ${days}天 ${hours}小时 ${minutes}分钟 ${seconds}秒`;
            }
        });
    }
}

export const registerTimeMachine = () => customElements.define('w-time-machine', TimeMachine);

