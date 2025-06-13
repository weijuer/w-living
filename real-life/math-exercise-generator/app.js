import { jsPDF } from 'jspdf';

export class MathExerciseGenerator extends HTMLElement {
  // 私有配置（使用#语法声明私有属性）
  #config = {
    pageSize: 20,       // 每页题目数
    pageCount: 1,       // 总页数
    min: 0,             // 数值最小值
    max: 100,           // 数值最大值
    operations: ['add', 'sub'], // 允许的运算类型
    showVertical: false, // 是否显示竖式
    columns: 2,         // 每页分几列
    themeColor: '#2563eb' // 主题色（新增）
  };

  #exercises = []; // 存储所有题目（[页数][题目列表]）

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.#renderTemplate();
  }

  connectedCallback() {
    // 绑定事件（使用事件委托优化性能）
    this.shadowRoot.addEventListener('change', this.#handleConfigChange.bind(this));
    this.shadowRoot.querySelector('#generate-btn').addEventListener('click', () => {
      this.#validateConfig(); // 新增输入校验
      this.#generateExercises();
      this.#renderExercises();
    });
    this.shadowRoot.querySelector('#print-btn').addEventListener('click', () => window.print());
    this.shadowRoot.querySelector('#export-pdf-btn').addEventListener('click', () => this.#exportPDF());
  }

  // 输入校验（新增）
  #validateConfig() {
    if (this.#config.min > this.#config.max) {
      [this.#config.min, this.#config.max] = [this.#config.max, this.#config.min];
      alert('最小值不能大于最大值，已自动交换');
    }
    this.#config.pageSize = Math.max(5, Math.min(50, this.#config.pageSize)); // 限制5-50
    this.#config.pageCount = Math.max(1, Math.min(10, this.#config.pageCount)); // 限制1-10
  }

  // 处理配置变更
  #handleConfigChange(e) {
    const target = e.target;
    switch (target.name) {
      case 'pageSize':
        this.#config.pageSize = Number(target.value);
        break;
      case 'pageCount':
        this.#config.pageCount = Number(target.value);
        break;
      case 'min':
        this.#config.min = Number(target.value);
        break;
      case 'max':
        this.#config.max = Number(target.value);
        break;
      case 'columns':
        this.#config.columns = Number(target.value);
        break;
      case 'showVertical':
        this.#config.showVertical = target.checked;
        break;
      case 'operations':
        this.#config.operations = Array.from(
          this.shadowRoot.querySelectorAll('input[name="operations"]:checked')
        ).map(i => i.value);
        break;
    }
  }

  // 生成题目核心逻辑
  #generateExercises() {
    this.#exercises = [];
    for (let page = 0; page < this.#config.pageCount; page++) {
      const pageExercises = [];
      for (let i = 0; i < this.#config.pageSize; i++) {
        const op = this.#getRandomOperation();
        const [a, b] = this.#getValidNumbers(op);
        pageExercises.push(this.#formatExercise(a, b, op));
      }
      this.#exercises.push(pageExercises);
    }
  }

  // 获取随机运算类型（修复mix逻辑）
  #getRandomOperation() {
    const ops = this.#config.operations.includes('mix')
      ? ['add', 'sub', 'mul', 'div'] // mix时随机选其他类型
      : this.#config.operations;
    return ops[Math.floor(Math.random() * ops.length)];
  }

  // 获取有效数值对（优化循环逻辑）
  #getValidNumbers(op) {
    let a, b;
    do {
      a = Math.floor(Math.random() * (this.#config.max - this.#config.min + 1)) + this.#config.min;
      b = Math.floor(Math.random() * (this.#config.max - this.#config.min + 1)) + this.#config.min;
    } while (
      (op === 'sub' && a < b) ||
      (op === 'div' && (b === 0 || a % b !== 0))
    );
    return [a, b];
  }

  // 格式化题目（优化竖式样式）
  #formatExercise(a, b, op) {
    const symbolMap = { add: '+', sub: '-', mul: '×', div: '÷' };
    const symbol = symbolMap[op];

    if (!this.#config.showVertical) {
      return `<div class="exercise-item">${a} ${symbol} ${b} = ______</div>`;
    }

    // 竖式格式（使用CSS变量控制宽度）
    const maxLen = Math.max(a.toString().length, b.toString().length);
    return `
      <div class="exercise-item vertical">
        <div style="width: ${maxLen * 1.2}ch">${a}</div>
        <div>${symbol} ${b}</div>
        div class="divider">${'-'.repeat(maxLen * 1.2)}</div>
        <!-- <div>________</div> -->
      </div>
    `;
  }

  // 渲染题目到页面
  #renderExercises() {
    const container = this.shadowRoot.querySelector('.exercise-container');
    // 调试：打印当前列数
    console.log('当前分栏数：', this.#config.columns);
    container.innerHTML = this.#exercises.map((page, pageIdx) => `
      <div class="page" data-page="${pageIdx + 1}">
        <h3 class="page-title">第 ${pageIdx + 1} 页</h3>
        <div class="grid" style="grid-template-columns: repeat(${this.#config.columns}, 1fr)">
          ${page.join('')}
        </div>
      </div>
    `).join('');
  }

  // 导出PDF（优化布局计算）
  #exportPDF() {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pages = this.shadowRoot.querySelectorAll('.page');
    const margin = 15; // 边距

    pages.forEach((page, idx) => {
      if (idx > 0) doc.addPage();
      doc.html(page, {
        x: margin,
        y: margin,
        width: 210 - 2 * margin, // A4宽度210mm - 两边边距
        callback: () => { }
      });
    });
  }

  // 渲染模板（优化CSS变量和响应式）
  #renderTemplate() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 20px;
          --grid-gap: 15px;
          --theme-color: ${this.#config.themeColor};
        }

        .config-panel {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--grid-gap);
          margin-bottom: 20px;
          padding: 15px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }

        .grid {
          display: grid;
          gap: var(--grid-gap);
          margin-top: 10px;
          width: 100%;
        }

        /* 新增：竖式题目底部边距 */
        .vertical {
          margin-bottom: 24px; /* 可根据需求调整数值（如20px/24px） */
        }

        .vertical .divider {
          border-bottom: 1px solid #333;
          margin: 2px 0;
        }

        @media print {
          .config-panel, button { display: none !important; }
          .page { margin: 0; padding: 0; }
        }
      </style>

      <div class="config-panel">
        <div>
          <label>每页题目数：<input type="number" name="pageSize" value="20" min="5" max="50"></label>
        </div>
        <div>
          <label>总页数：<input type="number" name="pageCount" value="1" min="1" max="10"></label>
        </div>
        <div>
          <label>数值范围：<input type="number" name="min" value="0"> - <input type="number" name="max" value="100"></label>
        </div>
        <div>
          <label>分栏数：<input type="number" name="columns" value="2" min="1" max="4"></label>
        </div>
        <div>
          <label>显示竖式：<input type="checkbox" name="showVertical"></label>
        </div>
        <div>
          <p>运算类型：</p>
          ${['add', 'sub', 'mul', 'div', 'mix'].map(op => `
            <label><input type="checkbox" name="operations" value="${op}" ${op === 'add' || op === 'sub' ? 'checked' : ''}> ${op}</label>
          `).join('')}
        </div>
      </div>

      <div>
        <button id="generate-btn">生成题目</button>
        <button id="print-btn">打印题目</button>
        <button id="export-pdf-btn">导出PDF</button>
      </div>

      <div class="exercise-container"></div>
    `;
  }
}

// 注册Web Component
customElements.define('math-exercise-generator', MathExerciseGenerator);
