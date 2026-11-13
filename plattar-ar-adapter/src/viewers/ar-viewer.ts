export interface ARBanner {
    readonly title: string;
    readonly subtitle: string;
    readonly button: 'Visit';
}

export abstract class ARViewer {
    public modelUrl: string | null;
    public banner: ARBanner | null;

    constructor() {
        this.modelUrl = null;
        this.banner = null;
    }

    public abstract start(): void;
    public abstract get nodeType(): string;
    public abstract get device(): string;

    public get composedActionURL(): string {
        const link: URL = new URL(location.href);
        link.searchParams.set("plattar_ar_action", "true");
        return encodeURI(link.href);
    }

    /**
     * Shopify storefronts can load an "exit interstitial" script that reroutes every scripted click on an
     * external http(s) link through the store's /url "Leaving <store>" page. An iOS AR link (<a rel="ar">)
     * to the Plattar CDN then becomes a plain page visit to the .usdz/.reality file, so Safari shows the
     * file preview page instead of opening AR. The script only runs in the top window, so on those pages
     * the AR link is opened from inside a hidden blank iframe instead.
     *
     * Returns true when the AR link was opened this way. Returns false when the page doesn't have the
     * script (or anything goes wrong), and the caller then opens the link exactly as before.
     */
    protected static openARLinkOutsideLinkInterceptor(href: string, onMessage: ((event: any) => void) | null = null): boolean {
        if (!ARViewer.hasShopifyExitInterstitial()) {
            return false;
        }

        let frame: HTMLIFrameElement | null = null;

        try {
            const previous: HTMLElement | null = document.getElementById(AR_LINK_FRAME_ID);

            if (previous && previous.parentNode) {
                previous.parentNode.removeChild(previous);
            }

            frame = document.createElement("iframe");
            frame.id = AR_LINK_FRAME_ID;
            frame.setAttribute("aria-hidden", "true");
            frame.setAttribute("tabindex", "-1");
            frame.style.cssText = "position:absolute;width:0;height:0;border:0;visibility:hidden;";

            document.body.appendChild(frame);

            const doc: Document | null = frame.contentDocument;

            if (!doc || !doc.body) {
                frame.parentNode?.removeChild(frame);
                return false;
            }

            const anchor: HTMLAnchorElement = doc.createElement("a");
            anchor.setAttribute("rel", "ar");
            anchor.setAttribute("allowsContentScaling", "0");
            anchor.appendChild(doc.createElement("img"));

            if (onMessage) {
                anchor.addEventListener("message", onMessage, false);
            }

            doc.body.appendChild(anchor);
            anchor.setAttribute("href", href);
            anchor.click();

            return true;
        }
        catch (_err) {
            frame?.parentNode?.removeChild(frame);
            return false;
        }
    }

    /**
     * True when Shopify's exit-interstitial (external link rerouting) script is on the page
     */
    public static hasShopifyExitInterstitial(): boolean {
        try {
            return document.querySelector('script[data-source-attribution="shopify.exit_interstitial"]') !== null;
        }
        catch (_err) {
            return false;
        }
    }
}

const AR_LINK_FRAME_ID: string = "plattar-ar-link-frame";