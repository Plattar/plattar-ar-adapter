import ARViewer from "./ar-viewer";

export default class RealityViewer extends ARViewer {
    constructor() {
        super();
    }

    public start(): void {
        if (!this.modelUrl) {
            throw new Error("RealityViewer.start() - model url not set, use RealityViewer.modelUrl");
        }

        const anchor: HTMLAnchorElement = document.createElement("a");
        anchor.setAttribute("rel", "ar");
        anchor.appendChild(document.createElement("img"));

        anchor.setAttribute("href", this.modelUrl);
        anchor.click();
    }
}