let wPanelCounter = 0;
/**
 * `WPanel` is a panel for a `<w-tabs>` tab panel.
 */
class WPanel extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.setAttribute('role', 'tabpanel');
        if (!this.id)
            this.id = `w-panel-generated-${wPanelCounter++}`;
    }
}

export const registerPanel = () => customElements.define('w-panel', WPanel);