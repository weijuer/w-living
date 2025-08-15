class Switch extends HTMLElement {

    #checked = false;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="${new URL('./switch.css', import.meta.url)}">
            <label class="w-switch" data-checked="${this.#checked}">
                <input
                    class="w-switch__input"
                    type="checkbox"
                />
                <div class="w-switch__marker">
                    <div class="w-switch__on">
                        <slot name="on"></slot>
                    </div>
                    <div class="w-switch__off">
                        <slot name="off"></slot>
                    </div>
                </div>
                <span class="w-switch__text">
                    <slot></slot>
                </span>
            </label>
        `;

        this.inputElement = this.shadowRoot.querySelector('input');
        this.switchElement = this.shadowRoot.querySelector('.w-switch');

        this.inputElement.addEventListener('change', (event) => {
            this.updateCheckedState(event.target.checked);
            this.dispatchEvent(new CustomEvent('change', { detail: { checked: event.target.checked }, bubbles: true }));
        });
    }

    get checked() {
        return this.inputElement.checked;
    }

    set checked(checked) {
        this.inputElement.checked = checked;
        this.#checked = checked;
        this.updateCheckedState(checked);
    }

    updateCheckedState(checked) {
        this.switchElement.setAttribute('data-checked', String(checked));
    }
}

export const registerSwitch = () => customElements.define('w-switch', Switch);
