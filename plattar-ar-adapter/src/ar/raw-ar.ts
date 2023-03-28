import { Analytics } from "@plattar/plattar-analytics";
import { Project, Scene, Server } from "@plattar/plattar-api";
import { Util } from "../util/util";
import { ARViewer } from "../viewers/ar-viewer";
import QuicklookViewer from "../viewers/quicklook-viewer";
import RealityViewer from "../viewers/reality-viewer";
import SceneViewer from "../viewers/scene-viewer";
import { LauncherAR } from "./launcher-ar";

/**
 * Allows launching AR Experiences provided a single remote 3D Model file
 */
export class RawAR extends LauncherAR {
    // model location
    private readonly _modelLocation: string;
    private readonly _sceneID: string | null;

    // this thing controls the actual AR view
    // this is setup via .init() function
    private _ar: ARViewer | null;

    // analytics instance
    private _analytics: Analytics | null = null;

    constructor(modelLocation: string | undefined | null = null, sceneID: string | undefined | null = null) {
        super();

        if (!modelLocation) {
            throw new Error("RawAR.constructor(modelLocation) - modelLocation must be defined");
        }

        const lowerLoc: string = modelLocation.toLowerCase();

        if (lowerLoc.endsWith("usdz") || lowerLoc.endsWith("glb") || lowerLoc.endsWith("gltf") || lowerLoc.endsWith("reality")) {
            this._modelLocation = modelLocation;
            this._sceneID = sceneID;
            this._ar = null;
        }
        else {
            throw new Error("RawAR.constructor(modelLocation) - modelLocation must be one of gltf, glb, usdz or reality");
        }
    }

    public get modelLocation(): string {
        return this._modelLocation;
    }

    private _SetupAnalytics(): Promise<void> {
        return new Promise<void>((accept, _reject) => {
            const sceneID: string | null = this._sceneID;

            if (!sceneID) {
                return accept();
            }

            const scene: Scene = new Scene(sceneID);
            scene.include(Project);

            scene.get().then((scene: Scene) => {
                const analytics: Analytics = new Analytics(scene.attributes.application_id);
                analytics.origin = <any>Server.location().type;

                this._analytics = analytics;

                analytics.data.push("type", "scene-ar");
                analytics.data.push("sceneId", scene.id);
                analytics.data.push("sceneTitle", scene.attributes.title);

                const application: Project | undefined = scene.relationships.find(Project);

                // setup application stuff (if any)
                if (application) {
                    analytics.data.push("applicationId", application.id);
                    analytics.data.push("applicationTitle", application.attributes.title);
                }

                accept();
            }).catch((_err) => {
                accept();
            });
        });
    }

    /**
     * Initialise the RawAR instance. This returns a Promise that resolves
     * successfully if initialisation is successful, otherwise it will fail.
     * 
     * filure can occur for a number of reasons but it generally means that AR
     * cannot be performed.
     */
    public init(): Promise<LauncherAR> {
        return new Promise<LauncherAR>((accept, reject) => {
            if (!Util.canAugment()) {
                return reject(new Error("RawAR.init() - cannot proceed as AR not available in context"));
            }

            // send the analytics (if any)
            this._SetupAnalytics().then(() => {
                const modelLocation: string = this._modelLocation;
                const lowerLoc = modelLocation.toLowerCase();

                // we need to define our AR module here
                // we are in Safari/Quicklook mode here
                if (Util.isSafari() || Util.isChromeOnIOS()) {
                    // load the reality experience if dealing with reality file
                    if (lowerLoc.endsWith("reality") && Util.canRealityViewer()) {
                        this._ar = new RealityViewer();
                        this._ar.modelUrl = modelLocation;

                        return accept(this);
                    }

                    // load the usdz experience if dealing with usdz file
                    if (lowerLoc.endsWith("usdz") && Util.canQuicklook()) {
                        this._ar = new QuicklookViewer();
                        this._ar.modelUrl = modelLocation;

                        return accept(this);
                    }

                    return reject(new Error("RawAR.init() - cannot proceed as model is not a .usdz or .reality file"));
                }

                // check android
                if (Util.canSceneViewer()) {
                    if (lowerLoc.endsWith("glb") || lowerLoc.endsWith("gltf")) {
                        const arviewer = new SceneViewer();
                        arviewer.modelUrl = modelLocation;
                        arviewer.isVertical = this.options.anchor === "vertical" ? true : false;
                        this._ar = arviewer;

                        return accept(this);
                    }

                    return reject(new Error("RawAR.init() - cannot proceed as model is not a .glb or .gltf file"));
                }

                // otherwise, we didn't have AR available - it should never really reach this stage as this should be caught
                // earlier in the process
                return reject(new Error("RawAR.init() - could not initialise AR correctly, check values"));
            });
        });
    }

    /**
     * Launches the internal AR instance using an appropriate version of AR Viewers
     */
    public start(): void {
        if (!this._ar) {
            throw new Error("RawAR.start() - cannot proceed as AR instance is null");
        }

        const analytics: Analytics | null = this._analytics;

        if (analytics) {
            analytics.data.push("device", this._ar.device);
            analytics.data.push("eventCategory", this._ar.nodeType);
            analytics.data.push("eventAction", "Start Scene Augment");

            analytics.write();

            analytics.startRecordEngagement();
        }

        // this was initialised via the init() function
        this._ar.start();
    }

    public canQuicklook(): boolean {
        return this._ar && this._ar.nodeType === "Quick Look" ? true : false;
    }

    public canRealityViewer(): boolean {
        return this._ar && this._ar.nodeType === "Reality Viewer" ? true : false;
    }

    public canSceneViewer(): boolean {
        return this._ar && this._ar.nodeType === "Scene Viewer" ? true : false;
    }
}