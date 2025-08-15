import { isPrimitive, notEqual, safeJsonParse, mergeObjects } from './helpers.js';
import { getCompatibleStyleSheet, createCssVariables, mergeStyleSheets } from './style.js';

/**
 * 基础元素类，提供响应式属性、生命周期管理和渲染功能
 * @extends HTMLElement
 */
export class WElement extends HTMLElement {
  /**
   * 静态属性定义
   * @type {Object}
   */
  static properties = {};

  /**
   * 静态样式定义
   * @type {CSSStyleSheet|string|(CSSStyleSheet|string)[]}
   */
  static styles = [];

  /**
   * 是否委托焦点到shadow root
   * @type {boolean}
   */
  static delegatesFocus = false;

  #isConnected = false;
  #updatePending = false;
  #propertyCache = new Map();
  #styleSheets = [];
  #renderOptions = { host: this, scopeName: this.localName };
  #templateCache = null;

  constructor() {
    super();
    this.attachShadow({
      mode: 'open',
      delegatesFocus: this.constructor.delegatesFocus
    });
    this.#initializeProperties();
    this.#initializeStyles();
    this.#initializeEventListeners();
  }

  /**
   * 初始化响应式属性系统
   * @private
   */
  #initializeProperties() {
    const properties = this.constructor.properties;
    if (!properties) return;

    Object.keys(properties).forEach(name => {
      const options = { attribute: true, type: String, reflect: false, converter: null, ...properties[name] };
      const attributeName = options.attribute === true ? name.toLowerCase() : options.attribute;

      // 从DOM属性初始化值
      let value;
      if (attributeName && this.hasAttribute(attributeName)) {
        value = this.#convertAttributeValue(this.getAttribute(attributeName), options);
      } else if ('value' in options) {
        value = structuredClone(options.value);
      }

      this.#propertyCache.set(name, value);
      this.#definePropertyAccessor(name, options);
    });
  }

  /**
   * 定义属性访问器
   * @private
   * @param {string} name - 属性名称
   * @param {Object} options - 属性选项
   */
  #definePropertyAccessor(name, options) {
    Object.defineProperty(this, name, {
      get: () => this.#propertyCache.get(name),
      set: (newValue) => this.#setProperty(name, newValue, options),
      configurable: true,
      enumerable: true
    });
  }

  /**
   * 设置属性值并触发更新
   * @private
   * @param {string} name - 属性名称
   * @param {*} newValue - 新值
   * @param {Object} options - 属性选项
   */
  #setProperty(name, newValue, options) {
    const oldValue = this.#propertyCache.get(name);
    if (!this.#shouldPropertyUpdate(name, oldValue, newValue, options)) return;

    // 克隆对象以避免意外引用
    const valueToStore = typeof newValue === 'object' && newValue !== null ? structuredClone(newValue) : newValue;
    this.#propertyCache.set(name, valueToStore);

    if (options.reflect) {
      this.#reflectPropertyToAttribute(name, valueToStore, options);
    }

    this.requestUpdate(name, oldValue, valueToStore);
  }

  /**
   * 判断属性是否应该更新
   * @private
   * @param {string} name - 属性名称
   * @param {*} oldValue - 旧值
   * @param {*} newValue - 新值
   * @param {Object} options - 属性选项
   * @returns {boolean} 是否应该更新
   */
  #shouldPropertyUpdate(name, oldValue, newValue, options) {
    if (options.hasOwnProperty('shouldUpdate')) {
      return options.shouldUpdate.call(this, oldValue, newValue);
    }
    return notEqual(oldValue, newValue) || (options.type === Object && !isPrimitive(oldValue));
  }

  /**
   * 将属性值反射到DOM属性
   * @private
   * @param {string} name - 属性名称
   * @param {*} value - 属性值
   * @param {Object} options - 属性选项
   */
  #reflectPropertyToAttribute(name, value, options) {
    const attributeName = options.attribute === true ? name.toLowerCase() : options.attribute;
    if (!attributeName) return;

    if (value === null || value === undefined) {
      this.removeAttribute(attributeName);
    } else {
      this.setAttribute(attributeName, this.#convertPropertyToAttribute(value, options));
    }
  }

  /**
   * 转换属性值
   * @private
   * @param {string} value - 属性值
   * @param {Object} options - 属性选项
   * @returns {*} 转换后的值
   */
  #convertAttributeValue(value, options) {
    if (options.converter) {
      return options.converter.fromAttribute?.(value) ?? value;
    }

    switch (options.type) {
      case Boolean:
        return value !== null;
      case Number:
        return Number(value);
      case Object:
      case Array:
        return safeJsonParse(value, value);
      default:
        return value;
    }
  }

  /**
   * 将属性值转换为DOM属性值
   * @private
   * @param {*} value - 属性值
   * @param {Object} options - 属性选项
   * @returns {string} DOM属性值
   */
  #convertPropertyToAttribute(value, options) {
    if (options.converter) {
      return options.converter.toAttribute?.(value) ?? value;
    }

    if (options.type === Boolean) {
      return value ? '' : null;
    }

    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }

    return String(value);
  }

  /**
   * 初始化样式
   * @private
   */
  #initializeStyles() {
    const styles = this.constructor.styles;
    if (!styles || (Array.isArray(styles) && styles.length === 0)) return;

    this.#styleSheets = Array.isArray(styles) ? styles : [styles];
    this.#styleSheets = this.#styleSheets.map(style => getCompatibleStyleSheet(style));
  }

  /**
   * 初始化事件监听器
   * @private
   */
  #initializeEventListeners() {
    // 可以在这里添加通用事件监听器
  }

  /**
   * 请求更新
   * @param {string} [name] - 属性名称
   * @param {*} [oldValue] - 旧值
   * @param {*} [newValue] - 新值
   */
  requestUpdate(name, oldValue, newValue) {
    if (!this.#updatePending) {
      this.#updatePending = true;
      queueMicrotask(() => this.#performUpdate(name, oldValue, newValue));
    }
  }

  /**
   * 执行更新
   * @private
   * @param {string} [name] - 属性名称
   * @param {*} [oldValue] - 旧值
   * @param {*} [newValue] - 新值
   */
  async #performUpdate(name, oldValue, newValue) {
    const shouldUpdate = this.shouldUpdate(name, oldValue, newValue);
    if (!shouldUpdate) {
      this.#updatePending = false;
      return;
    }

    const changedProperties = new Map();
    if (name) {
      changedProperties.set(name, { oldValue, newValue });
    }

    // 生命周期: update前
    this.willUpdate(changedProperties);

    try {
      // 执行渲染
      const templateResult = this.render();
      this.#renderTemplate(templateResult);

      // 生命周期: update后
      this.didUpdate(changedProperties);

      this.dispatchEvent(new CustomEvent('update', {
        detail: { changedProperties },
        bubbles: true,
        composed: true
      }));
    } catch (error) {
      console.error('Error during update:', error);
      this.dispatchEvent(new CustomEvent('update-error', {
        detail: { error, changedProperties },
        bubbles: true,
        composed: true
      }));
    }

    this.#updatePending = false;
  }

  /**
   * 渲染模板
   * @private
   * @param {HTMLTemplateElement} templateResult - 模板结果
   */
  #renderTemplate(templateResult) {
    if (!templateResult || !templateResult.content) return;

    // 克隆模板内容并应用到ShadowRoot
    const fragment = templateResult.content.cloneNode(true);
    this.shadowRoot.replaceChildren(fragment);

    // 应用样式
    this.shadowRoot.adoptedStyleSheets = [...this.#styleSheets, ...this.#getDynamicStyles()];
  }

  /**
   * 获取动态样式
   * @private
   * @returns {CSSStyleSheet[]} 动态样式表数组
   */
  #getDynamicStyles() {
    const dynamicStyles = this.styles;
    if (!dynamicStyles) return [];

    return Array.isArray(dynamicStyles) ? dynamicStyles : [dynamicStyles];
  }

  /**
   * 获取属性到属性的映射
   * @private
   * @returns {Map} 属性映射
   */
  #getAttributeToPropertyMap() {
    const map = new Map();
    const properties = this.constructor.properties;
    if (!properties) return map;

    Object.keys(properties).forEach(name => {
      const options = properties[name];
      const attribute = options.attribute === true ? name.toLowerCase() : options.attribute;
      if (attribute) map.set(attribute, name);
    });
    return map;
  }

  /**
   * 更新元素样式
   * @param {Object} variables - CSS变量键值对
   */
  updateStyles(variables) {
    if (!variables) return;

    const styleText = `:host { ${createCssVariables(variables)} }`;
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(styleText);

    // 查找现有的动态样式索引
    const dynamicStylesIndex = this.#styleSheets.findIndex(sheet => sheet._dynamic);

    if (dynamicStylesIndex > -1) {
      // 替换现有的动态样式
      this.#styleSheets[dynamicStylesIndex] = styleSheet;
    } else {
      // 添加新的动态样式
      this.#styleSheets.push(styleSheet);
    }

    // 标记为动态样式
    styleSheet._dynamic = true;

    // 更新样式
    this.shadowRoot.adoptedStyleSheets = [...this.#styleSheets, ...this.#getDynamicStyles()];
  }

  /**
   * 在shadow root中查询元素
   * @param {string} selector - CSS选择器
   * @returns {Element|null} 查询到的元素
   */
  $query(selector) {
    return this.shadowRoot?.querySelector(selector) || null;
  }

  /**
   * 在shadow root中查询多个元素
   * @param {string} selector - CSS选择器
   * @returns {NodeListOf<Element>} 查询到的元素列表
   */
  $queryAll(selector) {
    return this.shadowRoot?.querySelectorAll(selector) || [];
  }

  /**
   * 触发事件
   * @param {string} type - 事件类型
   * @param {*} detail - 事件详情
   * @param {Object} [options] - 事件选项
   * @returns {boolean} 事件是否被取消
   */
  $emit(type, detail, options = {}) {
    const event = new CustomEvent(type, {
      detail,
      bubbles: true,
      composed: true,
      cancelable: true,
      ...options
    });

    return this.dispatchEvent(event);
  }

  /**
   * 生命周期: 连接到DOM时调用
   */
  connectedCallback() {
    this.#isConnected = true;
    this.willConnect();
    this.requestUpdate();
    this.didConnect();
  }

  /**
   * 生命周期: 从DOM断开连接时调用
   */
  disconnectedCallback() {
    this.#isConnected = false;
    this.willDisconnect();
    this.didDisconnect();
  }

  /**
   * 生命周期: 被移动到新文档时调用
   */
  adoptedCallback() {
    this.didAdopt();
  }

  /**
   * 生命周期: 属性变化时调用
   * @param {string} name - 属性名称
   * @param {string} oldValue - 旧值
   * @param {string} newValue - 新值
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    const propName = this.#getAttributeToPropertyMap().get(name);
    if (propName) {
      this[propName] = this.#convertAttributeValue(newValue, this.constructor.properties[propName]);
    }
  }

  /**
   * 判断是否应该更新
   * @param {string} [name] - 属性名称
   * @param {*} [oldValue] - 旧值
   * @param {*} [newValue] - 新值
   * @returns {boolean} 是否应该更新
   */
  shouldUpdate() { return true; }

  /**
   * 生命周期: 更新前调用
   * @param {Map} changedProperties - 变化的属性
   */
  willUpdate() { }

  /**
   * 生命周期: 更新后调用
   * @param {Map} changedProperties - 变化的属性
   */
  didUpdate() { }

  /**
   * 生命周期: 连接前调用
   */
  willConnect() { }

  /**
   * 生命周期: 连接后调用
   */
  didConnect() { }

  /**
   * 生命周期: 断开连接前调用
   */
  willDisconnect() { }

  /**
   * 生命周期: 断开连接后调用
   */
  didDisconnect() { }

  /**
   * 生命周期: 被移动后调用
   */
  didAdopt() { }

  /**
   * 渲染方法
   * @abstract
   * @returns {HTMLTemplateElement} 模板元素
   */
  render() { throw new Error('子类必须实现render()方法'); }

  /**
   * 注册自定义元素
   * @static
   * @param {string} tagName - 标签名称
   * @returns {Class} 类本身
   */
  static define(tagName) {
    if (typeof tagName !== 'string' || !tagName.includes('-')) {
      throw new Error('无效的自定义元素标签名: ' + tagName);
    }
    if (!customElements.get(tagName)) {
      customElements.define(tagName, this);
    }
    return this;
  }
}

/**
 * CSS标记模板
 * @param {TemplateStringsArray} strings - 模板字符串数组
 * @param {...*} values - 表达式值
 * @returns {CSSStyleSheet} CSS样式表
 */
export const css = (strings, ...values) => {
  const cssText = strings.reduce((acc, str, i) => acc + str + (values[i] ?? ''), '');
  const sheet = new CSSStyleSheet();
  try {
    sheet.replaceSync(cssText);
  } catch (error) {
    console.error('Failed to parse CSS:', error);
    console.error('CSS content:', cssText);
  }
  return sheet;
};

/**
 * HTML标记模板
 * @param {TemplateStringsArray} strings - 模板字符串数组
 * @param {...*} values - 表达式值
 * @returns {HTMLTemplateElement} 模板元素
 */
export const html = (strings, ...values) => {
  const template = document.createElement('template');
  template.innerHTML = strings.reduce((acc, str, i) => {
    const value = values[i];
    if (value === undefined || value === null) return acc + str;

    // 处理不同类型的表达式值
    if (Array.isArray(value)) {
      return acc + str + value.join('');
    } else if (value instanceof Node) {
      const marker = `w-${Math.random().toString(36).slice(2, 12)}`;
      template.__nodes ??= new Map();
      template.__nodes.set(marker, value);
      return acc + str + marker;
    } else if (typeof value === 'object') {
      return acc + str + JSON.stringify(value);
    }
    return acc + str + value;
  }, '');

  // 替换节点标记
  if (template.__nodes) {
    const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);

    nodes.forEach(textNode => {
      template.__nodes.forEach((node, marker) => {
        if (textNode.textContent.includes(marker)) {
          const parent = textNode.parentNode;
          const parts = textNode.textContent.split(marker);
          parent.insertBefore(document.createTextNode(parts[0]), textNode);
          parent.insertBefore(node, textNode);
          textNode.textContent = parts[1];
        }
      });
    });
  }

  return template;
};

/**
 * 类名映射工具
 * @param {Object} classes - 类名映射对象
 * @returns {string} 类名字符串
 */
export const classMap = (classes) => {
  return Object.entries(classes)
    .filter(([_, value]) => value)
    .map(([key]) => key)
    .join(' ');
};

/**
 * 属性装饰器
 * @param {Object} [options] - 属性选项
 * @returns {Function} 装饰器函数
 */
export const property = (options = {}) => (proto, name) => {
  const ctor = proto.constructor;
  ctor.properties ??= {};
  ctor.properties[name] = options;
};

/**
 * 状态装饰器
 * @returns {Function} 装饰器函数
 */
export const state = () => property({ attribute: false });

/**
 * 自定义元素注册工具
 * @param {string} tagName - 标签名称
 * @param {Class} component - 组件类
 * @returns {Class} 组件类
 */
export const register = (tagName, component) => {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, component);
  }
  return component;
};