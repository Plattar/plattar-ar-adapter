import { ARBanner, ARViewer } from "./ar-viewer";

export default class QuicklookViewer extends ARViewer {
    constructor() {
        super();
    }

    public get nodeType(): string {
        return "Quick Look";
    }

    public get device(): string {
        return "ios";
    }

    public start(): void {
        if (!this.modelUrl) {
            throw new Error("QuicklookViewer.start() - model url not set, use QuicklookViewer.modelUrl");
        }

        const anchor: HTMLAnchorElement = document.createElement("a");
        anchor.setAttribute("rel", "ar");
        anchor.appendChild(document.createElement("img"));

        const banner: ARBanner | null = this.banner;
        let url: string = this.modelUrl;

        if (banner) {
            url += `#callToAction=${banner.button}`;
            url += `?checkoutTitle=${banner.title}`;
            url += `?checkoutSubtitle=${banner.subtitle}`;

            const handleQuicklook: (event: any) => void = (event: any) => {
                if (event.data === "_apple_ar_quicklook_button_tapped") {
                    window.location.assign(this.composedActionURL);
                }
            }

            anchor.addEventListener("message", handleQuicklook, false);
        }

        document.body.appendChild(anchor);
        anchor.setAttribute("href", encodeURI(url));
        anchor.click();
    }
}