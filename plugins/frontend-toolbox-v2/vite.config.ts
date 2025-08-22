import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            "@": resolve(__dirname, "src"),
        },
    },
    build: {
        // 多入口配置（sidepanel、content-script、background）
        rollupOptions: {
            input: {
                sidepanel: resolve(__dirname, "index.html"),
                contentScript: resolve(
                    __dirname,
                    "src/content-script/index.ts"
                ),
                background: resolve(__dirname, "src/background/index.ts"),
            },
            output: {
                entryFileNames: (chunkInfo) => {
                    console.log("Chunk info:", chunkInfo);
                    // 根据入口文件设置不同输出目录
                    if (chunkInfo.name === "contentScript") {
                        return "content-script/index.js";
                    } else if (chunkInfo.name === "background") {
                        return "background/index.js";
                    }
                    return "sidepanel/[name].js";
                },
            },
        },
    },
});
