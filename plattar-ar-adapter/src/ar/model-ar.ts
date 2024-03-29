import { FileModel, Project, Server } from "@plattar/plattar-api";
import { Analytics } from "@plattar/plattar-analytics";
import { Util } from "../util/util";
import { ARViewer } from "../viewers/ar-viewer";
import QuicklookViewer from "../viewers/quicklook-viewer";
import RealityViewer from "../viewers/reality-viewer";
import SceneViewer from "../viewers/scene-viewer";
import { LauncherAR } from "./launcher-ar";
import version from "../version";

export interface ModelAROptions {
    readonly modelID: string;
    readonly useARBanner: boolean;
}

/**
 * Performs AT Functionality using Plattar FileModel types
 */
export class ModelAR extends LauncherAR {

    // analytics instance
    private _analytics: Analytics | null = null;

    // model ID
    private readonly _options: ModelAROptions;

    // this thing controls the actual AR view
    // this is setup via .init() function
    private _ar: ARViewer | null;

    constructor(options: ModelAROptions) {
        super();

        if (!options.modelID) {
            throw new Error("ModelAR.constructor(modelID) - modelID must be defined");
        }

        this._options = options;
        this._ar = null;
    }

    public get modelID(): string {
        return this._options.modelID;
    }

    private _SetupAnalytics(model: FileModel): void {
        let analytics: Analytics | null = null;

        const project: Project | undefined = model.relationships.find(Project);

        // setup scene stuff (if any)
        if (project) {
            analytics = new Analytics(project.id);
            analytics.origin = <any>Server.location().type;

            analytics.data.push("type", "model-ar");
            analytics.data.push("sdkVersion", version);
            analytics.data.push("applicationId", project.id);
            analytics.data.push("applicationTitle", project.attributes.title);
            analytics.data.push("modelId", model.id);
            analytics.data.push("modelTitle", model.attributes.title);

            this._analytics = analytics;

            if (this._options.useARBanner) {
                this.options.banner = {
                    title: <any>project.attributes.title,
                    subtitle: model.attributes.title,
                    button: 'Visit'
                }
            }
        }
    }

    /**
     * Initialise the ModelAR instance. This returns a Promise that resolves
     * successfully if initialisation is successful, otherwise it will fail.
     * 
     * filure can occur for a number of reasons but it generally means that AR
     * cannot be performed.
     */
    public init(): Promise<LauncherAR> {
        return new Promise<LauncherAR>((accept, reject) => {
            if (!Util.canAugment()) {
                return reject(new Error("ModelAR.init() - cannot proceed as AR not available in context"));
            }

            const model: FileModel = new FileModel(this.modelID);
            model.include(Project);

            model.get().then((model: FileModel) => {
                // setup the analytics data
                this._SetupAnalytics(model);

                // we need to define our AR module here
                // we are in Safari/Quicklook mode here
                if (Util.isSafari() || Util.isChromeOnIOS()) {
                    // model needs to have either USDZ or REALITY files defined
                    // we load REALITY stuff first if available
                    if (model.attributes.reality_filename && Util.canRealityViewer()) {
                        this._ar = new RealityViewer();
                        this._ar.modelUrl = Server.location().cdn + model.attributes.path + model.attributes.reality_filename;
                        this._ar.banner = this.options.banner;

                        return accept(this);
                    }

                    // otherwise, load the USDZ stuff second if available
                    if (model.attributes.usdz_filename && Util.canQuicklook()) {
                        this._ar = new QuicklookViewer();
                        this._ar.modelUrl = Server.location().cdn + model.attributes.path + model.attributes.usdz_filename;
                        this._ar.banner = this.options.banner;

                        return accept(this);
                    }

                    return reject(new Error("ModelAR.init() - cannot proceed as ModelFile does not have a defined .usdz or .reality file"));
                }

                // check android
                if (Util.canSceneViewer()) {
                    const arviewer = new SceneViewer();
                    arviewer.modelUrl = Server.location().cdn + model.attributes.path + model.attributes.original_filename;
                    arviewer.isVertical = this.options.anchor === "vertical" ? true : false;
                    arviewer.banner = this.options.banner;
                    this._ar = arviewer;

                    return accept(this);
                }

                // otherwise, we didn't have AR available - it should never really reach this stage as this should be caught
                // earlier in the process
                return reject(new Error("ModelAR.init() - could not initialise AR correctly, check values"));
            }).catch(reject);
        });
    }

    /**
     * Launches the internal AR instance using an appropriate version of AR Viewers
     */
    public start(): void {
        if (!this._ar) {
            throw new Error("ModelAR.start() - cannot proceed as AR instance is null");
        }

        const analytics: Analytics | null = this._analytics;

        if (analytics) {
            analytics.data.push("device", this._ar.device);
            analytics.data.push("eventCategory", this._ar.nodeType);
            analytics.data.push("eventAction", "Start Model Augment");

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