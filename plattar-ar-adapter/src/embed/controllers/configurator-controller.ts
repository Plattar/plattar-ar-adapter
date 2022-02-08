import { Server } from "@plattar/plattar-api";
import { Configurator } from "@plattar/plattar-services";
import { LauncherAR } from "../../ar/launcher-ar";
import { RawAR } from "../../ar/raw-ar";
import { Util } from "../../util/util";
import { ControllerState, PlattarController } from "./plattar-controller";

/**
 * Manages an instance of the <plattar-configurator> HTML Element
 */
export class ConfiguratorController extends PlattarController {

    private _state: ControllerState = ControllerState.None;
    private _element: HTMLElement | null = null;
    private _prevQROpt: any = null;

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
    }

    public startQRCode(options: any): Promise<HTMLElement> {
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

                let dst: string = Server.location().base + "renderer/configurator.html?scene_id=" + sceneID;

                // optional attributes
                const configState: string | null = this.getAttribute("config-state");
                const showAR: string | null = this.getAttribute("show-ar");

                if (configState) {
                    dst += "&config_state=" + configState;
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

            return reject(new Error("ConfiguratorController.startQRCode() - minimum required attributes not set, use scene-id as a minimum"));
        });
    }

    public startRenderer(): Promise<HTMLElement> {
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

                viewer.setAttribute("width", width);
                viewer.setAttribute("height", height);
                viewer.setAttribute("server", server);
                viewer.setAttribute("scene-id", sceneID);

                // optional attributes
                const configState: string | null = this.getAttribute("config-state");
                const showAR: string | null = this.getAttribute("show-ar");

                if (configState) {
                    viewer.setAttribute("config-state", configState);
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

            return reject(new Error("ConfiguratorController.startRenderer() - minimum required attributes not set, use scene-id as a minimum"));
        });
    }

    public initAR(): Promise<LauncherAR> {
        return new Promise<LauncherAR>((accept, reject) => {
            if (!Util.canAugment()) {
                return reject(new Error("ConfiguratorController.initAR() - cannot proceed as AR not available in context"));
            }

            // if scene ID is available and the state is a configurator viewer
            // we can use the real-time configurator state to launch the AR view
            const viewer: HTMLElement | null = this.element;
            const sceneID: string | null = this.getAttribute("scene-id");

            if (viewer && sceneID) {
                let output: string = "glb";

                if (Util.isSafari() || Util.isChromeOnIOS()) {
                    output = "usdz";
                }

                return (<any>viewer).messenger.getARFile(output).then((result: any) => {
                    const rawAR: RawAR = new RawAR(result.filename);

                    return rawAR.init().then(accept).catch(reject);
                }).catch(reject);
            }

            const configState: string | null = this.getAttribute("config-state");

            // otherwise scene ID is available to the viewer is not launched
            // we can use the static configuration state to launch the AR view
            if (sceneID && configState) {
                try {
                    const decodedb64State: string = atob(configState);
                    const state: any = JSON.parse(decodedb64State);

                    if (state.meta) {
                        const sceneProductIndex: number = state.meta.scene_product_index || 0;
                        const variationIndex: number = state.meta.product_variation_index || 1;

                        const states: Array<Array<string>> = state.states || [];

                        if (states.length > 0) {
                            const configurator: Configurator = new Configurator();

                            states.forEach((productState: Array<string>) => {
                                configurator.addSceneProduct(productState[sceneProductIndex], productState[variationIndex]);
                            });

                            if (Util.isSafari() || Util.isChromeOnIOS()) {
                                configurator.output = "usdz";
                            }

                            if (Util.canSceneViewer()) {
                                configurator.output = "glb";
                            }

                            const server: string = this.getAttribute("server") || "production";

                            configurator.server = <any>server;

                            return configurator.get().then((result: any) => {
                                const rawAR: RawAR = new RawAR(result.filename);

                                rawAR.init().then(accept).catch(reject);
                            }).catch(reject);
                        }

                        return reject(new Error("ConfiguratorController.initAR() - invalid config-state does not have any product states"));
                    }

                    return reject(new Error("ConfiguratorController.initAR() - invalid config-state for configurator"));
                }
                catch (err) {
                    return reject(err);
                }
            }

            return reject(new Error("ConfiguratorController.initAR() - minimum required attributes not set, use scene-id as a minimum"));
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