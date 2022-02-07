export abstract class LauncherAR {
    constructor() { }
    public abstract init(): Promise<LauncherAR>;
    public abstract launch(): Promise<void>;
    public abstract start(): void;

    public abstract canQuicklook(): boolean;
    public abstract canRealityViewer(): boolean;
    public abstract canSceneViewer(): boolean;
}