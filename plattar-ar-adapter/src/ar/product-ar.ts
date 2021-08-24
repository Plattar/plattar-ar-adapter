import { FileModel, Product, ProductVariation, Scene, Project } from "@plattar/plattar-api";
import Util from "../util/util";
import ARViewer from "../viewers/ar-viewer";

/**
 * Performs AR functionality related to Plattar Products and Variation types
 */
export default class ProductAR {

    private readonly _productID: string;
    private readonly _variationID: string;

    private _ar: ARViewer | null;

    constructor(productID: string | undefined | null = null, variationID: string | undefined | null = null) {
        if (!productID) {
            throw new Error("ProductAR.constructor(productID, variationID) - productID must be defined");
        }

        if (!variationID) {
            throw new Error("ProductAR.constructor(productID, variationID) - variationID must be defined");
        }

        this._productID = productID;
        this._variationID = variationID;
        this._ar = null;
    }

    public get productID(): string {
        return this._productID;
    }

    public get variationID(): string {
        return this._variationID;
    }

    public init(): Promise<ProductAR> {
        return new Promise<ProductAR>((accept, reject) => {
            if (!Util.canAugment()) {
                return reject(new Error("ProductAR.init() - cannot proceed as context is not available for AR"));
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

    public launch(): void {
        if (!this._ar) {
            throw new Error("ProductAR.launch() - cannot proceed as AR instance is null, did you init via ProductAR.init()?");
        }

        this._ar.start();
    }
}