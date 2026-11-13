import { ARViewer } from "./ar-viewer";

export default class RealityViewer extends ARViewer {
    constructor() {
        super();
    }

    public get nodeType(): string {
        return "Reality Viewer";
    }

    public get device(): string {
        return "ios";
    }

    public start(): void {
        if (!this.modelUrl) {
            throw new Error("RealityViewer.start() - model url not set, use RealityViewer.modelUrl");
        }

        // Shopify storefronts with the exit-interstitial script: open AR from a hidden iframe (see ARViewer)
        if (ARViewer.openARLinkOutsideLinkInterceptor(this.modelUrl)) {
            return;
        }

        const anchor: HTMLAnchorElement = document.createElement("a");
        anchor.setAttribute("rel", "ar");
        anchor.setAttribute("allowsContentScaling", "0");
        anchor.appendChild(document.createElement("img"));

        anchor.setAttribute("href", this.modelUrl);
        anchor.click();
    }
}