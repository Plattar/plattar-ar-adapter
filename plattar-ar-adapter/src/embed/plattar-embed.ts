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
    VTO,
    None
}

/**
 * This is the primary <plattar-embed /> node that allows easy embedding
 * of Plattar related content
 */
export default class PlattarEmbed extends HTMLElement {

    // this is the current embed type, viewer by default
    private _currentType: EmbedType = EmbedType.None;
    private _controller: PlattarController | null = null;
    private _currentSceneID: string | null = null;

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
        // server cannot be changed once its set - defaults to production
        const server: string | null = this.hasAttribute("server") ? this.getAttribute("server") : "production";
        Server.create(Server.match(server || "production"));

        const observer: MutationObserver = new MutationObserver((mutations: MutationRecord[]) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "attributes") {
                    this._CreateEmbed();
                }
            });
        });

        observer.observe(this, {
            attributes: true
        });
    }

    private _CreateEmbed(): void {
        const embedType: string | null = this.hasAttribute("embed-type") ? this.getAttribute("embed-type") : "viewer";
        const currentEmbed: EmbedType = this._currentType;

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

        // if the controller was removed due to state-change, we need to re-initialise it
        if (!this._controller) {
            switch (this._currentType) {
                case EmbedType.Viewer:
                case EmbedType.Configurator:
                    this._controller = new ConfiguratorController(this);
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
            this._OnAttributesUpdated();
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
    private _OnAttributesUpdated(): void {
        if (this._controller) {
            this._controller.onAttributesUpdated();
        }
    }
}