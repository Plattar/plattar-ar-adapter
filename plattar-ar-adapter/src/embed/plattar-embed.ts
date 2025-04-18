import { Server } from "@plattar/plattar-api";
import { LauncherAR } from "../ar/launcher-ar";
import { PlattarController } from "./controllers/plattar-controller";
import { ConfiguratorController } from "./controllers/configurator-controller";
import { VTOController } from "./controllers/vto-controller";
import { ProductController } from "./controllers/product-controller";
import { Util } from "../util/util";
import { WebXRController } from "./controllers/webxr-controller";
import { GalleryController } from "./controllers/gallery-controller";
import { LauncherController } from "./controllers/launcher-controller";

/**
 * This tracks the current embed type
 */
enum EmbedType {
    Configurator,
    Legacy,
    VTO,
    WebXR,
    Gallery,
    Launcher,
    None
}

/**
 * Controls the state of the observer
 */
enum ObserverState {
    Locked,
    Unlocked
}

/**
 * This is the primary <plattar-embed /> node that allows easy embedding
 * of Plattar related content
 */
export default class PlattarEmbed extends HTMLElement {

    // this is the current embed type, viewer by default
    private _currentType: EmbedType = EmbedType.None;
    private _observerState: ObserverState = ObserverState.Unlocked;
    private _controller: PlattarController | null = null;
    private _currentSceneID: string | null = null;
    private _currentServer: string | null = null;
    private _observer: MutationObserver | null = null;

    constructor() {
        super();
    }

    public get viewer(): HTMLElement | null {
        return this._controller ? this._controller.element : null;
    }

    /**
     * Begin observing all changes to this DOM element
     */
    connectedCallback() {
        this.create();
    }

    /**
     * creates a brand new instance of this embed
     */
    public create(): PlattarController | null {
        if (!this._observer) {
            this._observer = new MutationObserver((mutations: MutationRecord[]) => {
                if (this._observerState === ObserverState.Unlocked) {
                    mutations.forEach((mutation: MutationRecord) => {
                        if (mutation.type === "attributes") {
                            const attributeName: string = mutation.attributeName ? mutation.attributeName : "none";
                            if (this._currentType !== EmbedType.Legacy) {
                                this._CreateEmbed(attributeName);
                            }
                            else {
                                this._OnAttributesUpdated(attributeName);
                            }
                        }
                    });
                }
            });

            this._observer.observe(this, {
                attributes: true
            });
        }

        const productID: string | null = this.hasAttribute("product-id") && !this.hasAttribute("scene-id") ? this.getAttribute("product-id") : null;

        if (productID) {
            this._currentType = EmbedType.Legacy;
            this._CreateLegacyEmbed();

            return this._controller;
        }

        this._CreateEmbed("none");

        return this._controller;
    }

    /**
     * Locks the observer so attribute changes do not trigger anything
     */
    public lockObserver(): void {
        this._observerState = ObserverState.Locked;
    }

    /**
     * Unlocks the observer so attribute changes will start to re-trigger properly
     */
    public unlockObserver(): void {
        this._observerState = ObserverState.Unlocked;
    }

    /**
     * Destroys the active instance of this embed and resets internal state to default
     */
    public destroy(): void {
        if (this._controller) {
            this._controller.removeRenderer();
            this._controller = null;
        }

        this._currentType = EmbedType.None;
    }

    /**
     * this is only used for backwards-compatible legacy embed types typically
     * embedding products with variations (without a scene-id)
     */
    private _CreateLegacyEmbed(): void {
        // server cannot be changed once its set - defaults to production
        const server: string | null = this.hasAttribute("server") ? this.getAttribute("server") : "production";

        if (Util.isValidServerLocation(server)) {
            Server.create(Server.match(server || "production"));

            this._controller = new ProductController(this);

            const init: string | null = this.hasAttribute("init") ? this.getAttribute("init") : null;

            switch (init) {
                case "viewer": this.startViewer();
                    break;
                case "qrcode": this.startQRCode();
                    break;
            }
        }
        else {
            console.warn("PlattarEmbed.CreateLegacy - cannot create as server attribute " + server + " is invalid, embed status remains unchanged");
        }
    }

    /**
     * creates the embed
     * this can also be called when attributes/state changes so embeds can be re-loaded
     */
    private _CreateEmbed(attributeName: string): void {
        // check if controller needs to be destroyed due to server change
        const serverAttribute: string | null = this.hasAttribute("server") ? this.getAttribute("server") : "production";

        if (this._currentServer !== serverAttribute) {
            this._currentServer = serverAttribute || "production";

            // reset the controller if any
            if (this._controller) {
                this._controller.removeRenderer();
                this._controller = null;
            }
        }

        if (!Util.isValidServerLocation(this._currentServer)) {
            console.warn("PlattarEmbed.Create - cannot create as server attribute " + this._currentServer + " is invalid, embed status remains unchanged");
            return;
        }

        Server.create(Server.match(this._currentServer || "production"));

        const embedType: string | null = this.hasAttribute("embed-type") ? this.getAttribute("embed-type") : "configurator";
        const currentEmbed: EmbedType = this._currentType;

        if (embedType) {
            switch (embedType.toLowerCase()) {
                case "vto":
                    this._currentType = EmbedType.VTO;
                    break;
                case "webxr":
                    this._currentType = EmbedType.WebXR;
                    break;
                case "gallery":
                    this._currentType = EmbedType.Gallery;
                    break;
                case "launcher":
                    this._currentType = EmbedType.Launcher;
                    break;
                case "viewer":
                case "configurator":
                default:
                    this._currentType = EmbedType.Configurator;
            }
        }

        // check if the controller needs to be re-created
        if ((currentEmbed !== this._currentType) && this._controller) {
            this._controller.removeRenderer();
            this._controller = null;
        }

        const sceneID: string | null = this.hasAttribute("scene-id") ? this.getAttribute("scene-id") : null;

        // if the provided SceneID doesn't match, we need to remove the controller
        if ((sceneID !== this._currentSceneID) && this._controller) {
            this._controller.removeRenderer();
            this._controller = null;
        }

        this._currentSceneID = sceneID;

        // scene-id is the absolute minimum in order to initialise the embeds
        if (!this._currentSceneID) {
            return;
        }

        // if the controller was removed due to state-change, we need to re-initialise it
        if (!this._controller) {
            switch (this._currentType) {
                case EmbedType.Configurator:
                    this._controller = new ConfiguratorController(this);
                    break;
                case EmbedType.WebXR:
                    this._controller = new WebXRController(this);
                    break;
                case EmbedType.Gallery:
                    this._controller = new GalleryController(this);
                    break;
                case EmbedType.Launcher:
                    this._controller = new LauncherController(this);
                    break;
                case EmbedType.VTO:
                    this._controller = new VTOController(this);
                    break;
            }

            if (this._controller) {
                const init: string | null = this.hasAttribute("init") ? this.getAttribute("init") : null;

                switch (init) {
                    case "viewer": this.startViewer();
                        break;
                    case "qrcode": this.startQRCode();
                        break;
                }
            }
        }
        else {
            this._OnAttributesUpdated(attributeName);
        }
    }

    public async initAR(): Promise<LauncherAR> {
        if (!this._controller) {
            throw new Error("PlattarEmbed.initAR() - cannot execute as controller has not loaded yet");
        }

        return this._controller.initAR();
    }

    public async startAR(): Promise<void> {
        if (!this._controller) {
            throw new Error("PlattarEmbed.startAR() - cannot execute as controller has not loaded yet");
        }

        return this._controller.startAR()
    }

    public async startViewer(): Promise<HTMLElement> {
        if (!this._controller) {
            throw new Error("PlattarEmbed.startViewer() - cannot execute as controller has not loaded yet");
        }

        return this._controller.startRenderer();
    }

    public async startQRCode(options: any | undefined | null = null): Promise<HTMLElement> {
        if (!this._controller) {
            throw new Error("PlattarEmbed.startQRCode() - cannot execute as controller has not loaded yet");
        }

        return this._controller.startQRCode(options);
    }

    /**
     * This will remove the currently active Renderer
     *
     * @returns - true if removed successfully, false otherwise
     */
    public removeRenderer(): boolean {
        if (!this._controller) {
            return false;
        }

        return this._controller.removeRenderer();
    }

    /**
     * This is called by the observer if any of the embed attributes have changed
     * based on the state of the embed, we update the internal structure accordingly
     */
    private _OnAttributesUpdated(attributeName: string): void {
        if (this._controller) {
            this._controller.onAttributesUpdated(attributeName);
        }
    }

    public override addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions | undefined): void;
    public override addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | undefined): void;
    public override addEventListener(type: unknown, listener: unknown, options?: unknown): void {
        // add to the element event listener
        super.addEventListener(<any>type, <any>listener, <any>options);

        const eventType: string = 'arclick';

        if (type === eventType) {
            // automatically enable `show-ar-banner` to true if an arclick event is added
            this.setAttribute('show-ar-banner', 'true');

            // if this is a redirect url from an AR Action - we need to fire the event listener now
            const url = new URL(location.href);

            if (url.searchParams.get('plattar_ar_action') === 'true') {
                setTimeout(() => {
                    this.dispatchEvent(new Event(eventType));
                }, 200);
            }
        }
    }
}