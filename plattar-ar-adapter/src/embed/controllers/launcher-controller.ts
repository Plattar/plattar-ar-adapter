import { LauncherAR } from "../../ar/launcher-ar";
import { SceneProductAR } from "../../ar/scene-product-ar";
import { ConfiguratorState, DecodedConfiguratorState, SceneProductData } from "../../util/configurator-state";
import { Util } from "../../util/util";
import { ControllerState, PlattarController } from "./plattar-controller";
import { ConfiguratorAR } from "../../ar/configurator-ar";
import { SceneGraphAR } from "../../ar/scene-graph-ar";

/**
 * Manages an instance of the <plattar-configurator> HTML Element
 */
export class LauncherController extends PlattarController {

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

    public override async startARQRCode(options: any): Promise<HTMLElement> {
        try {
            const dState: DecodedConfiguratorState = await this.getConfiguratorState();

            // if this is declared, we have a furniture scene that we need to re-create the embed
            // with new attributes
            const product = dState.state.firstOfType("product");

            if (product) {
                this.parent.lockObserver();
                this.parent.destroy();
                this.setAttribute("product-id", product.scene_product_id);
                this.removeAttribute("scene-id");
                this.parent.unlockObserver();
                const controller = this.parent.create();

                if (controller) {
                    return controller.startARQRCode(options);
                }

                return Promise.reject(new Error("LauncherController.startARQRCode() - legacy product transition failed"));
            }
        }
        catch (_err) {
        }

        return super.startARQRCode(options);
    }

    public async startViewerQRCode(options: any): Promise<HTMLElement> {
        return this.startARQRCode(options);
    }

    public async startRenderer(): Promise<HTMLElement> {
        // remove the old renderer instance if any
        this.removeRenderer();

        const sceneID: string | null = this.getAttribute("scene-id");

        if (!sceneID) {
            throw new Error("LauncherController.startRenderer() - minimum required attributes not set, use scene-id as a minimum");
        }

        // optional attributes
        const configState: DecodedConfiguratorState = await this.getConfiguratorState();
        this._state = ControllerState.Renderer;

        const qrOptions: string = btoa(JSON.stringify(this._GetDefaultQROptions()));

        const embedType: string | null = this.getAttribute("embed-type");
        const productID: string | null = this.getAttribute("product-id");
        const sceneProductID: string | null = this.getAttribute("scene-product-id");
        const variationID: string | null = this.getAttribute("variation-id");
        const variationSKU: string | null = this.getAttribute("variation-sku");
        const arMode: string | null = this.getAttribute("ar-mode");
        const showBanner: string | null = this.getAttribute("show-ar-banner");
        const sceneGraphID: string | null = this.getAttribute("scene-graph-id");

        // required attributes with defaults for plattar-launcher node
        const width: string = this.getAttribute("width") || "500px";
        const height: string = this.getAttribute("height") || "500px";
        const server: string = this.getAttribute("server") || "production";

        const viewer: HTMLElement = document.createElement("plattar-launcher");
        this._element = viewer;

        viewer.setAttribute("width", width);
        viewer.setAttribute("height", height);
        viewer.setAttribute("server", server);
        viewer.setAttribute("scene-id", sceneID);

        viewer.setAttribute("qr-options", qrOptions);

        if (embedType) {
            viewer.setAttribute("embed-type", embedType);
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

        if (variationSKU) {
            viewer.setAttribute("variation-sku", variationSKU);
        }

        if (arMode) {
            viewer.setAttribute("ar-mode", arMode);
        }

        if (showBanner) {
            viewer.setAttribute("show-ar-banner", showBanner);
        }

        if (sceneGraphID) {
            viewer.setAttribute("scene-graph-id", sceneGraphID);
        }
        else {
            try {
                const sceneGraphID: string = await (await this.getConfiguratorState()).state.encodeSceneGraphID();

                viewer.setAttribute("scene-graph-id", sceneGraphID);
            }
            catch (_err) {
                // scene graph ID not available for some reason
                // we will generate a new one
                console.error(_err);
            }
        }

        return new Promise<HTMLElement>((accept, reject) => {
            this.append(viewer);

            if (configState) {
                this.setupMessengerObservers(viewer, configState);
            }

            return accept(viewer);
        });
    }

    public async initAR(): Promise<LauncherAR> {
        if (!Util.canAugment()) {
            throw new Error("LauncherController.initAR() - cannot proceed as AR not available in context");
        }

        try {
            const dState: DecodedConfiguratorState = await this.getConfiguratorState();

            // if this is declared, we have a furniture scene that we need to re-create the embed
            // with new attributes
            const product = dState.state.firstOfType("product");

            if (product) {
                this.parent.lockObserver();
                this.parent.destroy();
                this.setAttribute("product-id", product.scene_product_id);
                this.removeAttribute("scene-id");
                this.parent.unlockObserver();
                const controller = this.parent.create();

                if (controller) {
                    return controller.initAR();
                }

                return Promise.reject(new Error("LauncherController.initAR() - legacy product transition failed"));
            }
        }
        catch (_err) {
            // config state is not available
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
            throw new Error("LauncherController.initAR() - inherited AR minimum required attributes not set, use scene-id as a minimum");
        }

        const state: ConfiguratorState = (await this.getConfiguratorState()).state;
        const first: SceneProductData | null = state.firstActiveOfType("sceneproduct");

        if (first) {
            //const sceneProductAR: SceneProductAR = new SceneProductAR(first.scene_product_id, first.product_variation_id);
            const sceneProductAR: SceneProductAR = new SceneProductAR({
                productID: first.scene_product_id,
                variationID: first.product_variation_id,
                variationSKU: null,
                useARBanner: this.getBooleanAttribute("show-ar-banner")
            });

            return sceneProductAR.init();
        }

        throw new Error("LauncherController.initAR() - invalid decoded config-state does not have any product states");
    }

    /**
     * Private Function - This launches the Dynamic/Generated AR Mode
     */
    private async _InitARGenerated(): Promise<LauncherAR> {
        const sceneID: string | null = this.getAttribute("scene-id");

        if (!sceneID) {
            throw new Error("LauncherController.initAR() - generated AR minimum required attributes not set, use scene-id as a minimum");
        }

        const graphID: string | null = this.getAttribute("scene-graph-id");

        // use the scene-graph route if available
        if (graphID) {
            const configAR: SceneGraphAR = new SceneGraphAR(
                {
                    useARBanner: this.getBooleanAttribute("show-ar-banner"),
                    id: graphID,
                    sceneID: sceneID
                });

            return configAR.init();
        }

        const configAR: ConfiguratorAR = new ConfiguratorAR({ state: await this.getConfiguratorState(), useARBanner: this.getBooleanAttribute("show-ar-banner") });

        return configAR.init();
    }

    public get element(): HTMLElement | null {
        return this._element;
    }
}