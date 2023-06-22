import { Server } from "@plattar/plattar-api";
import { LauncherAR } from "../../ar/launcher-ar";
import { SceneProductAR } from "../../ar/scene-product-ar";
import { ConfiguratorState, DecodedConfiguratorState, SceneProductData } from "../../util/configurator-state";
import { Util } from "../../util/util";
import { ControllerState, PlattarController } from "./plattar-controller";
import { ConfiguratorAR } from "../../ar/configurator-ar";

/**
 * Manages an instance of the <plattar-configurator> HTML Element
 */
export class ConfiguratorController extends PlattarController {

    private _cachedConfigState: Promise<DecodedConfiguratorState> | null = null;

    public async getConfiguratorState(): Promise<DecodedConfiguratorState> {
        if (this._cachedConfigState) {
            return this._cachedConfigState;
        }

        this._cachedConfigState = this.createConfiguratorState();

        return this._cachedConfigState;
    }

    public override async onAttributesUpdated(attributeName: string): Promise<void> {
        const state: ControllerState = this._state;

        if (attributeName === "variation-id") {
            const configState: DecodedConfiguratorState = await this.getConfiguratorState();
            const variationIDs: string | null = this.getAttribute("variation-id");
            const variationIDsList: Array<string> = variationIDs ? variationIDs.split(",") : [];

            variationIDsList.forEach((variationID: string) => {
                configState.state.setVariationID(variationID);
            });
        }

        if (attributeName === "variation-sku") {
            const configState: DecodedConfiguratorState = await this.getConfiguratorState();
            const variationSKUs: string | null = this.getAttribute("variation-sku");
            const variationSKUList: Array<string> = variationSKUs ? variationSKUs.split(",") : [];

            variationSKUList.forEach((variationSKU: string) => {
                configState.state.setVariationSKU(variationSKU);
            });
        }

        // re-render the QR Code when attributes have changed
        if (state === ControllerState.QRCode) {
            this.startQRCode(this._prevQROpt);

            return;
        }
    }

    public async startViewerQRCode(options: any): Promise<HTMLElement> {
        // remove the old renderer instance if any
        this.removeRenderer();

        const sceneID: string | null = this.getAttribute("scene-id");

        if (!sceneID) {
            throw new Error("ConfiguratorController.startQRCode() - minimum required attributes not set, use scene-id as a minimum");
        }

        const opt: any = options || this._GetDefaultQROptions();

        const viewer: HTMLElement = document.createElement("plattar-qrcode");
        this._element = viewer;

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

        viewer.setAttribute("shorten", (opt.shorten && (opt.shorten === true || opt.shorten === "true")) ? "true" : "false");

        let dst: string = Server.location().base + "renderer/configurator.html?scene_id=" + sceneID;

        // optional attributes
        let configState: string | null = null;
        const showAR: string | null = this.getAttribute("show-ar");
        const showUI: string | null = this.getAttribute("show-ui");

        try {
            configState = (await this.getConfiguratorState()).state.encode();
        }
        catch (_err) {
            // config state is not available
            configState = null;
        }

        if (showUI && showUI === "true") {
            dst = Server.location().base + "configurator/dist/index.html?scene_id=" + sceneID;
        }

        if (configState) {
            dst += "&config_state=" + configState;
        }

        if (showAR) {
            dst += "&show_ar=" + showAR;
        }

        viewer.setAttribute("url", opt.url || dst);

        this._state = ControllerState.QRCode;
        this._prevQROpt = opt;

        return new Promise<HTMLElement>((accept, reject) => {
            viewer.onload = () => {
                return accept(viewer);
            };

            this.append(viewer);
        });
    }

    public async startRenderer(): Promise<HTMLElement> {
        // remove the old renderer instance if any
        this.removeRenderer();

        const sceneID: string | null = this.getAttribute("scene-id");

        if (!sceneID) {
            throw new Error("ConfiguratorController.startRenderer() - minimum required attributes not set, use scene-id as a minimum");
        }

        // required attributes with defaults for plattar-configurator node
        const width: string = this.getAttribute("width") || "500px";
        const height: string = this.getAttribute("height") || "500px";
        const server: string = this.getAttribute("server") || "production";

        const viewer: HTMLElement = document.createElement("plattar-configurator");
        this._element = viewer;

        viewer.setAttribute("width", width);
        viewer.setAttribute("height", height);
        viewer.setAttribute("server", server);
        viewer.setAttribute("scene-id", sceneID);

        // optional attributes
        let configState: DecodedConfiguratorState | null = null;

        try {
            configState = await this.getConfiguratorState();
        }
        catch (_err) {
            // config state is not available
            configState = null;
        }

        const showAR: string | null = this.getAttribute("show-ar");
        const showUI: string | null = this.getAttribute("show-ui");

        if (configState) {
            viewer.setAttribute("config-state", configState.state.encode());
        }

        if (showAR) {
            viewer.setAttribute("show-ar", showAR);
        }

        if (showUI) {
            viewer.setAttribute("show-ui", showUI);
        }

        this._state = ControllerState.Renderer;

        return new Promise<HTMLElement>((accept, reject) => {
            viewer.onload = () => {
                if (configState) {
                    this.setupMessengerObservers(viewer, configState);
                }

                return accept(viewer);
            };

            this.append(viewer);
        });
    }

    public async initAR(): Promise<LauncherAR> {
        if (!Util.canAugment()) {
            throw new Error("ConfiguratorController.initAR() - cannot proceed as AR not available in context");
        }

        const arMode: string | null = this.getAttribute("ar-mode") || "generated";

        switch (arMode.toLowerCase()) {
            case "inherited":
                return this._InitARInherited();
            case "generated":
            default:
                return this._InitARGenerated();
        }
    }

    /**
     * Private Function - This launches the Static/Inherited AR Mode
     */
    private async _InitARInherited(): Promise<LauncherAR> {
        const sceneID: string | null = this.getAttribute("scene-id");

        if (!sceneID) {
            throw new Error("ConfiguratorController.initAR() - inherited AR minimum required attributes not set, use scene-id as a minimum");
        }

        const state: ConfiguratorState = (await this.getConfiguratorState()).state;
        const first: SceneProductData | null = state.first();

        if (first) {
            const sceneProductAR: SceneProductAR = new SceneProductAR(first.scene_product_id, first.product_variation_id);

            return sceneProductAR.init();
        }

        throw new Error("ConfiguratorController.initAR() - invalid decoded config-state does not have any product states");
    }

    /**
     * Private Function - This launches the Dynamic/Generated AR Mode
     */
    private async _InitARGenerated(): Promise<LauncherAR> {
        const sceneID: string | null = this.getAttribute("scene-id");

        if (!sceneID) {
            throw new Error("VTOController.initAR() - generated AR minimum required attributes not set, use scene-id as a minimum");
        }

        const configAR: ConfiguratorAR = new ConfiguratorAR(await this.getConfiguratorState());

        return configAR.init();
    }

    public removeRenderer(): boolean {
        if (this._element) {
            this._element.remove();
            this._element = null;

            return true;
        }

        this.removeMessengerObservers();

        return false;
    }

    public get element(): HTMLElement | null {
        return this._element;
    }
}