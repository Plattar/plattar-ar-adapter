export default abstract class LauncherAR {
    constructor() { }
    public abstract init(): Promise<LauncherAR>;
    public abstract launch(): Promise<void>;
    public abstract start(): void;
}