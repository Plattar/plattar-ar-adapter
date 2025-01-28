import { Server } from "@plattar/plattar-api";
import { LauncherAR } from "../../ar/launcher-ar";
import { DecodedConfiguratorState } from "../../util/configurator-state";
import { ControllerState, PlattarController } from "./plattar-controller";

/**
 * Manages an instance of the <plattar-configurator> HTML Element
 */
export class GalleryController extends PlattarController {

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

    public async startViewerQRCode(options: any): Promise<HTMLElement> {
        // remove the old renderer instance if any
        this.removeRenderer();

        const sceneID: string | null = this.getAttribute("scene-id");

        if (!sceneID) {
            throw new Error("GalleryController.startViewerQRCode() - minimum required attributes not set, use scene-id as a minimum");
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

        const dst: string = Server.location().base + "renderer/gallery.html?scene_id=" + sceneID;

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
            throw new Error("GalleryController.startRenderer() - minimum required attributes not set, use scene-id as a minimum");
        }

        this._state = ControllerState.Renderer;

        // required attributes with defaults for plattar-configurator node
        const width: string = this.getAttribute("width") || "500px";
        const height: string = this.getAttribute("height") || "500px";
        const server: string = this.getAttribute("server") || "production";

        const viewer: HTMLElement = document.createElement("plattar-gallery");
        this._element = viewer;

        viewer.setAttribute("width", width);
        viewer.setAttribute("height", height);
        viewer.setAttribute("server", server);
        viewer.setAttribute("scene-id", sceneID);

        return new Promise<HTMLElement>((accept, reject) => {
            this.append(viewer);

            return accept(viewer);
        });
    }

    public async initAR(): Promise<LauncherAR> {
        throw new Error("GalleryController.initAR() - cannot proceed as AR not available in gallery context");
    }

    public get element(): HTMLElement | null {
        return this._element;
    }
}