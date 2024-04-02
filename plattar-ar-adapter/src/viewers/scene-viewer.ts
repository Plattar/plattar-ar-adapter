import { ARBanner, ARViewer } from "./ar-viewer";

export default class SceneViewer extends ARViewer {
    public isVertical: boolean = false;

    constructor() {
        super();
        this.isVertical = false;
    }

    public get nodeType(): string {
        return "Scene Viewer";
    }

    public get device(): string {
        return "android";
    }

    public start(): void {
        if (!this.modelUrl) {
            throw new Error("SceneViewer.start() - model url not set, use SceneViewer.modelUrl");
        }

        const linkOverride: string = encodeURIComponent(`${location.href}#no-ar-fallback`);

        let intent: string = `intent://arvr.google.com/scene-viewer/1.1?file=${this.modelUrl}&mode=ar_preferred`;

        const banner: ARBanner | null = this.banner;

        if (banner) {
            intent += `&title=<b>${banner.title}</b><br>${banner.subtitle}`;
            intent += `&link=${this.composedActionURL}`;
        }

        if (this.isVertical) {
            intent += '&enable_vertical_placement=true';
        }

        intent += '&a=b#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;';
        intent += `S.browser_fallback_url=${linkOverride};end;`;

        const anchor: HTMLAnchorElement = document.createElement("a");
        anchor.setAttribute("href", intent);
        anchor.click();
    }
}