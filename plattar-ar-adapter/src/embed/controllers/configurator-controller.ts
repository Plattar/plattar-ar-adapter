import { Server } from "@plattar/plattar-api";
import { Configurator } from "@plattar/plattar-services";
import { LauncherAR } from "../../ar/launcher-ar";
import { RawAR } from "../../ar/raw-ar";
import { SceneAR } from "../../ar/scene-ar";
import { SceneProductAR } from "../../ar/scene-product-ar";
import { ConfiguratorState, SceneProductData } from "../../util/configurator-state";
import { Util } from "../../util/util";
import { QRCodeOptions } from "../qrcode/qrcode-controller";
import { PlattarController } from "./plattar-controller";

/**
 * Manages an instance of the <plattar-configurator> HTML Element
 */
export class ConfiguratorController extends PlattarController {

    private _element: HTMLElement | null = null;

    constructor(parent: HTMLElement) {
        super(parent);
    }

    public override getViewerQRCodeURL(options: QRCodeOptions): string {
        const sceneID: string | null = this.getAttribute("scene-id");

        let dst: string = Server.location().base + "renderer/configurator.html?scene_id=" + sceneID;

        // optional attributes
        const configState: string | null = this.getAttribute("config-state");
        const showAR: string | null = this.getAttribute("show-ar");
        const showUI: string | null = this.getAttribute("show-ui");

        if (showUI && showUI === "true") {
            dst = Server.location().base + "configurator/dist/index.html?scene_id=" + sceneID;
        }

        if (configState) {
            dst += "&config_state=" + configState;
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
                // required attributes with defaults for plattar-configurator node
                const width: string = this.getAttribute("width") || "500px";
                const height: string = this.getAttribute("height") || "500px";
                const server: string = this.getAttribute("server") || "production";

                const viewer: HTMLElement = document.createElement("plattar-configurator");
                viewer.style.zIndex = "1";
                viewer.style.display = "block";

                viewer.setAttribute("width", width);
                viewer.setAttribute("height", height);
                viewer.setAttribute("server", server);
                viewer.setAttribute("scene-id", sceneID);

                // optional attributes
                const configState: string | null = this.getAttribute("config-state");
                const showAR: string | null = this.getAttribute("show-ar");
                const showUI: string | null = this.getAttribute("show-ui");

                if (configState) {
                    viewer.setAttribute("config-state", configState);
                }

                if (showAR) {
                    viewer.setAttribute("show-ar", showAR);
                }

                if (showUI) {
                    viewer.setAttribute("show-ui", showUI);
                }

                viewer.onload = () => {
                    return accept(viewer);
                };

                this.append(viewer);

                this._element = viewer;

                return;
            }

            return reject(new Error("ConfiguratorController.startRenderer() - minimum required attributes not set, use scene-id as a minimum"));
        });
    }

    public override initAR(): Promise<LauncherAR> {
        return new Promise<LauncherAR>((accept, reject) => {
            if (!Util.canAugment()) {
                return reject(new Error("ConfiguratorController.initAR() - cannot proceed as AR not available in context"));
            }

            const arMode: string | null = this.getAttribute("ar-mode") || "generated";

            switch (arMode.toLowerCase()) {
                case "inherited":
                    this._InitARInherited(accept, reject);
                    return;
                case "generated":
                default:
                    this._InitARGenerated(accept, reject);
            }
        });
    }

    /**
     * Private Function - This launches the Static/Inherited AR Mode
     */
    private _InitARInherited(accept: (value: LauncherAR | PromiseLike<LauncherAR>) => void, reject: (reason?: any) => void): void {
        const sceneID: string | null = this.getAttribute("scene-id");
        const configState: string | null = this.getAttribute("config-state");

        // use config-state if its available
        if (sceneID && configState) {
            const state: ConfiguratorState = ConfiguratorState.decode(configState);
            const first: SceneProductData | null = state.first();

            if (first) {
                const sceneProductAR: SceneProductAR = new SceneProductAR(first.scene_product_id, first.product_variation_id);

                sceneProductAR.init().then(accept).catch(reject);

                return;
            }

            return reject(new Error("ConfiguratorController.initAR() - invalid config-state does not have any product states"));
        }

        // otherwise fallback to using scene
        if (sceneID) {
            ConfiguratorState.decodeScene(sceneID).then((state: ConfiguratorState) => {
                const first: SceneProductData | null = state.first();

                if (first) {
                    const sceneProductAR: SceneProductAR = new SceneProductAR(first.scene_product_id, first.product_variation_id);

                    return sceneProductAR.init().then(accept).catch(reject);
                }

                return reject(new Error("ConfiguratorController.initAR() - invalid Scene does not have any product states"));
            }).catch(reject);

            return;
        }

        return reject(new Error("ConfiguratorController.initAR() - minimum required attributes not set, use scene-id as a minimum"));
    }

    /**
     * Private Function - This launches the Dynamic/Generated AR Mode
     */
    private _InitARGenerated(accept: (value: LauncherAR | PromiseLike<LauncherAR>) => void, reject: (reason?: any) => void): void {
        // if scene ID is available and the state is a configurator viewer
        // we can use the real-time configurator state to launch the AR view
        const viewer: HTMLElement | null = this.element;
        const sceneID: string | null = this.getAttribute("scene-id");

        if (viewer && sceneID && (<any>viewer).messenger) {
            let output: string = "glb";

            if (Util.isSafari() || Util.isChromeOnIOS()) {
                output = "usdz";
            }

            (<any>viewer).messenger.getARFile(output).then((result: any) => {
                const rawAR: RawAR = new RawAR(result.filename, sceneID);

                return rawAR.init().then(accept).catch(reject);
            }).catch(reject);

            return;
        }

        const configState: string | null = this.getAttribute("config-state");

        // otherwise scene ID is available to the viewer is not launched
        // we can use the static configuration state to launch the AR view
        if (sceneID && configState) {
            const state: ConfiguratorState = ConfiguratorState.decode(configState);

            if (state.length > 0) {
                const server: string = this.getAttribute("server") || "production";

                const configurator: Configurator = new Configurator();
                configurator.server = <any>server;

                if (Util.isSafari() || Util.isChromeOnIOS()) {
                    configurator.output = "usdz";
                }

                if (Util.canSceneViewer()) {
                    configurator.output = "glb";
                }

                state.forEach((productState: SceneProductData) => {
                    if (productState.meta_data.augment === true) {
                        configurator.addSceneProduct(productState.scene_product_id, productState.product_variation_id);
                    }
                });

                configurator.get().then((result: any) => {
                    const rawAR: RawAR = new RawAR(result.filename, sceneID);

                    rawAR.init().then(accept).catch(reject);
                }).catch(reject);

                return;
            }

            return reject(new Error("ConfiguratorController.initAR() - invalid config-state does not have any product states"));
        }

        // otherwise no config-state or viewer is active
        // fallback to using default SceneAR implementation
        if (sceneID) {
            const sceneAR: SceneAR = new SceneAR(sceneID);

            sceneAR.init().then(accept).catch(reject);

            return;
        }

        return reject(new Error("ConfiguratorController.initAR() - minimum required attributes not set, use scene-id as a minimum"));
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