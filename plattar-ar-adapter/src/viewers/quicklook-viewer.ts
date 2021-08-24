import ARViewer from "./ar-viewer";

export default class QuicklookViewer extends ARViewer {
    public araction: string | null = null;
    public arcallback: () => void;
    public titleHTML: string;

    constructor() {
        super();
        this.titleHTML = "&checkoutTitle=" + document.title + "&checkoutSubtitle=" + document.title;
        this.arcallback = () => { };
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

        let url: string = this.modelUrl;
        const araction: string | null = this.araction;

        if (araction) {
            const handleQuicklook: (event: any) => void = (event: any) => {
                if (event.data === "_apple_ar_quicklook_button_tapped") {
                    this.arcallback();
                }

                document.body.removeChild(anchor);
                anchor.removeEventListener("message", handleQuicklook, false);
            };

            anchor.addEventListener("message", handleQuicklook, false);
            document.body.appendChild(anchor);

            url += "#callToAction=" + araction;

            if (this.titleHTML) {
                url += this.titleHTML;
            }
        }

        anchor.setAttribute("href", encodeURI(url));
        anchor.click();
    }
}