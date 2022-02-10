import { LauncherAR } from "../../ar/launcher-ar";

export enum ControllerState {
    None,
    Renderer,
    QRCode
}

/**
 * All Plattar Controllers are derived from the same interface
 */
export abstract class PlattarController {

    /**
     * Default QR Code rendering options
     */
    public static get DEFAULT_QR_OPTIONS(): any {
        return {
            color: "#101721",
            qrType: "default",
            margin: 0
        }
    };

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
    public startAR(): Promise<void> {
        return new Promise<void>((accept, reject) => {
            this.initAR().then((launcher: LauncherAR) => {
                launcher.start();

                accept();
            }).catch(reject);
        });
    }

    /**
     * Initialise and return a launcher that can be used to start AR
     */
    public abstract initAR(): Promise<LauncherAR>;

    /**
     * Removes the currently active renderer view from the DOM
     */
    public abstract removeRenderer(): boolean;

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

    /**
     * Appends the provided element into the shadow-root of the parent element
     * @param element - The element to append
     */
    public append(element: HTMLElement): void {
        const shadow = this.parent.shadowRoot || this.parent.attachShadow({ mode: 'open' });
        shadow.append(element);
    }
}