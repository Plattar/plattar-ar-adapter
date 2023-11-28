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
}