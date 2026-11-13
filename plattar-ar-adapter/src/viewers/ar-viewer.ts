export interface ARBanner {
    readonly title: string;
    readonly subtitle: string;
    readonly button: 'Visit';
}

export abstract class ARViewer {
    public modelUrl: string | null;
    public banner: ARBanner | null;

    // true for face-tracked virtual try-on content (changes the launch prompt wording)
    public isVTO: boolean;

    constructor() {
        this.modelUrl = null;
        this.banner = null;
        this.isVTO = false;
    }

    /**
     * Text for the prompt shown when AR cannot be opened directly from the user's tap
     */
    public get launchPromptText(): { title: string, button: string } {
        return this.isVTO ?
            { title: "Your virtual try-on is ready", button: "Start try-on" } :
            { title: "Your AR view is ready", button: "View in AR" };
    }

    public abstract start(): void;
    public abstract get nodeType(): string;
    public abstract get device(): string;

    public get composedActionURL(): string {
        const link: URL = new URL(location.href);
        link.searchParams.set("plattar_ar_action", "true");
        return encodeURI(link.href);
    }
}