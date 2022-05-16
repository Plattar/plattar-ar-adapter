export interface LauncherAROptions {
    anchor: "horizontal" | "vertical" | "vto" | "horizontal_vertical"
}

export abstract class LauncherAR {
    private readonly _opt: LauncherAROptions;

    constructor() {
        this._opt = {
            anchor: "horizontal_vertical"
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
    public launch(): Promise<void> {
        return new Promise<void>((accept, reject) => {
            this.init().then((value: LauncherAR) => {
                value.start();

                return accept();
            }).catch(reject);
        });
    }

    /**
     * AR Options used for launching AR
     */
    public get options(): LauncherAROptions {
        return this._opt;
    }
}