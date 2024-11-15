class AvatarComponent extends HTMLElement {
    connectedCallback() {
        if (!this.querySelector('img')) {
            this.append(document.createElement('img'));
        }
        this.update();
    }

    static get observeAttributes() {
        return ['src', 'alt'];
    }

    attributeChangedCallback() {
        this.update();
    }

    update() {
        const img = this.querySelector('img');
        if (img) {
            img.src = this.getAttribute('src');
            img.alt = this.getAttribute('alt') || 'avatar';
        }
    }
}

export const registerAvatarComponent = () => customElements.define('w-avatar', AvatarComponent);