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
    meta_data: {
        augment: boolean;
    }
}

export class ConfiguratorState {

    private readonly _state: ConfiguratorStateData;

    constructor(state: string | null | undefined = null) {
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
     * Adds a new Scene Product/Variation combo with meta-data into the Configurator State
     * 
     * @param sceneProductID - The Scene Product ID to be used (as defined in Plattar CMS)
     * @param productVariationID - The Product Variation ID to be used (as defined in Plattar CMS)
     * @param metaData - Arbitrary meta-data that can be used against certain operaions
     */
    public addSceneProduct(sceneProductID: string, productVariationID: string, metaData: any | null | undefined = null): void {
        if (sceneProductID && productVariationID) {
            const states: Array<Array<any>> = this._state.states;
            const meta = this._state.meta;

            const newData: any = [];

            newData.splice(meta.scene_product_index, 0, sceneProductID);
            newData.splice(meta.product_variation_index, 0, productVariationID);

            if (metaData) {
                newData.splice(meta.meta_index, 0, metaData);
            }

            states.push(newData);
        }
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
                            augment: true
                        }
                    });
                }
                else if (productState.length === 3) {
                    callback({
                        scene_product_id: productState[meta.scene_product_index],
                        product_variation_id: productState[meta.product_variation_index],
                        meta_data: {
                            augment: productState[meta.meta_index].augment || true
                        }
                    });
                }
            });
        }
    }

    public static decode(state: string): ConfiguratorState {
        return new ConfiguratorState(state);
    }

    public encode(): string {
        return btoa(JSON.stringify(this._state));
    }
}