import { Server } from "@plattar/plattar-api";
import { LauncherAR } from "../../ar/launcher-ar";
import { ProductAR } from "../../ar/product-ar";
import { SceneAR } from "../../ar/scene-ar";
import { SceneProductAR } from "../../ar/scene-product-ar";
import { Util } from "../../util/util";
import { ControllerState, PlattarController } from "./plattar-controller";

/**
 * Manages an instance of the <plattar-viewer> HTML Element
 */
export class ViewerController extends PlattarController {

    constructor(parent: HTMLElement) {
        super(parent);
    }

    public onAttributesUpdated(): void {
        const state: ControllerState = this._state;

        // re-render the QR Code when attributes have changed
        if (state === ControllerState.QRCode) {
            this.startQRCode(this._prevQROpt);

            return;
        }

        // use the messenger function to change variation when attributes have changed
        if (state === ControllerState.Renderer) {
            const viewer: any | null = this._element;

            if (viewer) {
                const productID: string | null = (this.getAttribute("product-id") || this.getAttribute("scene-product-id"));
                const variationID: string | null = this.getAttribute("variation-id");

                if (productID && variationID && viewer.messenger) {
                    viewer.messenger.selectVariation(productID, variationID);
                }
            }

            return;
        }
    }

    public startViewerQRCode(options: any): Promise<HTMLElement> {
        return new Promise<HTMLElement>((accept, reject) => {
            // remove the old renderer instance if any
            this.removeRenderer();

            const sceneID: string | null = this.getAttribute("scene-id");

            if (sceneID) {
                const opt: any = options || PlattarController.DEFAULT_QR_OPTIONS;

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

                let dst: string = Server.location().base + "renderer/viewer.html?scene_id=" + sceneID;

                // optional attributes
                const productID: string | null = (this.getAttribute("product-id") || this.getAttribute("scene-product-id"));
                const variationID: string | null = this.getAttribute("variation-id");
                const variationSKU: string | null = this.getAttribute("variation-sku");
                const showAR: string | null = this.getAttribute("show-ar");

                if (productID) {
                    dst += "&productId=" + productID;
                }

                if (variationID) {
                    dst += "&variationId=" + variationID;
                }

                if (variationSKU) {
                    dst += "&variationSku=" + variationSKU;
                }

                if (showAR) {
                    dst += "&show_ar=" + showAR;
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

            return reject(new Error("ViewerController.startQRCode() - minimum required attributes not set, use scene-id as a minimum"));
        });
    }

    public startRenderer(): Promise<HTMLElement> {
        return new Promise<HTMLElement>((accept, reject) => {
            // remove the old renderer instance if any
            this.removeRenderer();

            const sceneID: string | null = this.getAttribute("scene-id");

            if (sceneID) {
                // required attributes with defaults for plattar-viewer node
                const width: string = this.getAttribute("width") || "500px";
                const height: string = this.getAttribute("height") || "500px";
                const server: string = this.getAttribute("server") || "production";

                const viewer: HTMLElement = document.createElement("plattar-viewer");

                viewer.setAttribute("width", width);
                viewer.setAttribute("height", height);
                viewer.setAttribute("server", server);
                viewer.setAttribute("scene-id", sceneID);

                // optional attributes
                const productID: string | null = (this.getAttribute("product-id") || this.getAttribute("scene-product-id"));
                const variationID: string | null = this.getAttribute("variation-id");
                const variationSKU: string | null = this.getAttribute("variation-sku");
                const showAR: string | null = this.getAttribute("show-ar");

                if (productID) {
                    viewer.setAttribute("product-id", productID);
                }

                if (variationID) {
                    viewer.setAttribute("variation-id", variationID);
                }

                if (variationSKU) {
                    viewer.setAttribute("variation-sku", variationSKU);
                }

                if (showAR) {
                    viewer.setAttribute("show-ar", showAR);
                }

                viewer.onload = () => {
                    return accept(viewer);
                };

                this.append(viewer);

                this._element = viewer;
                this._state = ControllerState.Renderer;

                return;
            }

            return reject(new Error("ViewerController.startRenderer() - minimum required attributes not set, use scene-id as a minimum"));
        });
    }

    public initAR(): Promise<LauncherAR> {
        return new Promise<LauncherAR>((accept, reject) => {
            if (!Util.canAugment()) {
                return reject(new Error("ViewerController.initAR() - cannot proceed as AR not available in context"));
            }

            const productID: string | null = this.getAttribute("product-id");

            // use product-id if available
            if (productID) {
                const variationID: string | null = this.getAttribute("variation-id");
                const variationSKU: string | null = this.getAttribute("variation-sku");

                const product: ProductAR = new ProductAR(productID, variationID, variationSKU);

                return product.init().then(accept).catch(reject);
            }

            const sceneProductID: string | null = this.getAttribute("scene-product-id");

            // use scene-product-id if available
            if (sceneProductID) {
                const variationID: string | null = this.getAttribute("variation-id");
                const variationSKU: string | null = this.getAttribute("variation-sku");

                const product: SceneProductAR = new SceneProductAR(sceneProductID, variationID, variationSKU);

                return product.init().then(accept).catch(reject);
            }

            const sceneID: string | null = this.getAttribute("scene-id");

            // fallback to using default SceneAR implementation
            if (sceneID) {
                const sceneAR: SceneAR = new SceneAR(sceneID);

                sceneAR.init().then(accept).catch(reject);

                return;
            }

            return reject(new Error("ViewerController.initAR() - minimum required attributes not set, use scene-id as a minimum"));
        });
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