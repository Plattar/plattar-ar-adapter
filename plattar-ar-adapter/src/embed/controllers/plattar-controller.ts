import { Server } from "@plattar/plattar-api";
import { LauncherAR } from "../../ar/launcher-ar";
import { ConfiguratorState, DecodedConfiguratorState } from "../../util/configurator-state";
import type PlattarEmbed from "../plattar-embed";

export enum ControllerState {
    None,
    Renderer,
    QRCode
}

export interface QRCodeOptions {
    readonly color: string;
    readonly qrType: string;
    readonly shorten: boolean;
    readonly margin: number;
    readonly detached: boolean;
    readonly url?: string | null;
}

/**
 * All Plattar Controllers are derived from the same interface
 */
export abstract class PlattarController {

    /**
     * Default QR Code rendering options
     */
    protected _GetDefaultQROptions(opt: QRCodeOptions | undefined | null = null): QRCodeOptions {
        const options: any = opt ?? {};

        return {
            color: options.color ?? (this.getAttribute("qr-color") || "#101721"),
            qrType: options.qrType ?? (this.getAttribute("qr-style") || "default"),
            shorten: options.shorten ?? (this.getBooleanAttribute("qr-shorten") || true),
            margin: options.margin ?? 0,
            detached: options.detached ?? (this.getBooleanAttribute("qr-detached") || false),
            url: options.url ?? null
        }
    };

    private readonly _parent: PlattarEmbed;
    protected _state: ControllerState = ControllerState.None;
    protected _element: HTMLElement | null = null;
    protected _prevQROpt: any = null;

    private _selectVariationObserver: any = null;
    private _selectVariationIDObserver: any = null;
    private _selectVariationSKUObserver: any = null;

    constructor(parent: PlattarEmbed) {
        this._parent = parent;
    }

    /**
     * Generates a brand new Configurator State from the provided SceneID or inputted Configurator State
     */
    protected async createConfiguratorState(): Promise<DecodedConfiguratorState> {
        // get our Scene ID
        const sceneID: string | null = this.getAttribute("scene-id");

        if (!sceneID) {
            throw new Error("PlattarController.createConfiguratorState() - cannot create as required attribute scene-id is not defined");
        }

        const configState: string | null = this.getAttribute("config-state");
        // get a list of variation ID's to use for initialising
        const variationIDs: string | null = this.getAttribute("variation-id");
        // get a list of variation SKU's to use for initialising
        const variationSKUs: string | null = this.getAttribute("variation-sku");
        // generate the decoded configurator state
        const decodedState: DecodedConfiguratorState = configState ? await ConfiguratorState.decodeState(sceneID, configState) : await ConfiguratorState.decodeScene(sceneID);

        // change the ID's and SKU's (if any) of the default configuration state
        const variationIDList: Array<string> = variationIDs ? variationIDs.split(",") : [];
        const variationSKUList: Array<string> = variationSKUs ? variationSKUs.split(",") : [];

        variationIDList.forEach((variationID: string) => {
            decodedState.state.setVariationID(variationID);
        });

        variationSKUList.forEach((variationSKU: string) => {
            decodedState.state.setVariationSKU(variationSKU);
        });

        // return fully modified configuration state
        return decodedState;
    }

    /**
     * Generates and returns a new instance of the ConfiguratorState for this node
     */
    public abstract getConfiguratorState(): Promise<DecodedConfiguratorState>;

    /**
     * Called by the parent when a HTML Attribute has changed and the controller
     * requires an update
     */
    public abstract onAttributesUpdated(attributeName: string): Promise<void>;

    /**
     * Start the underlying Plattar Renderer for this Controller
     */
    public abstract startRenderer(): Promise<HTMLElement>;

    /**
     * Setup messenger observers to detect variation changes and apply to the internal
     * configuration state
     */
    protected setupMessengerObservers(viewer: any, configState: DecodedConfiguratorState): void {
        this._selectVariationObserver = viewer.messengerInstance.observer.subscribe("selectVariation", (cd: any) => {
            if (cd.type === "call") {
                const args: string | Array<string> | undefined | null = cd.data[0];
                const variations: Array<string> = args ? (Array.isArray(args) ? args : [args]) : [];

                variations.forEach((variationID: string) => {
                    configState.state.setVariationID(variationID);
                });
            }
        });

        this._selectVariationIDObserver = viewer.messengerInstance.observer.subscribe("selectVariationID", (cd: any) => {
            if (cd.type === "call") {
                const args: string | Array<string> | undefined | null = cd.data[0];
                const variations: Array<string> = args ? (Array.isArray(args) ? args : [args]) : [];

                variations.forEach((variationID: string) => {
                    configState.state.setVariationID(variationID);
                });
            }
        });

        this._selectVariationSKUObserver = viewer.messengerInstance.observer.subscribe("selectVariationSKU", (cd: any) => {
            if (cd.type === "call") {
                const args: string | Array<string> | undefined | null = cd.data[0];
                const variations: Array<string> = args ? (Array.isArray(args) ? args : [args]) : [];

                variations.forEach((variationSKU: string) => {
                    configState.state.setVariationSKU(variationSKU);
                });
            }
        });
    }

    /**
     * Remove all pre-existing observers
     */
    protected removeMessengerObservers(): void {
        if (this._selectVariationObserver) {
            this._selectVariationObserver();
            this._selectVariationObserver = null;
        }

        if (this._selectVariationIDObserver) {
            this._selectVariationIDObserver();
            this._selectVariationIDObserver = null;
        }

        if (this._selectVariationSKUObserver) {
            this._selectVariationSKUObserver();
            this._selectVariationSKUObserver = null;
        }
    }

    /**
     * Initialise and start AR mode if available
     */
    public async startAR(): Promise<void> {
        const launcher: LauncherAR = await this.initAR();

        return launcher.start();
    }

    /**
     * Start Rendering a QR Code with the provided options
     * @param options (optional) - The QR Code Options
     */
    public abstract startViewerQRCode(options: QRCodeOptions | undefined | null): Promise<HTMLElement>;

    /**
     * Decide which QR Code to render according to the qr-type attribute
     * @param options 
     * @returns 
     */
    public async startQRCode(options: QRCodeOptions): Promise<HTMLElement> {
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
    public async startARQRCode(options: QRCodeOptions): Promise<HTMLElement> {
        const opt: QRCodeOptions = this._GetDefaultQROptions(options);
        const viewer: HTMLElement = document.createElement("plattar-qrcode");

        // remove the old renderer instance if any
        if (!opt.detached) {
            this.removeRenderer();
            this._element = viewer;
        }

        // required attributes with defaults for plattar-viewer node
        const width: string = this.getAttribute("width") || "500px";
        const height: string = this.getAttribute("height") || "500px";

        viewer.setAttribute("width", width);
        viewer.setAttribute("height", height);

        if (opt.color) {
            viewer.setAttribute("color", opt.color);
        }

        if (opt.margin) {
            viewer.setAttribute("margin", `${opt.margin}`);
        }

        if (opt.qrType) {
            viewer.setAttribute("qr-type", opt.qrType);
        }

        viewer.setAttribute("shorten", (opt.shorten && (opt.shorten === true || opt.shorten === "true")) ? "true" : "false");

        const qrOptions: string = btoa(JSON.stringify(opt));

        let dst: string = Server.location().base + "renderer/launcher.html?qr_options=" + qrOptions;

        //let configState: string | null = null;
        const sceneID: string | null = this.getAttribute("scene-id");
        const embedType: string | null = this.getAttribute("embed-type");
        const productID: string | null = this.getAttribute("product-id");
        const sceneProductID: string | null = this.getAttribute("scene-product-id");
        const variationID: string | null = this.getAttribute("variation-id");
        const variationSKU: string | null = this.getAttribute("variation-sku");
        const arMode: string | null = this.getAttribute("ar-mode");
        const showBanner: string | null = this.getAttribute("show-ar-banner");
        const sceneGraphID: string | null = this.getAttribute("scene-graph-id");

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

        if (showBanner) {
            dst += "&show_ar_banner=" + showBanner;
        }

        if (sceneGraphID) {
            dst += "&scene_graph_id=" + sceneGraphID;
        }
        else {
            try {
                const sceneGraphID: string = await (await this.getConfiguratorState()).state.encodeSceneGraphID();
                dst += "&scene_graph_id=" + sceneGraphID;
            }
            catch (_err) {
                // scene graph ID not available for some reason
                // we will generate a new one
                console.error(_err);
            }
        }

        viewer.setAttribute("url", opt.url || dst);

        this._prevQROpt = opt;

        if (!opt.detached) {
            this._state = ControllerState.QRCode;

            return new Promise<HTMLElement>((accept, reject) => {
                this.append(viewer);

                viewer.onload = () => {
                    return accept(viewer);
                };
            });
        }

        return new Promise<HTMLElement>((accept, reject) => {
            return accept(viewer);
        });
    }

    /**
     * Initialise and return a launcher that can be used to start AR
     */
    public abstract initAR(): Promise<LauncherAR>;

    /**
     * Removes the currently active renderer view from the DOM
     */
    public removeRenderer(): boolean {
        // remove all other children
        const shadow = this.parent.shadowRoot;

        if (shadow) {
            let child = shadow.lastElementChild;

            while (child) {
                shadow.removeChild(child);
                child = shadow.lastElementChild;
            }
        }

        this._element = null;

        this.removeMessengerObservers();

        return true;
    }

    /**
     * Get the underlying renderer component (if any)
     */
    public abstract get element(): HTMLElement | null;

    /**
     * Returns the Parent Instance
     */
    public get parent(): PlattarEmbed {
        return this._parent;
    }

    /**
     * Returns the specified attribute from the parent
     * @param attribute - The name of the attribute
     * @returns - The attribute value or null
     */
    public getAttribute(attribute: string): string | null {
        return this.parent ? (this.parent.hasAttribute(attribute) ? this.parent.getAttribute(attribute) : null) : null;
    }

    /**
     * Returns the specified attribute from the parent as a boolean
     * @param attribute - The name of the attribute
     * @returns - The attribute value
     */
    public getBooleanAttribute(attribute: string): boolean {
        return this.parent ? (this.parent.hasAttribute(attribute) ? (this.parent.getAttribute(attribute)?.toLowerCase() === "true" ? true : false) : false) : false;
    }

    /**
     * Sets a particular attribute into the HTML DOM
     * 
     * @param attribute - The name of the attribute
     * @param value - The value of the attribute
     */
    public setAttribute(attribute: string, value: string): void {
        if (this.parent) {
            this.parent.setAttribute(attribute, value);
        }
    }

    /**
     * Removes a particular attribute from HTML DOM
     * 
     * @param attribute - The name of the attribute
     */
    public removeAttribute(attribute: string): void {
        if (this.parent) {
            this.parent.removeAttribute(attribute);
        }
    }

    /**
     * Appends the provided element into the shadow-root of the parent element
     * @param element - The element to append
     */
    public append(element: HTMLElement): void {
        if (this._element !== element) {
            return;
        }

        // ensure append only allows a single element in the shadow DOM
        const shadow = this.parent.shadowRoot || this.parent.attachShadow({ mode: 'open' });

        if (shadow) {
            let child = shadow.lastElementChild;

            while (child) {
                shadow.removeChild(child);
                child = shadow.lastElementChild;
            }
        }

        shadow.append(element);
    }

    /**
     * 
     * @param element 
     */
    public removeChild(element: HTMLElement): void {
        const shadow = this.parent.shadowRoot;

        if (shadow) {
            shadow.removeChild(element);
        }
    }
}