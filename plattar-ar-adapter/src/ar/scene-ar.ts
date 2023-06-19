import { Analytics } from "@plattar/plattar-analytics";
import { Product, Project, Scene, SceneModel, SceneProduct, Server } from "@plattar/plattar-api";
import { Configurator } from "@plattar/plattar-services";
import { Util } from "../util/util";
import ARViewer from "../viewers/ar-viewer";
import QuicklookViewer from "../viewers/quicklook-viewer";
import RealityViewer from "../viewers/reality-viewer";
import SceneViewer from "../viewers/scene-viewer";
import { LauncherAR } from "./launcher-ar";
import version from "../version";

export interface SceneVariationSelection {
    readonly sceneProductID?: string;
    readonly productID?: string;
    readonly variationID?: string;
}

/**
 * Performs AR functionality related to Plattar Scenes
 */
export class SceneAR extends LauncherAR {

    // analytics instance
    private _analytics: Analytics | null = null;

    // scene and selected variation IDs
    private readonly _sceneID: string;
    private readonly _variationSelection: SceneVariationSelection;

    // this thing controls the actual AR view
    // this is setup via .init() function
    private _ar: ARViewer | null;

    constructor(sceneID: string | undefined | null = null, variationSelection: SceneVariationSelection | undefined | null = null) {
        super();

        if (!sceneID) {
            throw new Error("SceneAR.constructor(sceneID) - sceneID must be defined");
        }

        this._sceneID = sceneID;
        this._variationSelection = variationSelection || {};
        this._ar = null;
    }

    public get sceneID(): string {
        return this._sceneID;
    }

    private _SetupAnalytics(scene: Scene): void {
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
            }
        }
    }

    /**
     * Composes a Scene into an AR Model (remote operation) that can be used to launch
     * an AR File
     */
    private _ComposeScene(scene: Scene, output: "glb" | "usdz" | "vto"): Promise<string> {
        return new Promise<string>((accept, reject) => {
            const sceneProducts: SceneProduct[] = scene.relationships.filter(SceneProduct);
            const sceneModels: SceneModel[] = scene.relationships.filter(SceneModel);

            // nothing to do if no AR components can be found
            if ((sceneProducts.length + sceneModels.length) <= 0) {
                return reject(new Error("SceneAR.ComposeScene() - cannot proceed as scene does not contain AR components"));
            }

            // define our configurator
            const configurator: Configurator = new Configurator();

            configurator.server = <any>Server.location().type;
            configurator.output = output;

            let totalARObjectCount: number = 0;

            // add our scene products
            sceneProducts.forEach((sceneProduct: SceneProduct) => {
                const product: Product | undefined = sceneProduct.relationships.find(Product);
                const selection: SceneVariationSelection = this._variationSelection;

                // we have a specific product selection
                if (sceneProduct.attributes.include_in_augment) {
                    // check if this product is the one we want (from selection optionally)
                    if (product && (product.id === selection.productID) && selection.variationID) {
                        configurator.addSceneProduct(sceneProduct.id, selection.variationID);

                        totalARObjectCount++;
                    }
                    else if (product) {
                        // check if this scene-product is the one we want (from selection)
                        if ((sceneProduct.id === selection.sceneProductID) && selection.variationID) {
                            configurator.addSceneProduct(sceneProduct.id, selection.variationID);

                            totalARObjectCount++;
                        }
                        else if (product.attributes.product_variation_id) {
                            configurator.addSceneProduct(sceneProduct.id, product.attributes.product_variation_id);

                            totalARObjectCount++;
                        }
                    }
                }
            });

            // add our scene models
            sceneModels.forEach((sceneModel: SceneModel) => {
                if (sceneModel.attributes.include_in_augment) {
                    configurator.addModel(sceneModel.id);
                    totalARObjectCount++;
                }
            });

            // ensure we have actually added AR objects
            if (totalARObjectCount <= 0) {
                return reject(new Error("SceneAR.ComposeScene() - cannot proceed as scene does not contain any enabled AR components"));
            }

            return configurator.get().then((result: any) => {
                accept(result.filename);
            }).catch(reject);
        });
    }

    /**
     * Initialise the SceneAR instance. This returns a Promise that resolves
     * successfully if initialisation is successful, otherwise it will fail.
     * 
     * filure can occur for a number of reasons but it generally means that AR
     * cannot be performed.
     */
    public init(): Promise<LauncherAR> {
        return new Promise<LauncherAR>((accept, reject) => {
            if (!Util.canAugment()) {
                return reject(new Error("SceneAR.init() - cannot proceed as AR not available in context"));
            }

            const scene: Scene = new Scene(this.sceneID);
            scene.include(Project);
            scene.include(SceneProduct);
            scene.include(SceneProduct.include(Product));
            scene.include(SceneModel);

            scene.get().then((scene: Scene) => {
                this._SetupAnalytics(scene);

                const sceneOpt: any = scene.attributes.custom_json || {};

                // we need to define our AR module here
                // we are in Safari/Quicklook mode here
                if (Util.isSafari() || Util.isChromeOnIOS()) {
                    // we need to launch a VTO experience here
                    // VTO requires Reality Support
                    if (sceneOpt.anchor === "face") {
                        if (Util.canRealityViewer()) {
                            return this._ComposeScene(scene, "vto").then((modelUrl: string) => {
                                this._ar = new RealityViewer();
                                this._ar.modelUrl = modelUrl;

                                return accept(this);
                            }).catch(reject);
                        }
                        else {
                            return reject(new Error("SceneAR.init() - cannot proceed as VTO AR requires Reality Viewer support"));
                        }
                    }

                    // otherwise, load the USDZ stuff second if available
                    if (Util.canQuicklook()) {
                        return this._ComposeScene(scene, "usdz").then((modelUrl: string) => {
                            this._ar = new QuicklookViewer();
                            this._ar.modelUrl = modelUrl;

                            return accept(this);
                        }).catch(reject);
                    }

                    return reject(new Error("SceneAR.init() - cannot proceed as IOS device does not support AR Mode"));
                }

                // check android
                if (Util.canSceneViewer()) {
                    return this._ComposeScene(scene, "glb").then((modelUrl: string) => {
                        const arviewer = new SceneViewer();
                        arviewer.modelUrl = modelUrl;
                        arviewer.isVertical = this.options.anchor === "vertical" ? true : false;

                        if (sceneOpt.anchor === "vertical") {
                            arviewer.isVertical = true;
                        }

                        this._ar = arviewer;

                        return accept(this);
                    }).catch(reject);
                }

                // otherwise, we didn't have AR available - it should never really reach this stage as this should be caught
                // earlier in the process
                return reject(new Error("SceneAR.init() - could not initialise AR correctly, check values"));
            }).catch(reject);
        });
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