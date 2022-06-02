import { FileModel, Product, ProductVariation, Scene, Project, Server } from "@plattar/plattar-api";
import { Analytics } from "@plattar/plattar-analytics";
import { Util } from "../util/util";
import ARViewer from "../viewers/ar-viewer";
import QuicklookViewer from "../viewers/quicklook-viewer";
import RealityViewer from "../viewers/reality-viewer";
import SceneViewer from "../viewers/scene-viewer";
import { LauncherAR } from "./launcher-ar";

/**
 * Performs AR functionality related to Plattar Products and Variation types
 */
export class ProductAR extends LauncherAR {

    // analytics instance
    private _analytics: Analytics | null = null;

    // product and selected variation IDs
    private readonly _productID: string;
    private readonly _variationID: string | null;
    private readonly _variationSKU: string | null;

    // this thing controls the actual AR view
    // this is setup via .init() function
    private _ar: ARViewer | null;

    constructor(productID: string | undefined | null = null, variationID: string | undefined | null = null, variationSKU: string | undefined | null = null) {
        super();

        if (!productID) {
            throw new Error("ProductAR.constructor(productID, variationID) - productID must be defined");
        }

        this._productID = productID;
        this._variationSKU = variationSKU;
        this._variationID = variationID ? variationID : (variationSKU ? null : "default");
        this._ar = null;
    }

    public get productID(): string {
        return this._productID;
    }

    public get variationID(): string | null {
        return this._variationID;
    }

    public get variationSKU(): string | null {
        return this._variationSKU;
    }

    private _SetupAnalytics(product: Product, variation: ProductVariation): void {
        let analytics: Analytics | null = null;

        const scene: Scene | undefined = product.relationships.find(Scene);

        // setup scene stuff (if any)
        if (scene) {
            analytics = new Analytics(scene.attributes.application_id);
            analytics.origin = <any>Server.location().type;

            this._analytics = analytics;

            analytics.data.push("type", "product-ar");
            analytics.data.push("sceneId", scene.id);
            analytics.data.push("sceneTitle", scene.attributes.title);

            const application: Project | undefined = scene.relationships.find(Project);

            // setup application stuff (if any)
            if (application) {
                analytics.data.push("applicationId", application.id);
                analytics.data.push("applicationTitle", application.attributes.title);
            }
        }

        if (analytics) {
            // set product stuff
            analytics.data.push("productId", product.id);
            analytics.data.push("productTitle", product.attributes.title);
            analytics.data.push("productSKU", product.attributes.sku);

            // set variation stuff
            analytics.data.push("variationId", variation.id);
            analytics.data.push("variationTitle", variation.attributes.title);
            analytics.data.push("variationSKU", variation.attributes.sku);
        }
    }

    /**
     * Initialise the ProductAR instance. This returns a Promise that resolves
     * successfully if initialisation is successful, otherwise it will fail.
     * 
     * filure can occur for a number of reasons but it generally means that AR
     * cannot be performed.
     */
    public init(): Promise<LauncherAR> {
        return new Promise<LauncherAR>((accept, reject) => {
            if (!Util.canAugment()) {
                return reject(new Error("ProductAR.init() - cannot proceed as AR not available in context"));
            }

            const product: Product = new Product(this.productID);
            product.include(ProductVariation);
            product.include(ProductVariation.include(FileModel));
            product.include(Scene);
            product.include(Scene.include(Project));

            product.get().then((product: Product) => {
                // find the required variation from our product
                const variationID: string | null | undefined = this.variationID ? (this.variationID === "default" ? product.attributes.product_variation_id : this.variationID) : null;
                const variationSKU: string | null = this.variationSKU;

                if (!variationID && !variationSKU) {
                    return reject(new Error("ProductAR.init() - cannot proceed as variation-id or variation-sku was not set correctly"));
                }

                let variation: ProductVariation | undefined = undefined;

                if (variationID) {
                    variation = product.relationships.find(ProductVariation, variationID);
                }

                // if no variation was found with variationID - try searching variation sku
                if (!variation && variationSKU) {
                    const variations = product.relationships.filter(ProductVariation);

                    if (variations) {
                        variation = variations.find((element: ProductVariation) => {
                            return element.attributes.sku === variationSKU;
                        });
                    }
                }

                // make sure our variation is actually available before moving forward
                if (!variation) {
                    return reject(new Error("ProductAR.init() - cannot proceed as variation with id " + variationID + " or sku " + variationSKU + " cannot be found"));
                }

                // otherwise both the product and variation are available
                // we need to figure out if we can actually do AR though
                // check if variation has a model file defined
                const modelID: string | undefined = variation.attributes.file_model_id;

                if (!modelID) {
                    return reject(new Error("ProductAR.init() - cannot proceed as variation does not have a defined file"));
                }

                // find the actual FileModel from Variation
                const model: FileModel | undefined = variation.relationships.find(FileModel, modelID);

                if (!model) {
                    return reject(new Error("ProductAR.init() - cannot proceed as ModelFile for selected variation is corrupt"));
                }

                this._SetupAnalytics(product, variation);

                // we need to define our AR module here
                // we are in Safari/Quicklook mode here
                if (Util.isSafari() || Util.isChromeOnIOS()) {
                    // model needs to have either USDZ or REALITY files defined
                    // we load REALITY stuff first if available
                    if (model.attributes.reality_filename && Util.canRealityViewer()) {
                        this._ar = new RealityViewer();
                        this._ar.modelUrl = Server.location().cdn + model.attributes.path + model.attributes.reality_filename;

                        return accept(this);
                    }

                    // otherwise, load the USDZ stuff second if available
                    if (model.attributes.usdz_filename && Util.canQuicklook()) {
                        this._ar = new QuicklookViewer();
                        this._ar.modelUrl = Server.location().cdn + model.attributes.path + model.attributes.usdz_filename;

                        return accept(this);
                    }

                    return reject(new Error("ProductAR.init() - cannot proceed as ModelFile does not have a defined .usdz or .reality file"));
                }

                // check android
                if (Util.canSceneViewer()) {
                    const arviewer = new SceneViewer();
                    arviewer.modelUrl = Server.location().cdn + model.attributes.path + model.attributes.original_filename;
                    arviewer.isVertical = this.options.anchor === "vertical" ? true : false;

                    const scene: Scene | undefined = product.relationships.find(Scene);

                    if (scene) {
                        const sceneOpt: any = scene.attributes.custom_json || {};

                        if (sceneOpt.anchor === "vertical") {
                            arviewer.isVertical = true;
                        }
                    }

                    this._ar = arviewer;

                    return accept(this);
                }

                // otherwise, we didn't have AR available - it should never really reach this stage as this should be caught
                // earlier in the process
                return reject(new Error("ProductAR.init() - could not initialise AR correctly, check values"));
            }).catch(reject);
        });
    }

    /**
     * Launches the internal AR instance using an appropriate version of AR Viewers
     */
    public start(): void {
        if (!this._ar) {
            throw new Error("ProductAR.start() - cannot proceed as AR instance is null");
        }

        const analytics: Analytics | null = this._analytics;

        if (analytics) {
            analytics.data.push("device", this._ar.device);
            analytics.data.push("eventCategory", this._ar.nodeType);
            analytics.data.push("eventAction", "Start Augment");

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