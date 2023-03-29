import { Server } from "@plattar/plattar-api";
import { LauncherAR } from "../../ar/launcher-ar";
import { ProductAR } from "../../ar/product-ar";
import { Util } from "../../util/util";
import { QRCodeOptions } from "../qrcode/qrcode-controller";
import { PlattarController } from "./plattar-controller";

/**
 * Manages an instance of the <plattar-product> HTML Element
 */
export class ProductController extends PlattarController {

    private _element: HTMLElement | null = null;

    constructor(parent: HTMLElement) {
        super(parent);
    }

    public override onAttributesUpdated(): void {
        super.onAttributesUpdated();

        const viewer: any | null = this._element;

        if (viewer) {
            const variationID: string | null = this.getAttribute("variation-id");

            if (variationID && viewer.messenger) {
                viewer.messenger.selectVariation(variationID);
            }
        }
    }

    public override getViewerQRCodeURL(options: QRCodeOptions): string {
        const productID: string | null = this.getAttribute("product-id");

        let dst: string = Server.location().base + "renderer/product.html?product_id=" + productID;

        // optional attributes
        const variationID: string | null = this.getAttribute("variation-id");
        const variationSKU: string | null = this.getAttribute("variation-sku");
        const showAR: string | null = this.getAttribute("show-ar");

        if (variationID) {
            dst += "&variationId=" + variationID;
        }

        if (variationSKU) {
            dst += "&variationSku=" + variationSKU;
        }

        if (showAR) {
            dst += "&show_ar=" + showAR;
        }

        return dst;
    }

    public override startRenderer(): Promise<HTMLElement> {
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
                viewer.style.zIndex = "1";
                viewer.style.display = "block";

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

                return;
            }

            return reject(new Error("ProductController.startRenderer() - minimum required attributes not set, use scene-id as a minimum"));
        });
    }

    public override initAR(): Promise<LauncherAR> {
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

    public override removeRenderer(): boolean {
        if (this.qrcode.visible) {
            this.hideQRCode();

            return true;
        }

        if (this._element) {
            this._element.remove();
            this._element = null;

            return true;
        }

        return false;
    }

    public override get element(): HTMLElement | null {
        return this._element;
    }
}