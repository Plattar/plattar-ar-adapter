import { Server } from "@plattar/plattar-api";
import { LauncherAR } from "../../ar/launcher-ar";
import { QRCodeController, QRCodeOptions } from "../qrcode/qrcode-controller";

/**
 * All Plattar Controllers are derived from the same interface
 */
export abstract class PlattarController {

    private readonly _parent: HTMLElement;
    private readonly _qrcode: QRCodeController;

    constructor(parent: HTMLElement) {
        this._parent = parent;
        this._qrcode = new QRCodeController(this);
    }

    /**
     * Called by the parent when a HTML Attribute has changed and the controller
     * requires an update
     */
    public onAttributesUpdated(): void {
        this.refreshQRCode();
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
     * Calls startARQRCode() functionality
     */
    public showQRCode(options: any): Promise<QRCodeController> {
        return this.startARQRCode(options);
    }

    /**
     * Hides a previously visible QRCode (if any)
     */
    public hideQRCode(): Promise<QRCodeController> {
        return new Promise<QRCodeController>((accept, _reject) => {
            const qrcode: QRCodeController = this._qrcode;

            qrcode.hide();

            const renderer: HTMLElement | null = this.element;

            // hide the renderer
            if (renderer) {
                renderer.style.display = "block";
            }

            return accept(qrcode);
        });
    }

    /**
     * Refresh the state of the QRCode (if visible). This is also called
     * automatically when plattar-embed attributes change
     */
    public refreshQRCode(): Promise<QRCodeController> {
        return new Promise<QRCodeController>((accept, _reject) => {
            const qrcode: QRCodeController = this._qrcode;

            if (qrcode.visible) {
                const qrType: string = this.getAttribute("qr-type") || "viewer";

                switch (qrType.toLowerCase()) {
                    case "ar":
                        qrcode.url = this.getTemplateQRCodeURL(qrcode.optionsBase64);
                    case "viewer":
                    default:
                        qrcode.url = this.getViewerQRCodeURL(qrcode.options);
                }

                // refresh/re-render qr-code with updated url/attributes
                qrcode.refresh();
            }

            return accept(qrcode);
        });
    }

    /**
     * Decide which QR Code to render according to the qr-type attribute
     * @param options 
     * @returns 
     */
    public startQRCode(options: any): Promise<QRCodeController> {
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
    public startARQRCode(options: any): Promise<QRCodeController> {
        return new Promise<QRCodeController>((accept, reject) => {
            const qrcode: QRCodeController = this._qrcode;

            qrcode.options = options;
            qrcode.url = this.getTemplateQRCodeURL(qrcode.optionsBase64);
            qrcode.show();

            const renderer: HTMLElement | null = this.element;

            // hide the renderer
            if (renderer) {
                renderer.style.display = "none";
            }

            return accept(qrcode);
        });
    }

    /**
     * Start Rendering a QR Code with the provided options
     * @param options (optional) - The QR Code Options
     */
    public startViewerQRCode(options: any): Promise<QRCodeController> {
        return new Promise<QRCodeController>((accept, reject) => {
            const qrcode: QRCodeController = this._qrcode;

            qrcode.options = options;
            qrcode.url = this.getViewerQRCodeURL(qrcode.options);
            qrcode.show();

            const renderer: HTMLElement | null = this.element;

            // hide the renderer
            if (renderer) {
                renderer.style.display = "none";
            }

            return accept(qrcode);
        });
    }

    public getTemplateQRCodeURL(qrOptionsBase64: string): string {
        let dst: string = Server.location().base + "renderer/launcher.html?qr_options=" + qrOptionsBase64;

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

        return dst;
    }

    /**
     * compiles and returns the url to be used for viewer QR Codes
     */
    public abstract getViewerQRCodeURL(options: QRCodeOptions): string;

    /**
     * Start the underlying Plattar Renderer for this Controller
     */
    public abstract startRenderer(): Promise<HTMLElement>;

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
     * Returns the internal QRCode Renderer Controller
     */
    public get qrcode(): QRCodeController {
        return this._qrcode;
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