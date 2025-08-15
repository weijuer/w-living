import { registerPrompt, registerTabs, registerTab, registerPanel, registerButton, registerCheckbox } from './components/index.js';

// 注册自定义元素
const app = () => {
    registerTabs();
    registerTab();
    registerPanel();
    registerPrompt();
    registerButton();
    registerCheckbox();
}

document.addEventListener("DOMContentLoaded", app);
