import { Server } from "@plattar/plattar-api";
import { ProductAR } from "../ar/product-ar";
import { LauncherAR } from "../ar/launcher-ar";

/**
 * This tracks the current state of the Embed
 */
enum EmbedState {
    None,
    SceneViewer,
    ProductViewer,
    ProductAR,
    QRCode
}

/**
 * This is the primary <plattar-embed /> node that allows easy embedding
 * of Plattar related content
 */
export default class PlattarEmbed extends HTMLElement {

    // this is the current state of the embed, none by default
    private _currentState: EmbedState = EmbedState.None;
    private _qrCodeOptions: any = {
        color: "#101721",
        qrType: "default",
        margin: 0
    };

    private _sceneID: string | null;
    private _productID: string | null;
    private _variationID: string | null;
    private _width: string;
    private _height: string;
    private _isReady: boolean;
    private _server: string;
    private _viewer: HTMLElement | null;

    constructor() {
        super();

        this._sceneID = null;
        this._productID = null;
        this._variationID = null;
        this._isReady = false;
        this._width = "500px";
        this._height = "500px";
        this._server = "production";
        this._viewer = null;
    }

    public get viewer(): HTMLElement | null {
        return this._viewer;
    }

    connectedCallback() {
        const observer: MutationObserver = new MutationObserver((mutations: MutationRecord[]) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "attributes") {
                    const sceneID: string | null = this.hasAttribute("scene-id") ? this.getAttribute("scene-id") : null;
                    const productID: string | null = this.hasAttribute("product-id") ? this.getAttribute("product-id") : null;
                    const variationID: string | null = this.hasAttribute("variation-id") ? this.getAttribute("variation-id") : null;

                    let updated: boolean = false;

                    if (sceneID !== this._sceneID) {
                        this._sceneID = sceneID;

                        updated = true;
                    }

                    if (productID !== this._productID) {
                        this._productID = productID;

                        updated = true;
                    }

                    if (variationID !== this._variationID) {
                        this._variationID = variationID;

                        updated = true;
                    }

                    if (updated) {
                        // re-render based on internal state
                        this._OnAttributesUpdated();
                    }
                }
            });
        });

        observer.observe(this, {
            attributes: true
        });

        const server: string | null = this.hasAttribute("server") ? this.getAttribute("server") : "production";

        Server.create(Server.match(server || "production"));

        if (server) {
            this._server = server;
        }

        this._sceneID = this.hasAttribute("scene-id") ? this.getAttribute("scene-id") : null;
        this._productID = this.hasAttribute("product-id") ? this.getAttribute("product-id") : null;
        this._variationID = this.hasAttribute("variation-id") ? this.getAttribute("variation-id") : null;
        const width: string | null = this.hasAttribute("width") ? this.getAttribute("width") : "500px";
        const height: string | null = this.hasAttribute("height") ? this.getAttribute("height") : "500px";

        if (width) {
            this._width = width;
        }

        if (height) {
            this._height = height;
        }

        this._isReady = true;

        const init: string | null = this.hasAttribute("init") ? this.getAttribute("init") : null;

        if (init === "ar") {
            this.startAR();
        }
        else if (init === "viewer") {
            this.startViewer();
        }
        else if (init === "qrcode") {
            this.startQRCode();
        }
        else if (init === "ar-fallback-qrcode") {
            this.startAR().then(() => {
                // nothing to do, launched successfully
            }).catch((_err) => {
                this.startQRCode();
            });
        }
        else if (init === "ar-fallback-viewer") {
            this.startAR().then(() => {
                // nothing to do, launched successfully
            }).catch((_err) => {
                this.startViewer();
            });
        }
    }

    public initAR(): Promise<LauncherAR> {
        return new Promise<LauncherAR>((accept, reject) => {
            if (!this._isReady) {
                return reject(new Error("PlattarEmbed.initAR() - cannot execute as page has not loaded yet"));
            }

            // if scene is not set but product is, then use ProductAR
            if (!this._sceneID && this._productID) {
                const product = new ProductAR(this._productID, this._variationID);

                return product.init().then(accept).catch(reject);
            }

            // If Product is set (under any scenario) then use ProductAR
            // NOTE: At some point this should check for Scenes when SceneAR
            // is implemented
            if (this._productID) {
                const product = new ProductAR(this._productID, this._variationID);

                return product.init().then(accept).catch(reject);
            }

            // otherwise, scene was set so use SceneAR
            if (this._sceneID) {
                return reject(new Error("PlattarEmbed.initAR() - scene-id not yet supported"));
            }

            return reject(new Error("PlattarEmbed.initAR() - minimum required attributes not set, use scene-id or product-id as a minimum"));
        });
    }

    public startAR(): Promise<void> {
        return new Promise<void>((accept, reject) => {
            if (!this._isReady) {
                return reject(new Error("PlattarEmbed.startAR() - cannot execute as page has not loaded yet"));
            }

            this.initAR().then((launcher: LauncherAR) => {
                launcher.start();

                accept();
            }).catch(reject);
        });
    }

    public startViewer(): Promise<HTMLElement> {
        return new Promise<HTMLElement>((accept, reject) => {
            if (!this._isReady) {
                return reject(new Error("PlattarEmbed.startViewer() - cannot execute as page has not loaded yet"));
            }

            if (this._viewer) {
                this._viewer.remove();
                this._viewer = null;
            }

            // if scene is set, we use <plattar-viewer /> node from plattar-web
            if (this._sceneID) {
                const viewer: HTMLElement = document.createElement("plattar-viewer");

                viewer.setAttribute("width", this._width);
                viewer.setAttribute("height", this._height);
                viewer.setAttribute("server", this._server);
                viewer.setAttribute("scene-id", this._sceneID);

                if (this._productID) {
                    viewer.setAttribute("product-id", this._productID);
                }

                if (this._variationID) {
                    viewer.setAttribute("variation-id", this._variationID);
                }

                viewer.onload = () => {
                    return accept(viewer);
                };

                const shadow = this.shadowRoot || this.attachShadow({ mode: 'open' });
                shadow.append(viewer);

                this._viewer = viewer;

                return;
            }

            // if product is set, we use <plattar-product /> node from plattar-web
            if (this._productID) {
                const viewer: HTMLElement = document.createElement("plattar-product");

                viewer.setAttribute("width", this._width);
                viewer.setAttribute("height", this._height);
                viewer.setAttribute("server", this._server);
                viewer.setAttribute("product-id", this._productID);

                if (this._variationID) {
                    viewer.setAttribute("variation-id", this._variationID);
                }

                viewer.onload = () => {
                    return accept(viewer);
                };

                const shadow = this.shadowRoot || this.attachShadow({ mode: 'open' });
                shadow.append(viewer);

                this._viewer = viewer;

                return;
            }

            return reject(new Error("PlattarEmbed.startViewer() - minimum required attributes not set, use scene-id or product-id as a minimum"));
        });
    }

    public startQRCode(options: any | undefined | null = null): Promise<HTMLElement> {
        return new Promise<HTMLElement>((accept, reject) => {
            if (!this._isReady) {
                return reject(new Error("PlattarEmbed.startQRCode() - cannot execute as page has not loaded yet"));
            }

            const opt: any = options || this._qrCodeOptions;

            // reset instance for later use
            this._qrCodeOptions = opt;

            if (this._viewer) {
                this._viewer.remove();
                this._viewer = null;
            }

            // if scene is set, we embed a QR code that takes us to viewer.html
            if (this._sceneID) {
                const viewer: HTMLElement = document.createElement("plattar-qrcode");

                viewer.setAttribute("width", this._width);
                viewer.setAttribute("height", this._height);

                if (opt.color) {
                    viewer.setAttribute("color", opt.color);
                }

                if (opt.margin) {
                    viewer.setAttribute("margin", "" + opt.margin);
                }

                if (opt.qrType) {
                    viewer.setAttribute("qr-type", opt.qrType);
                }

                let dst: string = Server.location().base + "renderer/viewer.html?scene_id=" + this._sceneID;

                if (this._productID) {
                    dst += "&productId=" + this._productID;
                }

                if (this._variationID) {
                    dst += "&variationId=" + this._variationID;
                }

                viewer.setAttribute("url", dst);

                viewer.onload = () => {
                    return accept(viewer);
                };

                const shadow = this.shadowRoot || this.attachShadow({ mode: 'open' });
                shadow.append(viewer);

                this._viewer = viewer;

                return;
            }

            // if product is set, we embed a QR code that takes us to product.html
            if (this._productID) {
                const viewer: HTMLElement = document.createElement("plattar-qrcode");

                viewer.setAttribute("width", this._width);
                viewer.setAttribute("height", this._height);

                if (opt.color) {
                    viewer.setAttribute("color", opt.color);
                }

                if (opt.margin) {
                    viewer.setAttribute("margin", "" + opt.margin);
                }

                if (opt.qrType) {
                    viewer.setAttribute("qr-type", opt.qrType);
                }

                let dst: string = Server.location().base + "renderer/product.html?product_id=" + this._productID;

                if (this._variationID) {
                    dst += "&variation_id=" + this._variationID;
                }

                viewer.setAttribute("url", dst);

                viewer.onload = () => {
                    return accept(viewer);
                };

                const shadow = this.shadowRoot || this.attachShadow({ mode: 'open' });
                shadow.append(viewer);

                this._viewer = viewer;

                return;
            }

            return reject(new Error("PlattarEmbed.startQRCode() - minimum required attributes not set, use scene-id or product-id as a minimum"));
        });
    }

    /**
     * This is called by the observer if any of the embed attributes have changed
     * based on the state of the embed, we update the internal structure accordingly
     */
    private _OnAttributesUpdated(): void {
        // nothing to update in these scenarios
        if (this._currentState === EmbedState.None || this._currentState === EmbedState.ProductAR) {
            return;
        }

        // re-render the QR Code when attributes have changed
        if (this._currentState === EmbedState.QRCode) {
            this.startQRCode(this._qrCodeOptions);

            return;
        }

        // use the messenger function to change variation when attributes have changed
        if (this._currentState === EmbedState.SceneViewer) {
            const viewer: any | null = this.viewer;

            if (viewer) {
                viewer.messenger.selectVariation(this._productID, this._variationID);
            }

            return;
        }

        if (this._currentState === EmbedState.ProductViewer) {
            const viewer: any | null = this.viewer;

            if (viewer) {
                viewer.messenger.selectVariation(this._variationID);
            }

            return;
        }
    }
}