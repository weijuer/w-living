import { LitElement, html, css } from 'lit';
import styleSheet from './button.css?inline';

/**
 * A versatile button component with theme support
 * @element w-button
 * @property {('primary'|'secondary'|'text')} type - Button type
 * @property {('small'|'medium'|'large')} size - Button size
 * @property {('light'|'dark')} theme - Color theme
 * @property {boolean} disabled - Disables the button
 */
class Button extends LitElement {
    static properties = {
        type: { type: String, reflect: true, defaultValue: 'primary' },
        size: { type: String, reflect: true, defaultValue: 'medium' },
        theme: { type: String, reflect: true, defaultValue: 'light' },
        disabled: { type: Boolean, reflect: true, defaultValue: false }
    };

    static get styles() {
        return css`${styleSheet}`;
    }

    constructor() {
        super();
    }

    render() {

        const classes = classMap({
            'w-button': true,          // Base button class
            [`w-button--${this.type}`]: true,         // Modifier for button type
            [`w-button--${this.size}`]: true,         // Modifier for button size
            [`w-button--${this.theme}`]: true, // Modifier for color theme
            'is-disabled': this.disabled  // Disabled state
        });

        return html`
            <button 
                class="${classes}" part="button">
                <slot></slot>
            </button>
        `;
    }
}

export const registerButton = () => {
    customElements.define('w-button', Button);
}

export default Button;