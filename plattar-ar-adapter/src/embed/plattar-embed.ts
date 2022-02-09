import { Server } from "@plattar/plattar-api";
import { LauncherAR } from "../ar/launcher-ar";
import { PlattarController } from "./controllers/plattar-controller";
import { ProductController } from "./controllers/product-controller";
import { ViewerController } from "./controllers/viewer-controller";
import { ConfiguratorController } from "./controllers/configurator-controller";
import { VTOController } from "./controllers/vto-controller";

/**
 * This tracks the current embed type
 */
enum EmbedType {
    Viewer,
    Configurator,
    VTO
}

/**
 * This is the primary <plattar-embed /> node that allows easy embedding
 * of Plattar related content
 */
export default class PlattarEmbed extends HTMLElement {

    // this is the current embed type, viewer by default
    private _currentType: EmbedType = EmbedType.Viewer;
    private _controller: PlattarController | null = null;

    constructor() {
        super();
    }

    public get viewer(): HTMLElement | null {
        return this._controller ? this._controller.element : null;
    }

    connectedCallback() {
        const embedType: string | null = this.hasAttribute("embed-type") ? this.getAttribute("embed-type") : "viewer";

        if (embedType) {
            switch (embedType.toLowerCase()) {
                case "viewer":
                    this._currentType = EmbedType.Viewer;
                    break;
                case "vto":
                    this._currentType = EmbedType.VTO;
                    break;
                case "configurator":
                    this._currentType = EmbedType.Configurator;
                    break;
                default:
                    this._currentType = EmbedType.Viewer;
            }
        }

        const observer: MutationObserver = new MutationObserver((mutations: MutationRecord[]) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "attributes") {
                    this._OnAttributesUpdated();
                }
            });
        });

        observer.observe(this, {
            attributes: true
        });

        const server: string | null = this.hasAttribute("server") ? this.getAttribute("server") : "production";
        Server.create(Server.match(server || "production"));

        const sceneID: string | null = this.hasAttribute("scene-id") ? this.getAttribute("scene-id") : null;
        const productID: string | null = this.hasAttribute("product-id") ? this.getAttribute("product-id") : null;

        // decide which controller to initialise
        if (this._currentType === EmbedType.Viewer) {
            // initialise product if scene-id is missing but product-id is defined
            if (!sceneID && productID) {
                this._controller = new ProductController(this);
            }
            else if (sceneID) {
                this._controller = new ViewerController(this);
            }
        }
        else if (this._currentType === EmbedType.Configurator) {
            this._controller = new ConfiguratorController(this);
        }
        else if (this._currentType === EmbedType.VTO) {
            this._controller = new VTOController(this);
        }

        const init: string | null = this.hasAttribute("init") ? this.getAttribute("init") : null;

        if (init === "ar") {
            this.startAR();
        }
        else if (init === "viewer") {
            this.startViewer();
        }
        else if (init === "qrcode") {
            this.startQRCode();
        }
        else if (init === "ar-fallback-qrcode") {
            this.startAR().then(() => {
                // nothing to do, launched successfully
            }).catch((_err) => {
                this.startQRCode();
            });
        }
        else if (init === "ar-fallback-viewer") {
            this.startAR().then(() => {
                // nothing to do, launched successfully
            }).catch((_err) => {
                this.startViewer();
            });
        }
    }

    public initAR(): Promise<LauncherAR> {
        return new Promise<LauncherAR>((accept, reject) => {
            if (!this._controller) {
                return reject(new Error("PlattarEmbed.initAR() - cannot execute as controller has not loaded yet"));
            }

            return this._controller.initAR().then(accept).catch(reject);
        });
    }

    public startAR(): Promise<void> {
        return new Promise<void>((accept, reject) => {
            if (!this._controller) {
                return reject(new Error("PlattarEmbed.startAR() - cannot execute as controller has not loaded yet"));
            }

            return this._controller.startAR().then(accept).catch(reject);
        });
    }

    public startViewer(): Promise<HTMLElement> {
        return new Promise<HTMLElement>((accept, reject) => {
            if (!this._controller) {
                return reject(new Error("PlattarEmbed.startViewer() - cannot execute as controller has not loaded yet"));
            }

            return this._controller.startRenderer().then(accept).catch(reject);
        });
    }

    public startQRCode(options: any | undefined | null = null): Promise<HTMLElement> {
        return new Promise<HTMLElement>((accept, reject) => {
            if (!this._controller) {
                return reject(new Error("PlattarEmbed.startQRCode() - cannot execute as controller has not loaded yet"));
            }

            return this._controller.startQRCode(options).then(accept).catch(reject);
        });
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
    private _OnAttributesUpdated(): void {
        if (this._controller) {
            this._controller.onAttributesUpdated();
        }
    }
}