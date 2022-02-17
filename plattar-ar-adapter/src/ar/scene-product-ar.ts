import { ProductAR } from "./product-ar";
import { SceneProduct } from "@plattar/plattar-api";
import { Util } from "../util/util";
import { LauncherAR } from "./launcher-ar";

/**
 * Allows launching Product AR by providing a SceneProduct ID instead.
 * SceneProducts are much more convenient to grab from the Plattar CMS
 */
export class SceneProductAR extends ProductAR {

    private readonly _sceneProductID: string;

    // this is evaluated in the init() function
    private _attachedProductID: string | null = null;

    constructor(sceneProductID: string | undefined | null = null, variationID: string | undefined | null = null) {
        super(sceneProductID, variationID);

        if (!sceneProductID) {
            throw new Error("SceneProductAR.constructor(sceneProductID, variationID) - sceneProductID must be defined");
        }

        this._sceneProductID = sceneProductID;
    }

    public get sceneProductID(): string {
        return this._sceneProductID;
    }

    public get productID(): string {
        if (!this._attachedProductID) {
            throw new Error("SceneProductAR.productID() - product id was not defined, did you call init()?");
        }

        return this._attachedProductID;
    }

    public init(): Promise<LauncherAR> {
        return new Promise<LauncherAR>((accept, reject) => {
            if (!Util.canAugment()) {
                return reject(new Error("SceneProductAR.init() - cannot proceed as AR not available in context"));
            }

            const sceneProduct: SceneProduct = new SceneProduct(this.sceneProductID);

            sceneProduct.get().then((sceneProduct: SceneProduct) => {
                const productID: string = sceneProduct.attributes.product_id;

                if (!productID) {
                    return reject("SceneProductAR.init() - Scene Product does not have an attached Product instance");
                }

                this._attachedProductID = productID;

                // execute the standard Product AR functionality
                return super.init().then(accept).catch(reject);
            }).catch(reject);
        });
    }
}