import { PlattarController } from "../controllers/plattar-controller";

export interface QRCodeOptions {
    readonly color: string;
    readonly qrType: string;
    readonly shorten: string | boolean;
    readonly margin: number;
    readonly url: string | null;
}

export class QRCodeController {
    private readonly _owner: PlattarController;
    private readonly _element: HTMLElement;

    private _prevOptions: QRCodeOptions;
    private _isVisible: boolean;
    private _url: string | null;

    public constructor(owner: PlattarController) {
        this._owner = owner;
        this._element = document.createElement("plattar-qrcode");

        this._prevOptions = this.getDefaultOptions();
        this._isVisible = false;
        this._url = null;

        this._element.style.display = "none";
        this._element.style.position = "absolute";
        this._element.style.zIndex = "2";
        this._owner.append(this._element);
    }

    public onAttributesUpdated(): void {
        // re-render the QR Code when attributes have changed
        if (this._isVisible) {
            this.refresh(this._prevOptions);
        }
    }

    public set url(value: string | null) {
        this._url = value;
    }

    public get url(): string | null {
        return this._url ? this._url : null;
    }

    /**
     * Default QR Code rendering options
     */
    public getDefaultOptions(): QRCodeOptions {
        return {
            color: this._owner.getAttribute("qr-color") || "#101721",
            qrType: this._owner.getAttribute("qr-style") || "default",
            shorten: this._owner.getAttribute("qr-shorten") === "false" ? false : true,
            margin: 0,
            url: null
        }
    }

    public set options(value: any) {
        this._prevOptions = value || this.options;
    }

    public get options(): QRCodeOptions {
        return this._prevOptions;
    }

    public get optionsBase64(): string {
        return btoa(JSON.stringify(this.options));
    }

    public get visible(): boolean {
        return this._isVisible;
    }

    public show(options: QRCodeOptions | null = null): boolean {
        const result: boolean = this.refresh(options);

        if (result) {
            if (!this._isVisible) {
                this._isVisible = true;

                this._element.style.display = "block";
            }

            return true;
        }

        return false;
    }

    public hide(): boolean {
        if (this._isVisible) {
            this._element.style.display = "none";

            this._isVisible = false;

            return true;
        }

        return false;
    }

    public refresh(options: QRCodeOptions | null = null): boolean {
        const opt: QRCodeOptions = options || this.options || this.getDefaultOptions();
        this.options = opt;

        const viewer: HTMLElement = this._element;

        // required attributes with defaults for plattar-viewer node
        const width: string = this._owner.getAttribute("width") || "500px";
        const height: string = this._owner.getAttribute("height") || "500px";
        const url: string | null = opt.url || this._url;

        if (!url) {
            return false;
        }

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
        viewer.setAttribute("url", url);

        return true;
    }
}