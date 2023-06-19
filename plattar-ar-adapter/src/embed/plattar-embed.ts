import { Server } from "@plattar/plattar-api";
import { LauncherAR } from "../ar/launcher-ar";
import { PlattarController } from "./controllers/plattar-controller";
import { ConfiguratorController } from "./controllers/configurator-controller";
import { VTOController } from "./controllers/vto-controller";
import { ProductController } from "./controllers/product-controller";
import { ConfiguratorState, DecodedConfiguratorState } from "../util/configurator-state";

/**
 * This tracks the current embed type
 */
enum EmbedType {
    Configurator,
    Legacy,
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
    public create(): void {
        // server cannot be changed once its set - defaults to production
        const server: string | null = this.hasAttribute("server") ? this.getAttribute("server") : "production";
        Server.create(Server.match(server || "production"));

        if (!this._observer) {
            this._observer = new MutationObserver((mutations: MutationRecord[]) => {
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
            });

            this._observer.observe(this, {
                attributes: true
            });
        }

        const sceneID: string | null = this.hasAttribute("scene-id") ? this.getAttribute("scene-id") : null;
        const productID: string | null = this.hasAttribute("product-id") ? this.getAttribute("product-id") : null;

        if (!sceneID && productID) {
            this._currentType = EmbedType.Legacy;
            this._CreateLegacyEmbed();

            return;
        }

        this._CreateEmbed("none");
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
        this._controller = new ProductController(this);
    }

    /**
     * Generates a brand new Configurator State from the provided SceneID or inputted Configurator State
     */
    private async _CreateConfiguratorState(sceneID: string): Promise<DecodedConfiguratorState> {
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
     * creates the embed
     * this can also be called when attributes/state changes so embeds can be re-loaded
     */
    private async _CreateEmbed(attributeName: string): Promise<void> {
        const embedType: string | null = this.hasAttribute("embed-type") ? this.getAttribute("embed-type") : "configurator";
        const currentEmbed: EmbedType = this._currentType;

        if (embedType) {
            switch (embedType.toLowerCase()) {
                case "vto":
                    this._currentType = EmbedType.VTO;
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
            // decode either a previously defined/altered configuration state OR use a scene to generate a new state
            const decodedState: DecodedConfiguratorState = await this._CreateConfiguratorState(this._currentSceneID);

            switch (this._currentType) {
                case EmbedType.Configurator:
                    this._controller = new ConfiguratorController(this, decodedState);
                    break;
                case EmbedType.VTO:
                    this._controller = new VTOController(this, decodedState);
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
}