import { Server } from "@plattar/plattar-api";
import LauncherAR from "../ar/launcher-ar";

/**
 * This is the primary <plattar-embed /> node that allows easy embedding
 * of Plattar related content
 */
export default class PlattarEmbed extends HTMLElement {

    private _sceneID: string | null;
    private _productID: string | null;
    private _variationID: string | null;
    private _width: string;
    private _height: string;
    private _isReady: boolean;

    constructor() {
        super();

        this._sceneID = null;
        this._productID = null;
        this._variationID = null;
        this._isReady = false;
        this._width = "500px";
        this._height = "500px";
    }

    connectedCallback() {
        const server: string | null = this.hasAttribute("server") ? this.getAttribute("server") : "production";

        Server.create(Server.match(server || "production"));

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
    }

    public initAR(): Promise<LauncherAR> {
        return new Promise<LauncherAR>((accept, reject) => {
            if (!this._isReady) {
                return reject(new Error("PlattarEmbed.initAR() - cannot execute as page has not loaded yet"));
            }
        });
    }

    public startAR(): Promise<void> {
        return new Promise<void>((accept, reject) => {
            if (!this._isReady) {
                return reject(new Error("PlattarEmbed.startAR() - cannot execute as page has not loaded yet"));
            }

            this.initAR().then((launcher: LauncherAR) => {
                launcher.start();
            }).catch(reject);
        });
    }

    public startViewer(): Promise<HTMLElement> {
        return new Promise<HTMLElement>((accept, reject) => {
            if (!this._isReady) {
                return reject(new Error("PlattarEmbed.startViewer() - cannot execute as page has not loaded yet"));
            }
        });
    }

    public startQRCode(): Promise<HTMLElement> {
        return new Promise<HTMLElement>((accept, reject) => {
            if (!this._isReady) {
                return reject(new Error("PlattarEmbed.startQRCode() - cannot execute as page has not loaded yet"));
            }
        });
    }
}