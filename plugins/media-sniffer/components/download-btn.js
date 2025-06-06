class DownloadBtn extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.url = this.getAttribute('url');
    }

    connectedCallback() {
        this.render();
        this.shadowRoot.querySelector('button').addEventListener('click', () => {
            const filename = this.url.split('/').pop();
            chrome.runtime.sendMessage({
                type: 'download',
                url: this.url,
                filename: filename
            });
        });
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                button {
                    background-color: #2ea44f;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    padding: 4px 12px;
                    font-size: 12px;
                    cursor: pointer;
                }
                button:hover {
                    background-color: #2c974b;
                }
            </style>
            <button>下载</button>
        `;
    }
}

customElements.define('download-btn', DownloadBtn);
