import { createOverlay } from "./overlay";
import { sendMessageToBackground } from "../api/chrome";
import "./styles/content.scss";

// 创建悬浮窗
const overlay = createOverlay();
document.body.appendChild(overlay);

// 监听来自后台的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Content script received message:", request, sender);

    if (request.type === "SHOW_OVERLAY") {
        overlay.style.display = "block";
        sendResponse({ success: true });
    } else if (request.type === "HIDE_OVERLAY") {
        overlay.style.display = "none";
        sendResponse({ success: true });
    }
});

// 获取选中文本并发送给AI
export async function processSelectedText() {
    const selection = window.getSelection()?.toString();
    if (!selection) return;

    try {
        const response = await sendMessageToBackground("AI_REQUEST", {
            prompt: `Explain this text: ${selection}`,
            type: "EXPLAIN",
        });
        if (response.success) {
            // 在悬浮窗中显示结果
            const contentElem = overlay.querySelector(".content");
            if (contentElem) {
                contentElem.innerHTML = response.data;
            }
        }
    } catch (error) {
        console.error("Error processing text:", error);
    }
}

// 添加快捷键支持 (Alt+A显示/隐藏)
document.addEventListener("keydown", (e) => {
    if (e.altKey && e.key === "a") {
        e.preventDefault();
        overlay.style.display =
            overlay.style.display === "none" ? "block" : "none";
    }
});
