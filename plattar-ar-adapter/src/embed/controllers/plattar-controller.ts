import { Server } from "@plattar/plattar-api";
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
    protected _state: ControllerState = ControllerState.None;
    protected _element: HTMLElement | null = null;
    protected _prevQROpt: any = null;

    constructor(parent: HTMLElement) {
        this._parent = parent;
    }

    /**
     * Called by the parent when a HTML Attribute has changed and the controller
     * requires an update
     */
    public abstract onAttributesUpdated(): void;

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
     * Start Rendering a QR Code with the provided options
     * @param options (optional) - The QR Code Options
     */
    public abstract startViewerQRCode(options: any | undefined | null): Promise<HTMLElement>;

    /**
     * Decide which QR Code to render according to the qr-type attribute
     * @param options 
     * @returns 
     */
    public startQRCode(options: any): Promise<HTMLElement> {
        const qrType: string = this.getAttribute("qr-type") || "viewer";

        switch (qrType.toLowerCase()) {
            case "ar":
                return this.startARQRCode(options);
            case "viewer":
            default:
                return this.startViewerQRCode(options);
        }
    }

    /**
     * Displays a QR Code that sends the user direct to AR
     * @param options 
     * @returns 
     */
    public startARQRCode(options: any): Promise<HTMLElement> {
        return new Promise<HTMLElement>((accept, reject) => {
            // remove the old renderer instance if any
            this.removeRenderer();

            const opt: any = options || PlattarController.DEFAULT_QR_OPTIONS;

            const viewer: HTMLElement = document.createElement("plattar-qrcode");

            // required attributes with defaults for plattar-viewer node
            const width: string = this.getAttribute("width") || "500px";
            const height: string = this.getAttribute("height") || "500px";

            viewer.setAttribute("width", width);
            viewer.setAttribute("height", height);

            if (opt.color) {
                viewer.setAttribute("color", opt.color);
            }

            if (opt.margin) {
                viewer.setAttribute("margin", "" + opt.margin);
            }

            if (opt.qrType) {
                viewer.setAttribute("qr-type", opt.qrType);
            }

            const qrOptions: string = btoa(JSON.stringify(opt));

            let dst: string = Server.location().base + "renderer/launcher.html?qr_options=" + qrOptions;

            const sceneID: string | null = this.getAttribute("scene-id");
            const configState: string | null = this.getAttribute("config-state");
            const embedType: string | null = this.getAttribute("embed-type");
            const productID: string | null = this.getAttribute("product-id");
            const sceneProductID: string | null = this.getAttribute("scene-product-id");
            const variationID: string | null = this.getAttribute("variation-id");
            const arMode: string | null = this.getAttribute("ar-mode");

            if (configState) {
                dst += "&config_state=" + configState;
            }

            if (embedType) {
                dst += "&embed_type=" + embedType;
            }

            if (productID) {
                dst += "&product_id=" + productID;
            }

            if (sceneProductID) {
                dst += "&scene_product_id=" + sceneProductID;
            }

            if (variationID) {
                dst += "&variation_id=" + variationID;
            }

            if (arMode) {
                dst += "&ar_mode=" + arMode;
            }

            if (sceneID) {
                dst += "&scene_id=" + sceneID;
            }

            viewer.setAttribute("url", opt.url || dst);

            viewer.onload = () => {
                return accept(viewer);
            };

            this._element = viewer;
            this._state = ControllerState.QRCode;
            this._prevQROpt = opt;

            this.append(viewer);
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