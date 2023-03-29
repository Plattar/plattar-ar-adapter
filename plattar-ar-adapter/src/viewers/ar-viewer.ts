export type DeviceType = "ios" | "android";
export type NodeType = "Quick Look" | "Reality Viewer" | "Scene Viewer";

export abstract class ARViewer {
    public modelUrl: string | null;

    constructor() {
        this.modelUrl = null;
    }

    public abstract start(): void;
    public abstract get nodeType(): NodeType;
    public abstract get device(): DeviceType;
}