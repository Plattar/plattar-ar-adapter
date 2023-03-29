import { Server } from "@plattar/plattar-api";
import { LauncherAR } from "../../ar/launcher-ar";
import { ProductAR } from "../../ar/product-ar";
import { SceneAR } from "../../ar/scene-ar";
import { SceneProductAR } from "../../ar/scene-product-ar";
import { ConfiguratorState, SceneProductData } from "../../util/configurator-state";
import { Util } from "../../util/util";
import { QRCodeOptions } from "../qrcode/qrcode-controller";
import { PlattarController } from "./plattar-controller";

/**
 * Manages an instance of the <plattar-viewer> HTML Element
 */
export class ViewerController extends PlattarController {

    private _element: HTMLElement | null = null;

    constructor(parent: HTMLElement) {
        super(parent);
    }

    public override onAttributesUpdated(): void {
        super.onAttributesUpdated();

        const viewer: any | null = this._element;

        if (viewer) {
            const productID: string | null = (this.getAttribute("product-id") || this.getAttribute("scene-product-id"));
            const variationID: string | null = this.getAttribute("variation-id");

            if (productID && variationID && viewer.messenger) {
                viewer.messenger.selectVariation(productID, variationID);
            }
        }
    }

    public override getViewerQRCodeURL(options: QRCodeOptions): string {
        const sceneID: string | null = this.getAttribute("scene-id");

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

        return dst;
    }

    public override startRenderer(): Promise<HTMLElement> {
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

                return;
            }

            return reject(new Error("ViewerController.startRenderer() - minimum required attributes not set, use scene-id as a minimum"));
        });
    }

    public override initAR(): Promise<LauncherAR> {
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
                // special case - check if scene only has a single product, if so
                // we need to use provided variation-id or variation-sku to override
                const variationID: string | null = this.getAttribute("variation-id");
                const variationSKU: string | null = this.getAttribute("variation-sku");

                // just do scene-ar if variation ID and variation SKU is not set
                if (!variationID && !variationSKU) {
                    const sceneAR: SceneAR = new SceneAR(sceneID);

                    return sceneAR.init().then(accept).catch(reject);
                }

                // otherwise decode scene
                return ConfiguratorState.decodeScene(sceneID).then((state: ConfiguratorState) => {
                    const firstProduct: SceneProductData | null = state.first();

                    if (state.length > 1 || !firstProduct) {
                        return reject(new Error("ViewerController.initAR() - single product required to override variation-id or variation-sku"));
                    }

                    const product: SceneProductAR = new SceneProductAR(firstProduct.scene_product_id, variationID, variationSKU);

                    return product.init().then(accept).catch(reject);
                }).catch(reject);
            }

            return reject(new Error("ViewerController.initAR() - minimum required attributes not set, use scene-id as a minimum"));
        });
    }

    public override removeRenderer(): boolean {
        if (this.qrcode.visible) {
            this.qrcode.hide();

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