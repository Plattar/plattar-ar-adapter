import { Analytics } from "../analytics/analytics";

export class RealityViewer {
    public modelUrl: string | null = null;

    constructor() {
        this.modelUrl = null;
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

        Analytics.track({
            device: "ios",
            eventCategory: "Reality Viewer",
            eventAction: "Start Augment"
        });

        Analytics.startRecordEngagement();
    }
}