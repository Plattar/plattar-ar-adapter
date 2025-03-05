import { Analytics } from "@plattar/plattar-analytics";
import { Project, Scene, Server } from "@plattar/plattar-api";
import { Configurator } from "@plattar/plattar-services";
import { Util } from "../util/util";
import { ARViewer } from "../viewers/ar-viewer";
import QuicklookViewer from "../viewers/quicklook-viewer";
import SceneViewer from "../viewers/scene-viewer";
import { LauncherAR } from "./launcher-ar";
import { DecodedConfiguratorState, SceneProductData } from "../util/configurator-state";
import version from "../version";

export interface ConfiguratorAROptions {
    readonly state: DecodedConfiguratorState;
    readonly useARBanner: boolean;
}

/**
 * Performs AR functionality related to Plattar Scenes
 */
export class ConfiguratorAR extends LauncherAR {

    // analytics instance
    private _analytics: Analytics | null = null;
    private _options: ConfiguratorAROptions;

    // this thing controls the actual AR view
    // this is setup via .init() function
    private _ar: ARViewer | null;

    constructor(options: ConfiguratorAROptions) {
        super();

        if (!options.state) {
            throw new Error("ConfiguratorAR.constructor(state) - state must be defined");
        }

        this._options = options;
        this._ar = null;
    }

    private _SetupAnalytics(): void {
        const scene: Scene = this._options.state.scene;
        let analytics: Analytics | null = null;

        // setup scene stuff (if any)
        if (scene) {
            analytics = new Analytics(scene.attributes.application_id);
            analytics.origin = <any>Server.location().type;

            this._analytics = analytics;

            analytics.data.push("type", "scene-ar");
            analytics.data.push("sdkVersion", version);
            analytics.data.push("sceneId", scene.id);
            analytics.data.push("sceneTitle", scene.attributes.title);

            const application: Project | undefined = scene.relationships.find(Project);

            // setup application stuff (if any)
            if (application) {
                analytics.data.push("applicationId", application.id);
                analytics.data.push("applicationTitle", application.attributes.title);

                if (this._options.useARBanner) {
                    this.options.banner = {
                        title: <any>application.attributes.title,
                        subtitle: scene.attributes.title,
                        button: 'Visit'
                    }
                }
            }
        }
    }

    /**
     * Composes a Scene into an AR Model (remote operation) that can be used to launch
     * an AR File
     */
    private async _Compose(output: "glb" | "usdz" | "vto"): Promise<string> {
        const type: "viewer" | "reality" = output === 'glb' ? "viewer" : "reality";

        const url: string = `https://xrutils.plattar.com/v3/scene/${this._options.state.scene.id}/${type}`;

        // grab our existing scene-graph from the saved API
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    data: {
                        attributes: this._options.state.state.sceneGraph
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`ConfiguratorAR - Fetching Existing Graph Error - network response was not ok ${response.status}`);
            }

            const data = await response.json();

            return data.data.attributes.url;
        }
        catch (error: any) {
            throw new Error(`ConfiguratorAR - Fetching Existing Graph Error - there was a request error to ${url}, error was ${error.message}`);
        }
    }

    /**
     * Initialise the SceneAR instance. This returns a Promise that resolves
     * successfully if initialisation is successful, otherwise it will fail.
     * 
     * filure can occur for a number of reasons but it generally means that AR
     * cannot be performed.
     */
    public async init(): Promise<LauncherAR> {
        if (!Util.canAugment()) {
            throw new Error("ConfiguratorAR.init() - cannot proceed as AR not available in context");
        }

        const scene: Scene = this._options.state.scene;

        this._SetupAnalytics();

        const sceneOpt: any = scene.attributes.custom_json || {};

        // we need to define our AR module here
        // we are in Safari/Quicklook mode here
        if (Util.isSafari() || Util.isChromeOnIOS()) {
            // we need to launch a VTO experience here
            // VTO requires Reality Support
            if (sceneOpt.anchor === "face") {
                if (Util.canRealityViewer()) {
                    const modelUrl: string = await this._Compose("vto");

                    this._ar = new QuicklookViewer();
                    this._ar.modelUrl = modelUrl;
                    this._ar.banner = this.options.banner;

                    return this;
                }
                else {
                    throw new Error("ConfiguratorAR.init() - cannot proceed as VTO AR requires Reality Viewer support");
                }
            }

            // otherwise, load the USDZ stuff second if available
            if (Util.canQuicklook()) {
                const modelUrl: string = await this._Compose("usdz");

                this._ar = new QuicklookViewer();
                this._ar.modelUrl = modelUrl;
                this._ar.banner = this.options.banner;

                return this;
            }

            throw new Error("ConfiguratorAR.init() - cannot proceed as IOS device does not support AR Mode");
        }

        // check android
        if (Util.canSceneViewer()) {
            const modelUrl: string = await this._Compose("glb");

            const arviewer = new SceneViewer();
            arviewer.modelUrl = modelUrl;
            arviewer.isVertical = this.options.anchor === "vertical" ? true : false;
            arviewer.banner = this.options.banner;

            if (sceneOpt.anchor === "vertical") {
                arviewer.isVertical = true;
            }

            this._ar = arviewer;

            return this;
        }

        // otherwise, we didn't have AR available - it should never really reach this stage as this should be caught
        // earlier in the process
        throw new Error("ConfiguratorAR.init() - could not initialise AR correctly, check values");
    }

    public start(): void {
        if (!this._ar) {
            throw new Error("SceneAR.start() - cannot proceed as AR instance is null");
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