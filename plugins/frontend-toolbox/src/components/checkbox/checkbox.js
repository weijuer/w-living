import { WElement, html, css, classMap } from '../../internal/elements.js';

const KEYCODE = {
    SPACE: 32,
};

export class WCheckbox extends WElement {
    static properties = {
        checked: {
            type: Boolean,
            reflect: true,
            value: false
        },
        disabled: {
            type: Boolean,
            reflect: true,
            value: false
        }
    };

    static styles = css`
        :host {
            display: inline-flex;
            align-items: center;
            cursor: pointer;
        }

        :host([disabled]) {
            cursor: not-allowed;
            opacity: 0.6;
        }

        .checkbox {
            width: 16px;
            height: 16px;
            border: 2px solid #666;
            border-radius: 3px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-right: 8px;
            transition: background-color 0.2s;
        }

        :host([checked]) .checkbox {
            background-color: #0066cc;
            border-color: #0066cc;
        }

        .checkmark {
            width: 8px;
            height: 8px;
            background-color: white;
            border-radius: 1px;
            display: none;
        }

        :host([checked]) .checkmark {
            display: block;
        }

        :host([disabled]) .checkbox {
            border-color: #ccc;
        }

        :host([disabled][checked]) .checkbox {
            background-color: #ccc;
            border-color: #ccc;
        }

        slot {
            user-select: none;
        }
    `;

    willConnect() {
        this.addEventListener('keyup', this._onKeyUp);
        this.addEventListener('click', this._onClick);
    }

    willDisconnect() {
        this.removeEventListener('keyup', this._onKeyUp);
        this.removeEventListener('click', this._onClick);
    }

    _onKeyUp(event) {
        if (event.altKey || this.disabled) return;

        switch (event.keyCode) {
            case KEYCODE.SPACE:
                event.preventDefault();
                this._toggleChecked();
                break;
            default:
                return;
        }
    }

    _onClick(event) {
        if (this.disabled) return;
        this._toggleChecked();
    }

    _toggleChecked() {
        this.checked = !this.checked;
        this.dispatchEvent(new CustomEvent('change', {
            detail: { checked: this.checked },
            bubbles: true,
            composed: true
        }));
    }

    render() {
        return html`
            <div class="checkbox">
                <div class="checkmark"></div>
            </div>
            <slot></slot>
        `;
    }
}

WCheckbox.define('w-checkbox');