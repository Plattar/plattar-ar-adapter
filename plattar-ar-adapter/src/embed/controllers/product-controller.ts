import { Scene, Server } from "@plattar/plattar-api";
import { LauncherAR } from "../../ar/launcher-ar";
import { ProductAR } from "../../ar/product-ar";
import { Util } from "../../util/util";
import { ControllerState, PlattarController } from "./plattar-controller";
import { ConfiguratorState } from "../../util/configurator-state";

/**
 * Manages an instance of the <plattar-product> HTML Element
 * 
 * NOTE: As of 14th June 2023, this is now a legacy Controller and only used in legacy embeds
 * and should be deprecated from both documentation and previous integrations
 */
export class ProductController extends PlattarController {

    constructor(parent: HTMLElement) {
        // this is a hack against DecodedConfiguratorState that's now stored in PlattarController
        // this is not used in legacy mode
        super(parent, { scene: <Scene>(<any>null), state: <ConfiguratorState>(<any>null) });
    }

    public override onAttributesUpdated(attributeName: string): void {
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
                const variationID: string | null = this.getAttribute("variation-id");

                if (variationID && viewer.messenger) {
                    viewer.messenger.selectVariation(variationID);
                }
            }

            return;
        }
    }

    public startViewerQRCode(options: any): Promise<HTMLElement> {
        return new Promise<HTMLElement>((accept, reject) => {
            // remove the old renderer instance if any
            this.removeRenderer();

            const productID: string | null = this.getAttribute("product-id");

            if (productID) {
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

                // optional attributes
                const variationID: string | null = this.getAttribute("variation-id");
                const variationSKU: string | null = this.getAttribute("variation-sku");
                const showAR: string | null = this.getAttribute("show-ar");

                let dst: string = Server.location().base + "renderer/product.html?product_id=" + productID;

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

            return reject(new Error("ProductController.startQRCode() - minimum required attributes not set, use product-id as a minimum"));
        });
    }

    public startRenderer(): Promise<HTMLElement> {
        return new Promise<HTMLElement>((accept, reject) => {
            // remove the old renderer instance if any
            this.removeRenderer();

            const productID: string | null = this.getAttribute("product-id");

            if (productID) {
                // required attributes with defaults for plattar-product node
                const width: string = this.getAttribute("width") || "500px";
                const height: string = this.getAttribute("height") || "500px";
                const server: string = this.getAttribute("server") || "production";

                const viewer: HTMLElement = document.createElement("plattar-product");

                viewer.setAttribute("width", width);
                viewer.setAttribute("height", height);
                viewer.setAttribute("server", server);
                viewer.setAttribute("product-id", productID);

                // optional attributes
                const variationID: string | null = this.getAttribute("variation-id");
                const variationSKU: string | null = this.getAttribute("variation-sku");
                const showAR: string | null = this.getAttribute("show-ar");

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

            return reject(new Error("ProductController.startRenderer() - minimum required attributes not set, use scene-id as a minimum"));
        });
    }

    public initAR(): Promise<LauncherAR> {
        return new Promise<LauncherAR>((accept, reject) => {
            if (!Util.canAugment()) {
                return reject(new Error("ProductController.initAR() - cannot proceed as AR not available in context"));
            }

            const productID: string | null = this.getAttribute("product-id");

            if (productID) {
                const variationID: string | null = this.getAttribute("variation-id");
                const variationSKU: string | null = this.getAttribute("variation-sku");

                const product: ProductAR = new ProductAR(productID, variationID, variationSKU);

                return product.init().then(accept).catch(reject);
            }

            return reject(new Error("ProductController.initAR() - minimum required attributes not set, use product-id as a minimum"));
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