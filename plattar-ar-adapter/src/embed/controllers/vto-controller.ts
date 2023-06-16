import { Server } from "@plattar/plattar-api";
import { Configurator } from "@plattar/plattar-services";
import { ConfiguratorState, SceneAR, SceneProductAR } from "../..";
import { LauncherAR } from "../../ar/launcher-ar";
import { RawAR } from "../../ar/raw-ar";
import { DecodedConfiguratorState, SceneProductData } from "../../util/configurator-state";
import { Util } from "../../util/util";
import { ControllerState, PlattarController } from "./plattar-controller";
import { ConfiguratorAR } from "../../ar/configurator-ar";

/**
 * Manages an instance of the <plattar-configurator> HTML Element
 */
export class VTOController extends PlattarController {

    public onAttributesUpdated(): void {
        const state: ControllerState = this._state;

        // re-render the QR Code when attributes have changed
        if (state === ControllerState.QRCode) {
            this.startQRCode(this._prevQROpt);

            return;
        }
    }

    public startViewerQRCode(options: any): Promise<HTMLElement> {
        return new Promise<HTMLElement>((accept, reject) => {
            // remove the old renderer instance if any
            this.removeRenderer();

            const sceneID: string | null = this.getAttribute("scene-id");

            if (sceneID) {
                const opt: any = options || this._GetDefaultQROptions();

                const viewer: HTMLElement = document.createElement("plattar-qrcode");

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

                let dst: string = Server.location().base + "renderer/facear.html?scene_id=" + sceneID;

                // optional attributes
                const configState: string | null = this.getAttribute("config-state");
                const showAR: string | null = this.getAttribute("show-ar");
                const productID: string | null = this.getAttribute("product-id");
                const sceneProductID: string | null = this.getAttribute("scene-product-id");
                const variationID: string | null = this.getAttribute("variation-id");

                if (configState) {
                    dst += "&config_state=" + configState;
                }

                if (showAR) {
                    dst += "&show_ar=" + showAR;
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

                viewer.setAttribute("url", opt.url || dst);

                viewer.onload = () => {
                    return accept(viewer);
                };

                this.append(viewer);

                this._element = viewer;
                this._state = ControllerState.QRCode;
                this._prevQROpt = opt;

                return;
            }

            return reject(new Error("VTOController.startQRCode() - minimum required attributes not set, use scene-id as a minimum"));
        });
    }

    public startRenderer(): Promise<HTMLElement> {
        return new Promise<HTMLElement>((accept, reject) => {
            // remove the old renderer instance if any
            this.removeRenderer();

            const sceneID: string | null = this.getAttribute("scene-id");

            if (sceneID) {
                // required attributes with defaults for plattar-facear node
                const width: string = this.getAttribute("width") || "500px";
                const height: string = this.getAttribute("height") || "500px";
                const server: string = this.getAttribute("server") || "production";

                const viewer: HTMLElement = document.createElement("plattar-facear");

                viewer.setAttribute("width", width);
                viewer.setAttribute("height", height);
                viewer.setAttribute("server", server);
                viewer.setAttribute("scene-id", sceneID);

                // optional attributes
                const configState: string | null = this.getAttribute("config-state");
                const showAR: string | null = this.getAttribute("show-ar");
                const productID: string | null = this.getAttribute("product-id");
                const sceneProductID: string | null = this.getAttribute("scene-product-id");
                const variationID: string | null = this.getAttribute("variation-id");

                if (configState) {
                    viewer.setAttribute("config-state", configState);
                }

                if (showAR) {
                    viewer.setAttribute("show-ar", showAR);
                }

                if (productID) {
                    viewer.setAttribute("product-id", productID);
                }

                if (sceneProductID) {
                    viewer.setAttribute("scene-product-id", sceneProductID);
                }

                if (variationID) {
                    viewer.setAttribute("variation-id", variationID);
                }

                viewer.onload = () => {
                    return accept(viewer);
                };

                this.append(viewer);

                this._element = viewer;
                this._state = ControllerState.Renderer;

                return;
            }

            return reject(new Error("VTOController.startRenderer() - minimum required attributes not set, use scene-id as a minimum"));
        });
    }

    public async initAR(): Promise<LauncherAR> {
        if (!Util.canAugment()) {
            throw new Error("VTOController.initAR() - cannot proceed as VTO AR not available in context");
        }

        if (!(Util.isSafari() || Util.isChromeOnIOS())) {
            throw new Error("VTOController.initAR() - cannot proceed as VTO AR only available on IOS Mobile devices");
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
            throw new Error("VTOController.initAR() - inherited AR minimum required attributes not set, use scene-id as a minimum");
        }

        const state: ConfiguratorState = this.decodedConfigState.state;
        const first: SceneProductData | null = state.first();

        if (first) {
            const sceneProductAR: SceneProductAR = new SceneProductAR(first.scene_product_id, first.product_variation_id);

            return sceneProductAR.init();
        }

        throw new Error("VTOController.initAR() - invalid decoded config-state does not have any product states");
    }

    /**
     * Private Function - This launches the Dynamic/Generated AR Mode
     */
    private async _InitARGenerated(): Promise<LauncherAR> {
        const sceneID: string | null = this.getAttribute("scene-id");

        if (!sceneID) {
            throw new Error("VTOController.initAR() - generated AR minimum required attributes not set, use scene-id as a minimum");
        }

        const configAR: ConfiguratorAR = new ConfiguratorAR(this.decodedConfigState);

        return configAR.init();
    }

    public removeRenderer(): boolean {
        if (this._element) {
            this._element.remove();
            this._element = null;

            return true;
        }

        return false;
    }

    public get element(): HTMLElement | null {
        return this._element;
    }
}