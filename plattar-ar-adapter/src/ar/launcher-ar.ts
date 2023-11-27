import { ARBanner } from "../viewers/ar-viewer";

export interface LauncherAROptions {
    anchor: "horizontal" | "vertical" | "vto" | "horizontal_vertical";
    banner: ARBanner | null;
}

export abstract class LauncherAR {
    private readonly _opt: LauncherAROptions;

    constructor() {
        this._opt = {
            anchor: "horizontal_vertical",
            banner: null
        }
    }

    public abstract init(): Promise<LauncherAR>;
    public abstract start(): void;

    public abstract canQuicklook(): boolean;
    public abstract canRealityViewer(): boolean;
    public abstract canSceneViewer(): boolean;

    /**
     * Initialise and launch with a single function call. this is mostly for convenience.
     * Use .init() and .start() separately for fine-grained control
     */
    public async launch(): Promise<void> {
        const value: LauncherAR = await this.init();

        return value.start();
    }

    /**
     * AR Options used for launching AR
     */
    public get options(): LauncherAROptions {
        return this._opt;
    }
}