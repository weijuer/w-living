// 时间机器转换工具
import { registerTimeMachine } from './components/TimeMachine.js';
import { registerTranslate } from './components/Translate.js';
import { registerTimestamp } from './components/Timestamp.js';

// 注册自定义元素
const app = () => {
    registerTimeMachine();
    registerTranslate();
    registerTimestamp();
}

document.addEventListener("DOMContentLoaded", app);

// 工具切换逻辑
const tabs = document.querySelectorAll('.tab-btn');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelector('.tab-btn.active')?.classList.remove('active');
        tab.classList.add('active');

        const toolId = tab.dataset.tool;
        document.querySelector('.tool-pane.active')?.classList.remove('active');
        document.getElementById(toolId).classList.add('active');
    });
});