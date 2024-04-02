import { LauncherAR } from "../../ar/launcher-ar";
import { DecodedConfiguratorState } from "../../util/configurator-state";
import { Util } from "../../util/util";
import { ControllerState, PlattarController } from "./plattar-controller";

/**
 * Manages an instance of the <plattar-ewall> HTML Element
 */
export class WebXRController extends PlattarController {
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

        if (state === ControllerState.Renderer) {
            const viewer: any | null = this.element;

            if (viewer) {
                if (attributeName === "variation-id") {
                    const variationIDs: string | null = this.getAttribute("variation-id");
                    const variationIDsList: Array<string> = variationIDs ? variationIDs.split(",") : [];

                    if (variationIDsList.length > 0) {
                        await viewer.messenger.selectVariationID(variationIDsList);
                    }
                }

                if (attributeName === "variation-sku") {
                    const variationSKUs: string | null = this.getAttribute("variation-sku");
                    const variationSKUList: Array<string> = variationSKUs ? variationSKUs.split(",") : [];

                    if (variationSKUList.length > 0) {
                        await viewer.messenger.selectVariationSKU(variationSKUList);
                    }
                }
            }

            return;
        }

        // re-render the QR Code when attributes have changed
        if (state === ControllerState.QRCode) {
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

            this.startQRCode(this._prevQROpt);

            return;
        }
    }

    public override startViewerQRCode(options: any): Promise<HTMLElement> {
        return this.startQRCode(options);
    }

    public override get element(): HTMLElement | null {
        return this._element;
    }

    public override async startQRCode(options: any): Promise<HTMLElement> {
        // remove the old renderer instance if any
        this.removeRenderer();

        const sceneID: string | null = this.getAttribute("scene-id");

        if (!sceneID) {
            throw new Error("WebXRController.startQRCode() - minimum required attributes not set, use scene-id as a minimum");
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

        const dst: string = location.href;

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

        if (!Util.canAugment()) {
            return this.startQRCode(this._GetDefaultQROptions());
        }

        const sceneID: string | null = this.getAttribute("scene-id");

        if (!sceneID) {
            throw new Error("WebXRController.startRenderer() - minimum required attributes not set, use scene-id as a minimum");
        }

        // required attributes with defaults for plattar-configurator node
        const width: string = this.getAttribute("width") || "500px";
        const height: string = this.getAttribute("height") || "500px";
        const server: string = this.getAttribute("server") || "production";

        const viewer: HTMLElement = document.createElement("plattar-8wall");
        this._element = viewer;

        viewer.setAttribute("width", width);
        viewer.setAttribute("height", height);
        viewer.setAttribute("server", server);
        viewer.setAttribute("scene-id", sceneID);

        const showAR: string | null = this.getAttribute("show-ar");
        const showUI: string | null = this.getAttribute("show-ui");

        if (showAR) {
            viewer.setAttribute("show-ar", showAR);
        }

        if (showUI) {
            viewer.setAttribute("show-ui", showUI);
        }

        return new Promise<HTMLElement>((accept, reject) => {
            this.append(viewer);

            return accept(viewer);
        });
    }

    public override async initAR(): Promise<LauncherAR> {
        throw new Error("WebXRController.initAR() - cannot proceed as AR not available in webxr");
    }
}