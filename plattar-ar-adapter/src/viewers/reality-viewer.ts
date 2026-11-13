import { ARViewer } from "./ar-viewer";
import { ARLaunchGate } from "./ar-launch-gate";

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

        ARLaunchGate.launch(() => this._launch(), this.launchPromptText);
    }

    private _launch(): void {
        if (!this.modelUrl) {
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
