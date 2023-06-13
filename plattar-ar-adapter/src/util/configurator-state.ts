import { Product, ProductVariation, Project, Scene, SceneModel, SceneProduct } from "@plattar/plattar-api";

interface ConfiguratorStateData {
    meta: {
        scene_product_index: 0,
        product_variation_index: 1,
        meta_index: 2
    },
    states: Array<Array<any>>
}

export interface SceneProductData {
    scene_product_id: string;
    product_variation_id: string;
    meta_data: SceneProductDataMeta;
}

export interface SceneProductDataMeta {
    augment: boolean;
    isSceneModel: boolean;
}

export interface DecodedConfiguratorState {
    readonly scene: Scene;
    readonly state: ConfiguratorState;
}

/**
 * Manages a Configuration State of multiple Products with multiple Variations
 * Allows easily changing 
 */
export class ConfiguratorState {
    private readonly _state: ConfiguratorStateData;

    // This maps Variation ID against a Scene Product ID - populated by decodeScene() function
    private readonly _mappedVariationIDValues: Map<string, string>;

    // This maps Variation SKU against a Variation ID - populated by decodeScene() function
    private readonly _mappedVariationSKUValues: Map<string, string>;

    constructor(state: string | null | undefined = null) {
        this._mappedVariationIDValues = new Map<string, string>();
        this._mappedVariationSKUValues = new Map<string, string>();

        const defaultState: ConfiguratorStateData = {
            meta: {
                scene_product_index: 0,
                product_variation_index: 1,
                meta_index: 2,
            },
            states: []
        };

        if (state) {
            try {
                const decodedb64State: string = atob(state);
                const parsedState: any = JSON.parse(decodedb64State);

                // set the meta data
                if (parsedState.meta) {
                    defaultState.meta.scene_product_index = parsedState.meta.scene_product_index || 0;
                    defaultState.meta.product_variation_index = parsedState.meta.product_variation_index || 1;
                    defaultState.meta.meta_index = parsedState.meta.meta_index || 2;
                }

                defaultState.states = parsedState.states || [];
            }
            catch (err) {
                console.error("ConfiguratorState.constructor() - there was an error parsing configurator state");
                console.error(err);
            }
        }

        this._state = defaultState;
    }

    /**
     * Modifyes the SceneProduct that this Variation SKU belongs to and changes for
     * purposes of Configuration
     */
    public setVariationSKU(productVariationSKU: string): void {
        const variationID: string | undefined = this._mappedVariationSKUValues.get(productVariationSKU);

        if (!variationID) {
            console.warn("ConfiguratorState.setVariationSKU() - Variation SKU of " + productVariationSKU + " is not defined in any variations");

            return;
        }

        this.setVariationID(variationID);
    }

    /**
     * Modifyes the SceneProduct that this Variation belongs to and changes for
     * purposes of Configuration
     */
    public setVariationID(productVariationID: string): void {
        const sceneProductID: string | undefined = this._mappedVariationIDValues.get(productVariationID);

        if (!sceneProductID) {
            console.warn("ConfiguratorState.setVariationID() - Variation ID of " + productVariationID + " is not defined in any products");

            return;
        }

        this.setSceneProduct(sceneProductID, productVariationID);
    }

    /**
     * Adds a new Scene Product/Variation combo with meta-data into the Configurator State
     * 
     * @param sceneProductID - The Scene Product ID to be used (as defined in Plattar CMS)
     * @param productVariationID - The Product Variation ID to be used (as defined in Plattar CMS)
     * @param metaData - Arbitrary meta-data that can be used against certain operaions
     */
    public setSceneProduct(sceneProductID: string, productVariationID: string, metaData: SceneProductDataMeta | null | undefined = null): void {
        this.addSceneProduct(sceneProductID, productVariationID, metaData);
    }

    /**
     * Adds a new SceneModel with meta-data into the Configurator State. Note that the SceneProductDataMeta will
     * override the isSceneModel variable and assign to "true" automatically
     * 
     * @param SceneModelID - The SceneModel ID to add
     * @param metaData - Arbitrary meta-data that can be used against certain operaions
     */
    public setSceneModel(SceneModelID: string, metaData: SceneProductDataMeta | null | undefined = null): void {
        if (SceneModelID) {
            metaData = metaData || { augment: true, isSceneModel: true };
            metaData.isSceneModel = true;

            const states: Array<Array<any>> = this._state.states;
            const meta = this._state.meta;

            let newData: any[] | null = null;

            const existingData: any[] | null = this.findSceneProductIndex(SceneModelID);

            if (existingData) {
                newData = existingData;
            }
            else {
                newData = [];

                // push the new data into the stack
                states.push(newData);
            }

            newData[meta.scene_product_index] = SceneModelID;
            newData[meta.product_variation_index] = null;

            newData[meta.meta_index] = metaData;
        }
    }

    /**
     * Adds a new Scene Product/Variation combo with meta-data into the Configurator State
     * 
     * @param sceneProductID - The Scene Product ID to be used (as defined in Plattar CMS)
     * @param productVariationID - The Product Variation ID to be used (as defined in Plattar CMS)
     * @param metaData - Arbitrary meta-data that can be used against certain operaions
     */
    public addSceneProduct(sceneProductID: string, productVariationID: string, metaData: SceneProductDataMeta | null | undefined = null): void {
        if (sceneProductID && productVariationID) {
            const states: Array<Array<any>> = this._state.states;
            const meta = this._state.meta;

            let newData: any[] | null = null;

            const existingData: any[] | null = this.findSceneProductIndex(sceneProductID);

            if (existingData) {
                newData = existingData;
            }
            else {
                newData = [];

                // push the new data into the stack
                states.push(newData);
            }

            newData[meta.scene_product_index] = sceneProductID;
            newData[meta.product_variation_index] = productVariationID;

            if (metaData) {
                newData[meta.meta_index] = metaData;
            }
        }
    }

    /**
     * Search and return the data index reference for the provided Scene Product ID
     * if not found, will return null
     * @param sceneProductID
     */
    public findSceneProductIndex(sceneProductID: string): any[] | null {
        const states: Array<Array<any>> = this._state.states;

        if (states.length > 0) {
            const meta = this._state.meta;

            const found = states.find((productState: Array<any>) => {
                return productState[meta.scene_product_index] === sceneProductID;
            });

            return found ? found : null;
        }

        return null;
    }

    /**
     * Search and return the data for the provided Scene Product ID
     * if not found, will return null
     * @param sceneProductID
     */
    public findSceneProduct(sceneProductID: string): SceneProductData | null {
        const found = this.findSceneProductIndex(sceneProductID);

        if (found) {
            const meta = this._state.meta;

            const data: SceneProductData = {
                scene_product_id: found[meta.scene_product_index],
                product_variation_id: found[meta.product_variation_index],
                meta_data: {
                    augment: true,
                    isSceneModel: false
                }
            };

            // include the meta-data
            if (found.length === 3) {
                data.meta_data.augment = found[meta.meta_index].augment || true;
                data.meta_data.isSceneModel = found[meta.meta_index].isSceneModel || false;
            }

            return data;
        }

        return null;
    }

    /**
     * Iterate over the internal state data
     */
    public forEach(callback: (data: SceneProductData) => void): void {
        const states: Array<Array<any>> = this._state.states;
        const meta = this._state.meta;

        if (states.length > 0) {
            states.forEach((productState: Array<any>) => {
                if (productState.length === 2) {
                    callback({
                        scene_product_id: productState[meta.scene_product_index],
                        product_variation_id: productState[meta.product_variation_index],
                        meta_data: {
                            augment: true,
                            isSceneModel: false
                        }
                    });
                }
                else if (productState.length === 3) {
                    callback({
                        scene_product_id: productState[meta.scene_product_index],
                        product_variation_id: productState[meta.product_variation_index],
                        meta_data: {
                            augment: productState[meta.meta_index].augment || true,
                            isSceneModel: productState[meta.meta_index].isSceneModel || false
                        }
                    });
                }
            });
        }
    }

    /**
     * Compose and return an array of all internal objects
     */
    public array(): Array<SceneProductData> {
        const array: Array<SceneProductData> = new Array<SceneProductData>();

        this.forEach((object: SceneProductData) => {
            array.push(object);
        });

        return array;
    }

    /**
     * @returns Returns the first reference of data in the stack, otherwise returns null
     */
    public first(): SceneProductData | null {
        const states: Array<Array<any>> = this._state.states;

        if (states.length > 0) {
            const meta = this._state.meta;

            const found = states.find((productState: Array<any>) => {
                const check = productState[meta.scene_product_index];

                // ensure the data contains valid elements
                return check !== null && check !== undefined;
            });

            if (!found) {
                return null;
            }

            const data: SceneProductData = {
                scene_product_id: found[meta.scene_product_index],
                product_variation_id: found[meta.product_variation_index],
                meta_data: {
                    augment: true,
                    isSceneModel: false
                }
            };

            // include the meta-data
            if (found.length === 3) {
                data.meta_data.augment = found[meta.meta_index].augment || true;
            }

            return data;
        }

        return null;
    }

    public get length(): number {
        return this._state.states.length;
    }

    /**
     * Decodes and returns an instance of ConfiguratorState from a previously
     * encoded state
     * @param state - The previously encoded state as a Base64 String
     * @returns - ConfiguratorState instance
     */
    public static decode(state: string): ConfiguratorState {
        return new ConfiguratorState(state);
    }

    /**
     * Generates a new ConfiguratorState instance from all SceneProducts and default
     * variations from the provided Scene ID
     * @param sceneID - the Scene ID to generate 
     * @returns - Promise that resolves into a ConfiguratorState instance
     */
    public static async decodeScene(sceneID: string | null | undefined = null): Promise<DecodedConfiguratorState> {
        if (!sceneID) {
            throw new Error("ConfiguratorState.decodeScene(sceneID) - sceneID must be defined");
        }

        const configState: ConfiguratorState = new ConfiguratorState();

        const fscene: Scene = new Scene(sceneID);
        fscene.include(Project);
        fscene.include(SceneProduct);
        fscene.include(SceneModel);
        fscene.include(SceneProduct.include(Product.include(ProductVariation)));

        const scene: Scene = await fscene.get();

        const sceneProducts: Array<SceneProduct> = scene.relationships.filter(SceneProduct);
        const sceneModels: Array<SceneModel> = scene.relationships.filter(SceneModel);

        // add out scene models
        sceneModels.forEach((sceneModel: SceneModel) => {
            configState.setSceneModel(sceneModel.id, {
                augment: sceneModel.attributes.include_in_augment,
                isSceneModel: true
            });
        });

        // add out scene products
        sceneProducts.forEach((sceneProduct: SceneProduct) => {
            const product: Product | undefined = sceneProduct.relationships.find(Product);

            if (product) {
                if (product.attributes.product_variation_id) {
                    configState.setSceneProduct(sceneProduct.id, product.attributes.product_variation_id, {
                        augment: sceneProduct.attributes.include_in_augment,
                        isSceneModel: false
                    });
                }

                // add the variation to an acceptible range of values
                const variations: Array<ProductVariation> = product.relationships.filter(ProductVariation);

                variations.forEach((variation: ProductVariation) => {
                    configState._mappedVariationIDValues.set(variation.id, sceneProduct.id);

                    if (variation.attributes.sku) {
                        configState._mappedVariationSKUValues.set(variation.attributes.sku, variation.id);
                    }
                });
            }
        });

        return {
            scene: scene,
            state: configState
        };
    }

    /**
     * Encode and return the internal ConfiguratorState as a Base64 String
     * @returns - Base64 String
     */
    public encode(): string {
        return btoa(JSON.stringify(this._state));
    }
}