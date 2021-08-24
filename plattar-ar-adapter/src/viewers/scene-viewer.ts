import ARViewer from "./ar-viewer";

export default class SceneViewer extends ARViewer {
    public araction: string | null = null;
    public titleHTML: string;
    public isVertical: boolean = false;

    constructor() {
        super();
        this.titleHTML = "<b>" + document.title;
        this.isVertical = false;
    }

    public start(): void {
        if (!this.modelUrl) {
            throw new Error("SceneViewer.start() - model url not set, use SceneViewer.modelUrl");
        }

        const araction: string | null = this.araction;

        let composedLink: string | null = null;

        if (araction) {
            const link: URL = new URL(location.href);
            link.searchParams.set("araction", araction);
            composedLink = encodeURIComponent(link.href);
        }

        if (!composedLink) {
            throw new Error("SceneViewer.start() - failed to create composition link, check parameters");
        }

        const linkOverride: string = encodeURIComponent(location.href + '#no-ar-fallback');

        let intent: string = 'intent://arvr.google.com/scene-viewer/1.1';
        intent += '?file=' + this.modelUrl;
        intent += '&mode=ar_preferred';
        intent += '&link=' + composedLink;
        intent += '&title=<b>' + this.titleHTML;

        if (this.isVertical) {
            intent += '&enable_vertical_placement=true';
        }

        intent += ' #Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;';
        intent += 'S.browser_fallback_url=' + linkOverride + ';end;';

        const anchor: HTMLAnchorElement = document.createElement("a");
        anchor.setAttribute("href", intent);
        anchor.click();
    }
}