import { loadModule } from "vue3-sfc-loader";
import * as Vue from "vue";

const { defineAsyncComponent, createApp } = Vue;

const options = {
    moduleCache: {
        vue: Vue,
    },
    async getFile(url) {
        const res = await fetch(url);
        if (!res.ok) return;
        return {
            getContentData: (asBinary) => (asBinary ? res.arrayBuffer() : res.text()),
        };
    },
    addStyle(textContent) {
        const style = Object.assign(document.createElement("style"), {
            textContent,
        });
        const ref = document.head.getElementsByTagName("style")[0] || null;
        document.head.insertBefore(style, ref);
    },
};

// 引入 App.vue 根文件
const loadComponent = defineAsyncComponent(() =>
    loadModule("./App.vue", options)
);

// 挂载 vue
createApp(loadComponent).mount("#app");