import "./styles/content.scss";

export function createOverlay(): HTMLDivElement {
    const overlay = document.createElement("div");
    overlay.className = "ai-overlay";
    overlay.style.display = "none";
    overlay.style.position = "fixed";
    overlay.style.bottom = "20px";
    overlay.style.right = "20px";
    overlay.style.width = "380px";
    overlay.style.height = "500px";
    overlay.style.borderRadius = "12px";
    overlay.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.15)";
    overlay.style.zIndex = "9999";
    overlay.style.backgroundColor = "white";

    // 头部区域
    const header = document.createElement("div");
    header.className = "ai-overlay__header";
    header.style.padding = "12px 16px";
    header.style.borderBottom = "1px solid #f0f0f0";
    header.style.display = "flex";
    header.style.justifyContent = "space-between";
    header.style.alignItems = "center";

    const title = document.createElement("h3");
    title.style.margin = "0";
    title.style.fontSize = "16px";
    title.textContent = "AI Assistant";

    const closeBtn = document.createElement("button");
    closeBtn.className = "ai-overlay__close";
    closeBtn.style.background = "none";
    closeBtn.style.border = "none";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.fontSize = "18px";
    closeBtn.textContent = "×";
    closeBtn.addEventListener("click", () => {
        overlay.style.display = "none";
    });

    header.appendChild(title);
    header.appendChild(closeBtn);

    // 内容区域
    const content = document.createElement("div");
    content.className = "ai-overlay__content";
    content.style.height = "calc(100% - 60px)";
    content.style.overflowY = "auto";
    content.style.padding = "16px";

    // 底部区域
    const footer = document.createElement("div");
    footer.className = "ai-overlay__footer";
    footer.style.padding = "12px 16px";
    footer.style.borderTop = "1px solid #f0f0f0";

    overlay.appendChild(header);
    overlay.appendChild(content);
    overlay.appendChild(footer);

    return overlay;
}
