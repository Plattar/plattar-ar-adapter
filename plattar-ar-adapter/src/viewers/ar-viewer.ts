export default abstract class ARViewer {
    public modelUrl: string | null = null;

    constructor() {
        this.modelUrl = null;
    }

    public abstract start(): void;
    public abstract get nodeType(): string;
    public abstract get device(): string;
}