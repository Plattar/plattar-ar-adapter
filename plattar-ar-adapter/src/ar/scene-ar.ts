import { LauncherAR } from "./launcher-ar";

/**
 * Performs AR functionality related to Plattar Scenes
 */
export class SceneAR extends LauncherAR {
    public init(): Promise<LauncherAR> {
        throw new Error("Method not implemented.");
    }
    public launch(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    public start(): void {
        throw new Error("Method not implemented.");
    }

    public canQuicklook(): boolean {
        throw new Error("Method not implemented.");
    }
    public canRealityViewer(): boolean {
        throw new Error("Method not implemented.");
    }
    public canSceneViewer(): boolean {
        throw new Error("Method not implemented.");
    }
}