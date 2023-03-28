import { Server } from "@plattar/plattar-api";
import { LauncherAR } from "../../ar/launcher-ar";
import { QRCodeController } from "../qrcode/qrcode-controller";

export enum ControllerState {
    None,
    Renderer,
    QRCode
}

/**
 * All Plattar Controllers are derived from the same interface
 */
export abstract class PlattarController {

    private readonly _parent: HTMLElement;
    private readonly _qrcode: QRCodeController;

    protected _state: ControllerState = ControllerState.None;
    protected _element: HTMLElement | null = null;

    constructor(parent: HTMLElement) {
        this._parent = parent;
        this._qrcode = new QRCodeController(this);
    }

    /**
     * Called by the parent when a HTML Attribute has changed and the controller
     * requires an update
     */
    public onAttributesUpdated(): void {
        this._qrcode.refresh();
    }

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
            const qrcode: QRCodeController = this._qrcode;

            qrcode.options = options;

            const qrOptions: string = qrcode.optionsBase64;

            let dst: string = Server.location().base + "renderer/launcher.html?qr_options=" + qrOptions;

            const sceneID: string | null = this.getAttribute("scene-id");
            const configState: string | null = this.getAttribute("config-state");
            const embedType: string | null = this.getAttribute("embed-type");
            const productID: string | null = this.getAttribute("product-id");
            const sceneProductID: string | null = this.getAttribute("scene-product-id");
            const variationID: string | null = this.getAttribute("variation-id");
            const variationSKU: string | null = this.getAttribute("variation-sku");
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

            if (variationSKU) {
                dst += "&variation_sku=" + variationSKU;
            }

            if (arMode) {
                dst += "&ar_mode=" + arMode;
            }

            if (sceneID) {
                dst += "&scene_id=" + sceneID;
            }

            qrcode.url = dst;

            qrcode.show();
        });
    }

    /**
     * Start the underlying Plattar Renderer for this Controller
     */
    public abstract startRenderer(): Promise<HTMLElement>;

    /**
     * Start Rendering a QR Code with the provided options
     * @param options (optional) - The QR Code Options
     */
    public abstract startViewerQRCode(options: any | undefined | null): Promise<HTMLElement>;

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