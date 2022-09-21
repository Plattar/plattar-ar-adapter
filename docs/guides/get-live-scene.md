[Back to Main](../../README.md)

### Working with Live Scenes

The following examples use the latest version of [plattar-api](https://github.com/Plattar/plattar-api) SDK that allows interfacing with the Plattar REST API.

In Plattar CMS, **Scenes** or **Products** can have their status changed according to readiness or production timings. This example allows fetching scenes that have been set to **Live**. 

#### Get Live Scenes using Project ID

![Screen Shot 2022-03-28 at 11.54.57 am.png](https://stoplight.io/api/v1/projects/cHJqOjEwODA2Nw/images/Y9OPi7zsyDg)

The following code example shows how to get a list of live scenes from a project.

For the purposes of this example, we use a pre-defined project with id `dae374f0-5dfd-11ec-8865-c5cc93e802d5`

```html
<html>

<head>
    <title>Get All Live Scenes</title>

    <script src="https://cdn.jsdelivr.net/npm/@plattar/plattar-api/build/es2019/plattar-api.min.js"></script>
</head>

<body>
    <script>
        const application = new Plattar.Project("dae374f0-5dfd-11ec-8865-c5cc93e802d5");
        // include the scenes in the query
        application.include(Plattar.Scene);

        application.get().then((app) => {
            // grab all scenes
            const scenes = app.relationships.filter(Plattar.Scene);

            // grab all scenes that are live as an array
            const liveScenes = scenes.filter((res) => {
                return res.attributes.custom_json.status === "live";
            });

            // loop and print the ID of scenes
            liveScenes.forEach((scene) => {
                console.log("id: " + scene.id + " title: " + scene.attributes.title);
            });
        });
    </script>
</body>

</html>
```

#### Get Product/Variation data from Live Scene

The following example will fetch a list of **Products** and **Variations** from an active scene. This information can be used to initialise other Plattar Embed SDK routines.

```html
<html>

<head>
    <title>Get All Scenes</title>

    <script src="https://cdn.jsdelivr.net/npm/@plattar/plattar-api/build/es2019/plattar-api.min.js"></script>
</head>

<body>
    <script>
        const application = new Plattar.Project("dae374f0-5dfd-11ec-8865-c5cc93e802d5");
        // include the scenes in the query
        application.include(Plattar.Scene);

        application.get().then((app) => {
            // grab all scenes
            const scenes = app.relationships.filter(Plattar.Scene);

            // grab all scenes that are live as an array
            const liveScenes = scenes.filter((res) => {
                return res.attributes.custom_json.status === "live";
            });

            // loop through all active scenes
            liveScenes.forEach((liveScene) => {
                // fetch product and variation from scene
                const scene = new Plattar.Scene(liveScene.id);
                // SceneProduct is what is used for curated scenes
                scene.include(Plattar.SceneProduct);
                // Product is what is used against a Model (non curated) scenes
                scene.include(Plattar.Product);
                scene.include(Plattar.SceneProduct.include(Plattar.Product));

                scene.get().then((scene) => {
                    const products = scene.relationships.filter(Plattar.Product);

                    if (products.length > 0) {
                        // print products and variations
                        console.log("product-variation for scene " + scene.attributes.title);
                        products.forEach((product) => {
                            console.log("product_id=" + product.id + "\nvariation_id=" + product.attributes.product_variation_id);
                        });
                    }
                }).catch((err) => {
                    console.error(err);
                });
            });
        }).catch((err) => {
            console.error(err);
        });
    </script>
</body>

</html>
```