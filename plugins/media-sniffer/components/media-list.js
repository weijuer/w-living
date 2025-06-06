class MediaList extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.mediaItems = [];
    }

    connectedCallback() {
        this.render();
        
        chrome.runtime.onMessage.addListener((request) => {
            if (request.type === 'mediaFound') {
                this.mediaItems = request.urls;
                this.render();
                // 更新计数
                document.getElementById('media-count').textContent = this.mediaItems.length;
            }
        });
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                li {
                    padding: 8px 12px;
                    margin-bottom: 8px;
                    background: white;
                    border-radius: 6px;
                    border: 1px solid #e1e4e8;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .url {
                    flex: 1;
                    font-size: 12px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    margin-right: 12px;
                }
            </style>
            <ul>
                ${this.mediaItems.map(url => `
                    <li>
                        <span class="url" title="${url}">${url}</span>
                        <download-btn url="${url}"></download-btn>
                    </li>
                `).join('')}
            </ul>
        `;
    }
}

customElements.define('media-list', MediaList);
