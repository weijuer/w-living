import BaseComponent from "../base/BaseComponent.js";

class WTabs extends BaseComponent {
    get template() {
        return `
            <link rel="stylesheet" href="${new URL('./tabs.css', import.meta.url)}">
            <div class="tab-header" data-ref="header">
                <slot name="tabs"></slot>
            </div>
            <div class="tab-content" data-ref="content">
                <slot name="panels"></slot>
            </div>
        `;
    }

    setupEventListeners() {
        this.refs.header.addEventListener(
            "click",
            this.#handleTabClick.bind(this)
        );
    }

    #handleTabClick(e) {
        const tab = e.target.closest('[role="tab"]');
        if (tab) {
            this.#switchTab(tab.dataset.target);
        }
    }

    #switchTab(targetId) {
        // 切换标签状态
        this.querySelectorAll('[role="tab"]').forEach((t) =>
            t.classList.toggle("active", t.dataset.target === targetId)
        );

        // 切换内容面板
        this.querySelectorAll('[role="tabpanel"]').forEach((p) =>
            p.classList.toggle("active", p.id === targetId)
        );
    }
}

export const registerTabs = () => WTabs.define("w-tabs");
