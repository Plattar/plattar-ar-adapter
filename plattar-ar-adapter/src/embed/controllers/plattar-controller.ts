import { LauncherAR } from "../../ar/launcher-ar";

/**
 * All Plattar Controllers are derived from the same interface
 */
export abstract class PlattarController {

    private readonly _parent: HTMLElement;

    constructor(parent: HTMLElement) {
        this._parent = parent;
    }

    /**
     * Called by the parent when a HTML Attribute has changed and the controller
     * requires an update
     */
    public abstract onAttributesUpdated(): void;

    /**
     * Start Rendering a QR Code with the provided options
     * @param options (optional) - The QR Code Options
     */
    public abstract startQRCode(options: any | undefined | null): Promise<HTMLElement>;

    /**
     * Start the underlying Plattar Renderer for this Controller
     */
    public abstract startRenderer(): Promise<HTMLElement>;

    /**
     * Initialise and start AR mode if available
     */
    public abstract startAR(): Promise<void>;

    /**
     * Initialise and return a launcher that can be used to start AR
     */
    public abstract initAR(): Promise<LauncherAR>;

    /**
     * Get the underlying renderer component (if any)
     */
    public abstract get element(): HTMLElement | null;

    /**
     * Returns the Parent Instance
     */
    public get parent(): HTMLElement {
        return this._parent;
    }

    /**
     * Returns the specified attribute from the parent
     * @param attribute - The name of thhe attribute
     * @returns - The attribute value or null
     */
    public getAttribute(attribute: string): string | null {
        return this.parent ? (this.parent.hasAttribute(attribute) ? this.parent.getAttribute(attribute) : null) : null;
    }
}