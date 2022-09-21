[Back to Main](../../README.md)

### Working with user-defined SKU field

The following examples use the latest version of [plattar-api](https://github.com/Plattar/plattar-api) SDK that allows interfacing with the Plattar REST API.

The SKU field can be defined via thhe Plattar CMS in either the **Product** or **ProductVariation** objects.

#### Get user-defined sku from Product object using Scene ID

![Screen Shot 2022-02-22 at 10.32.59 am.jpg](https://stoplight.io/api/v1/projects/cHJqOjEwODA2Nw/images/ynGy2OalAqY)

The following code example shows how to get the user-defined **SKU** field from the Product object in the provided Scene. Note that a Scene can have many products.

For the purposes of this example, we use a pre-defined scene with id `c0afc220-8a0f-11ec-97f3-d95bfb17823a`

```html
<html>

<head>
    <title>Get Product SKU Example</title>
    <script src="https://cdn.jsdelivr.net/npm/@plattar/plattar-api/build/es2019/plattar-api.min.js"></script>
</head>

<body>
    <script>
        // This is equivalent to performing GET as follows
        // GET https://app.plattar.com/api/v2/scene/c0afc220-8a0f-11ec-97f3-d95bfb17823a?include=sceneproduct,sceneproduct.product
        const scene = new Plattar.Scene("c0afc220-8a0f-11ec-97f3-d95bfb17823a");
        scene.include(Plattar.SceneProduct);
        scene.include(Plattar.SceneProduct.include(Plattar.Product));

        scene.get().then((scene) => {
            // grab the scene-products list from the scene instance
            const sceneProducts = scene.relationships.filter(Plattar.SceneProduct);

            // loop through all scene-products
            sceneProducts.forEach((sceneProduct) => {
                // get the product from the scene-product instance
                const product = sceneProduct.relationships.find(Plattar.Product);

                if (product) {
                    // print the SKU
                    console.log("---------");
                    console.log("SceneProduct id = " + sceneProduct.id);
                    console.log("Product id = " + product.id);
                    console.log("Product sku (user-defined) = " + product.attributes.sku);
                }
            });
        });
    </script>

</body>
</html>
```

#### Get user-defined sku from Product Variation object using Scene ID

![Screen Shot 2022-02-22 at 10.33.15 am.jpg](https://stoplight.io/api/v1/projects/cHJqOjEwODA2Nw/images/3tkyu6UT8es)

The following code example shows how to get the user-defined **SKU** field from the ProductVariation object in the provided Scene. Note that a Scene can have many products and products can have many product variations.

For the purposes of this example, we use a pre-defined scene with id `c0afc220-8a0f-11ec-97f3-d95bfb17823a`

```html
<html>

<head>
    <title>Get Product SKU Example</title>
    <script src="https://cdn.jsdelivr.net/npm/@plattar/plattar-api/build/es2019/plattar-api.min.js"></script>
</head>

<body>
    <script>
        // This is equivalent to performing GET as follows
        // GET https://app.plattar.com/api/v2/scene/c0afc220-8a0f-11ec-97f3-d95bfb17823a?include=sceneproduct,sceneproduct.product,sceneproduct.product.productvariation
        const scene = new Plattar.Scene("c0afc220-8a0f-11ec-97f3-d95bfb17823a");
        scene.include(Plattar.SceneProduct);
        scene.include(Plattar.SceneProduct.include(Plattar.Product));
        scene.include(Plattar.SceneProduct.include(Plattar.Product.include(Plattar.ProductVariation)));

        scene.get().then((scene) => {
            // grab the scene-products list from the scene instance
            const sceneProducts = scene.relationships.filter(Plattar.SceneProduct);

            // loop through all scene-products
            sceneProducts.forEach((sceneProduct) => {
                // get the product from the scene-product instance
                const product = sceneProduct.relationships.find(Plattar.Product);

                if (product) {
                    // get the product-variation list from the product instance
                    const productVariations = product.relationships.filter(Plattar.ProductVariation);

                    productVariations.forEach((productVariation) => {
                        // print the SKU
                        console.log("---------");
                        console.log("SceneProduct id = " + sceneProduct.id);
                        console.log("Product id = " + product.id);
                        console.log("Product sku (user-defined) = " + product.attributes.sku);
                        console.log("ProductVariation id = " + productVariation.id);
                        console.log("ProductVariation sku (user-defined) = " + productVariation.attributes.sku);
                    });
                }
            });
        });
    </script>

</body>

</html>
```