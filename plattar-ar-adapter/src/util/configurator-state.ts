import { Product, ProductVariation, Project, Scene, SceneModel, SceneProduct, Server } from "@plattar/plattar-api";

export type SceneProductDataMetaType = "sceneproduct" | "scenemodel" | "product";

interface ConfiguratorStateData {
    meta: {
        scene_product_index: 0,
        scene_model_index: 0,
        product_index: 0,
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
    type: SceneProductDataMetaType;
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
    private readonly _mappedVariationSKUValues: Map<string, Array<string>>;

    // Cache for encodeSceneGraphID() - keyed by serialised scene graph JSON so state
    // changes automatically bust the cache, and concurrent in-flight calls share one fetch
    private _cachedSceneGraphID: Promise<string> | null = null;
    private _cachedSceneGraphJSON: string | null = null;

    // Memoised result of the sceneGraph getter - cleared whenever state is mutated
    private _cachedSceneGraph: any | null = null;

    // Static page-lifetime cache for Scene API responses, keyed by sceneID.
    // Shared across all controller instances so that multiple <plattar-embed>
    // elements with the same scene-id (or a recreated controller) reuse one fetch.
    private static readonly _sceneAPICache: Map<string, Promise<Scene>> = new Map();

    constructor(state: string | null | undefined = null) {
        this._mappedVariationIDValues = new Map<string, string>();
        this._mappedVariationSKUValues = new Map<string, Array<string>>();

        const defaultState: ConfiguratorStateData = {
            meta: {
                scene_product_index: 0,
                scene_model_index: 0,
                product_index: 0,
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
                    defaultState.meta.scene_model_index = parsedState.meta.scene_model_index || 0;
                    defaultState.meta.product_index = parsedState.meta.product_index || 0;
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
        const variationIDs: Array<string> | undefined = this._mappedVariationSKUValues.get(productVariationSKU);

        if (!variationIDs) {
            console.warn("ConfiguratorState.setVariationSKU() - Variation SKU of " + productVariationSKU + " is not defined in any variations");

            return;
        }

        variationIDs.forEach((variationID: string) => {
            this.setVariationID(variationID);
        });
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
            metaData = metaData || { augment: true, type: "scenemodel" };
            metaData.type = "scenemodel";

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
            this._cachedSceneGraph = null;
        }
    }

    /**
     * Adds a new Product with meta-data into the Configurator State
     * 
     * @param productID - The Product ID to add
     * @param metaData - Arbitrary meta-data that can be used against certain operaions
     */
    public setProduct(productID: string, productVariationID: string, metaData: SceneProductDataMeta | null | undefined = null): void {
        if (productID && productVariationID) {
            metaData = metaData || { augment: true, type: "product" };
            metaData.type = "product";

            const states: Array<Array<any>> = this._state.states;
            const meta = this._state.meta;

            let newData: any[] | null = null;

            const existingData: any[] | null = this.findSceneProductIndex(productID);

            if (existingData) {
                newData = existingData;
            }
            else {
                newData = [];

                // push the new data into the stack
                states.push(newData);
            }

            newData[meta.product_index] = productID;
            newData[meta.product_variation_index] = productVariationID;
            newData[meta.meta_index] = metaData;
            this._cachedSceneGraph = null;
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
            metaData = metaData || { augment: true, type: "sceneproduct" };
            metaData.type = "sceneproduct";

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
            newData[meta.meta_index] = metaData;
            this._cachedSceneGraph = null;
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
                    type: "sceneproduct"
                }
            };

            // include the meta-data
            if (found.length === 3) {
                data.meta_data.augment = found[meta.meta_index].augment || true;
                data.meta_data.type = found[meta.meta_index].type || "sceneproduct";
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
                            type: "sceneproduct"
                        }
                    });
                }
                else if (productState.length === 3) {
                    callback({
                        scene_product_id: productState[meta.scene_product_index],
                        product_variation_id: productState[meta.product_variation_index],
                        meta_data: {
                            augment: productState[meta.meta_index].augment ?? true,
                            type: productState[meta.meta_index].type || "sceneproduct"
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
                    type: "sceneproduct"
                }
            };

            // include the meta-data
            if (found.length === 3) {
                data.meta_data.augment = found[meta.meta_index].augment || true;
                data.meta_data.type = found[meta.meta_index].type || "sceneproduct"
            }

            return data;
        }

        return null;
    }

    /**
     * @returns Returns the first reference of data in the stack that matches a type, otherwise returns null
     */
    public firstOfType(type: SceneProductDataMetaType): SceneProductData | null {
        const states: Array<Array<any>> = this._state.states;

        if (states.length > 0) {
            const meta = this._state.meta;

            const found = states.find((productState: Array<any>): boolean => {
                const check: any = productState[meta.scene_product_index];

                if (check !== null && check !== undefined) {
                    return productState.length === 3 && productState[meta.meta_index].type === type;
                }

                return false;
            });

            if (!found) {
                return null;
            }

            const data: SceneProductData = {
                scene_product_id: found[meta.scene_product_index],
                product_variation_id: found[meta.product_variation_index],
                meta_data: {
                    augment: found[meta.meta_index].augment || true,
                    type: found[meta.meta_index].type || type
                }
            };

            return data;
        }

        return null;
    }

    public firstActiveOfType(type: SceneProductDataMetaType): SceneProductData | null {
        const states: Array<Array<any>> = this._state.states;

        if (states.length > 0) {
            const meta = this._state.meta;

            const found = states.find((productState: Array<any>): boolean => {
                const check: any = productState[meta.scene_product_index];

                if (check !== null && check !== undefined) {
                    return productState.length === 3 && productState[meta.meta_index].type === type && productState[meta.meta_index].augment === true;
                }

                return false;
            });

            if (!found) {
                return null;
            }

            const data: SceneProductData = {
                scene_product_id: found[meta.scene_product_index],
                product_variation_id: found[meta.product_variation_index],
                meta_data: {
                    augment: found[meta.meta_index].augment || true,
                    type: found[meta.meta_index].type || type
                }
            };

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
     * Returns a cached Promise<Scene> for the given sceneID, firing at most one
     * API request per sceneID per page lifetime.  Both decodeState() and
     * decodeScene() share this cache so they never race each other.
     */
    private static _fetchScene(sceneID: string): Promise<Scene> {
        const cached = ConfiguratorState._sceneAPICache.get(sceneID);

        if (cached) {
            return cached;
        }

        const fscene: Scene = new Scene(sceneID);
        fscene.include(Project);
        fscene.include(SceneModel);
        fscene.include(Product);
        fscene.include(SceneProduct.include(Product.include(ProductVariation)));

        const promise = fscene.get() as Promise<Scene>;
        ConfiguratorState._sceneAPICache.set(sceneID, promise);

        // Bust the cache on failure so the next call retries
        promise.catch(() => {
            ConfiguratorState._sceneAPICache.delete(sceneID);
        });

        return promise;
    }

    /**
     * Decodes a previously generated state
     * @param sceneID
     * @param state
     * @param existingState - (optional) reuse this already-decoded instance instead of
     * parsing a fresh one, so mutations applied to it before this call are preserved
     * @returns
     */
    public static async decodeState(sceneID: string | null | undefined = null, state: string | null | undefined = null, existingState: ConfiguratorState | null | undefined = null): Promise<DecodedConfiguratorState> {
        if (!sceneID || !state) {
            throw new Error("ConfiguratorState.decodeState(sceneID, state) - sceneID and state must be defined");
        }

        const configState: ConfiguratorState = existingState ?? new ConfiguratorState(state);
        const scene: Scene = await ConfiguratorState._fetchScene(sceneID);

        return {
            scene: scene,
            state: configState
        };
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
        const scene: Scene = await ConfiguratorState._fetchScene(sceneID);

        const sceneProducts: Array<SceneProduct> = scene.relationships.filter(SceneProduct);
        const sceneModels: Array<SceneModel> = scene.relationships.filter(SceneModel);
        const products: Array<Product> = scene.relationships.filter(Product);

        // add our scene models
        sceneModels.forEach((sceneModel: SceneModel) => {
            configState.setSceneModel(sceneModel.id, {
                augment: sceneModel.attributes.include_in_augment,
                type: "scenemodel"
            });
        });

        // add our products - this is used when scene == furniture
        products.forEach((product: Product) => {
            if (product.attributes.product_variation_id) {
                configState.setProduct(product.id, product.attributes.product_variation_id, {
                    augment: true,
                    type: "product"
                });
            }
        });

        // add our scene products
        sceneProducts.forEach((sceneProduct: SceneProduct) => {
            const product: Product | undefined = sceneProduct.relationships.find(Product);

            if (product) {
                if (product.attributes.product_variation_id) {
                    configState.setSceneProduct(sceneProduct.id, product.attributes.product_variation_id, {
                        augment: sceneProduct.attributes.include_in_augment,
                        type: "sceneproduct"
                    });
                }

                // add the variation to an acceptible range of values
                const variations: Array<ProductVariation> = product.relationships.filter(ProductVariation);

                variations.forEach((variation: ProductVariation) => {
                    configState._mappedVariationIDValues.set(variation.id, sceneProduct.id);

                    if (variation.attributes.sku) {
                        const existingSKUs: Array<string> | undefined = configState._mappedVariationSKUValues.get(variation.attributes.sku);

                        if (existingSKUs) {
                            existingSKUs.push(variation.id);
                        }
                        else {
                            configState._mappedVariationSKUValues.set(variation.attributes.sku, [variation.id]);
                        }
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

    public encodeSceneGraphID(): Promise<string> {
        const graph: any = this.sceneGraph;
        const graphJSON: string = JSON.stringify(graph);

        // Return cached promise if the scene graph state hasn't changed.
        // Caching the Promise (not the resolved value) means concurrent in-flight
        // calls also share a single fetch rather than firing multiple requests.
        if (this._cachedSceneGraphID !== null && this._cachedSceneGraphJSON === graphJSON) {
            return this._cachedSceneGraphID;
        }

        // some scene-graphs are very large in size, we store it remotely
        // this storage will expire in 10 minutes so this is a non-permanent version
        // and is designed for quick ar
        const url: string = Server.location().type === 'staging' ? 'https://c.plattar.space/v3/redir/store' : 'https://c.plattar.com/v3/redir/store';

        this._cachedSceneGraphJSON = graphJSON;
        this._cachedSceneGraphID = fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                data: {
                    attributes: {
                        data: graph
                    }
                }
            })
        }).then(async (response) => {
            if (!response.ok) {
                throw new Error(`ConfiguratorState.encodeSceneGraphID() - network response was not ok ${response.status}`);
            }

            const data = await response.json();

            return data.data.id as string;
        }).catch((error: any) => {
            // Bust the cache on failure so the next call retries
            this._cachedSceneGraphID = null;
            this._cachedSceneGraphJSON = null;

            throw new Error(`ConfiguratorState.encodeSceneGraphID() - there was a request error to ${url}, error was ${error.message}`);
        });

        return this._cachedSceneGraphID;
    }

    /**
     * Compiles and returns the Dynamic Scene Graph (Updated for 2025 for DynamicAR)
     * NOTE: Eventually this structure should replace ConfiguratorState
     */
    public get sceneGraph(): any {
        if (this._cachedSceneGraph !== null) {
            return this._cachedSceneGraph;
        }

        const objects: Array<SceneProductData> = this.array();

        // in here we need to generate the schema input to be sent to the backend service
        const schema: any = {
            // ensure to only generate AR using files we pass into the backend
            strict: false,
            inputs: []
        };

        objects.forEach((object: SceneProductData) => {
            if (object.meta_data.type === "scenemodel") {
                const data: any = {
                    id: object.scene_product_id,
                    type: 'scenemodel',
                    visibility: object.meta_data.augment
                };

                schema.inputs.push(data);
            }
            else {
                const data: any = {
                    id: object.scene_product_id,
                    type: 'sceneproduct',
                    variation_id: object.product_variation_id,
                    visibility: object.meta_data.augment
                };

                schema.inputs.push(data);
            }
        });

        this._cachedSceneGraph = schema;

        return this._cachedSceneGraph;
    }
}