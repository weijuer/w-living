// 定义基础工具类
export class BaseComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.setupEvents();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 1rem;
        }
        .tool-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        input, textarea {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-1);
        }
      </style>
      <div class="tool-container">
        ${this.template()}
      </div>
    `;
  }
}
