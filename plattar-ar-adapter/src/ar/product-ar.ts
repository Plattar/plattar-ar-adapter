import { FileModel, Product, ProductVariation, Scene, Project } from "@plattar/plattar-api";
import Util from "../util/util";

/**
 * Performs AR functionality related to Plattar Products and Variation types
 */
export default class ProductAR {

    private readonly _productID: string;
    private readonly _variationID: string;

    constructor(productID: string | undefined | null = null, variationID: string | undefined | null = null) {
        if (!productID) {
            throw new Error("ProductAR.constructor(productID, variationID) - productID must be defined");
        }

        if (!variationID) {
            throw new Error("ProductAR.constructor(productID, variationID) - variationID must be defined");
        }

        this._productID = productID;
        this._variationID = variationID;
    }

    public get productID(): string {
        return this._productID;
    }

    public get variationID(): string {
        return this._variationID;
    }

    public launch(): Promise<void> {
        return new Promise<void>((accept, reject) => {
            if (!Util.canAugment()) {
                return reject(new Error("ProductAR.launch() - cannot proceed as context is not available for AR"));
            }

            const product: Product = new Product(this.productID);
            product.include(ProductVariation);
            product.include(ProductVariation.include(FileModel));
            product.include(Scene);
            product.include(Scene.include(Project));

            product.get().then((product: Product) => {

            }).catch(reject);
        });
    }
}