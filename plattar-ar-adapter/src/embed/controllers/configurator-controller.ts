import { LauncherAR } from "../../ar/launcher-ar";
import { PlattarController } from "./plattar-controller";

export class ConfiguratorController extends PlattarController {
    constructor(parent: HTMLElement) {
        super(parent);
    }

    public onAttributesUpdated(): void {
        throw new Error("Method not implemented.");
    }
    public startQRCode(options: any): Promise<HTMLElement> {
        throw new Error("Method not implemented.");
    }
    public startRenderer(): Promise<HTMLElement> {
        throw new Error("Method not implemented.");
    }
    public startAR(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    public initAR(): Promise<LauncherAR> {
        throw new Error("Method not implemented.");
    }
    public get element(): HTMLElement | null {
        throw new Error("Method not implemented.");
    }
}