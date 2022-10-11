[Back to Main](./)

### Virtual Try-On (VTO) Integration

The plattar-ar-adapter SDK is bundled with functionality that allows integrating a Plattar VTO renderer into existing websites.

The VTO exposes a set of interfaces and functionality that allows switching product states, loading existing configuration states and launching AR functionality for IOS, Android and Desktop.

### Node Attributes

- **scene-id** (required)

Scene ID is acquired from the Plattar CMS. Every Scene in the Plattar Ecosystem is designated a unique GUID. Use that Scene ID to embed a particular VTO onto your website.

```html
<plattar-embed scene-id="" />
```

- **embed-type** (required)

The `embed-type` attribute should always equal to `vto` for a vto embed. This will expose the underlying interfaces and AR functionality.

```html
<plattar-embed scene-id="" embed-type="vto" />
```

- **config-state** (optional)

The `config-state` attribute allows loading a previously saved configuration state. Every configurator loads with an initial state as defined in the Plattar CMS however this state can be changed by the user as they interact with the Configurator. This attribute is `null` by default.

```html
<plattar-embed scene-id="" embed-type="vto" config-state="" />
```

- **show-ar** (optional)

The `show-ar` attribute will display a UI button that allows a user to launch an IOS AR experience for a provided scene configuration. This attribute is ignored on desktop and android platforms. This attribute is `false` by default.

```html
<plattar-embed scene-id="" embed-type="vto" show-ar="true" />
```

- **width & height** (optional)

The `width` and `height` attributes will scale the internal renderer to the provided size. These attributes are `500px` by default.

```html
<plattar-embed scene-id="" embed-type="vto" width="700px" height="700px" />
```

- **ar-mode** (optional)

The `ar-mode` attribute controls how AR is launched. The default setting is `generated` which will bundle and generate an AR file using all Products and Variations in the Scene. 

An alternative mode is using `inherited` which will use the pre-generated/user-uploaded `glb`, `usdz` and `reality` files attached to Products and Variations. When using `inherited` mode, no combinations will be performed so its only suitable when there is a single Product/Variation in the Scene.

This attribute is `generated` by default.

```html
<plattar-embed scene-id="" embed-type="vto" ar-mode="generated" />
```

### Messenger Functions for VTO

These messenger functions are available when the node has `embed-type="vto"` enabled.

- Changes the Product Variation for the provided Scene Product and Variation. The Variation ID must be a member of the Scene Product.

```js
selectSceneProductVariation(sceneProductID:string, variationID:string);
```

- Generates and returns the current internal configuration state of the Scene. This configuration state can be used in conjunction with the `config-state` attribute to re-load a previous configuration.

```js
getConfigurationState();
```

### The Scene ID

For individual Scene integrations, the `Scene ID` can be copied directly from the Plattar CMS. This ID is static for the duration of the Scene's existance and will not change when the scene is modified. Each Scene contains a unique GUID (Global Unique Identifier).

Ensure that your Scene is a proper `VTO` Scene with a Face Marker attached. Use the virtual face as a guideline to position your content.

- Click on your Project in the Plattar CMS and navigate to the Scene List

<img width="500" alt="" src="https://stoplight.io/api/v1/projects/cHJqOjEwODA2Nw/images/RPtJSyKdrqI">

- Click on your Scene to enter the Scene Editor

<img width="500" alt="" src="https://stoplight.io/api/v1/projects/cHJqOjEwODA2Nw/images/TioIPwFdtfg">

- Copy the `Scene ID` from the Scene Editor and use as part of the `scene-id` attribute in the integration

### Multiple Scene ID's

For multiple Scene integrations, the embed codes can be generated and exported directly from the Plattar CMS. This exported JSON file can then be used to manage the integrations of multiple scenes.

- Click on your Project in the Plattar CMS and navigate to the Scene List
- Select the Scene's ready for integration
- Export the generated JSON file containing all the integration URL's and codes for the selection

<img width="500" alt="" src="https://stoplight.io/api/v1/projects/cHJqOjEwODA2Nw/images/FLo5IfUbw1w">

### VTO Embed Example

For the purposes of this example, we use a sample `scene-id` of `c0afc220-8a0f-11ec-97f3-d95bfb17823a`.

This scene contains multiple products with variations that can be configured using a simple UI. It performs the following functionality.

- Configure products with variations using `selectSceneProductVariation` and a simple UI
- Launch Reality VTO Experience for supported IOS Devices
- Launch 360 Viewer Experience for IOS, Android and Desktop Devices
- Launch VTO Experience for Desktop and Android Devices

```html title="Plattar VTO Integration Example using plattar-ar-adapter SDK"
<html>

<head>
    <title>Plattar VTO Integration Example</title>
    <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
    <style type="text/css">
        body {
            font-family: sans-serif;
        }
    </style>
    <script
        src="https://cdn.jsdelivr.net/npm/@plattar/plattar-ar-adapter/build/es2019/plattar-ar-adapter.min.js"></script>
</head>

<body>
    <!-- UI Organisation -->
    <form id="ios_mobile">
        <b>This button will launch the IOS Reality Composer VTO Experience</b>
        <button type="button" onclick="launchAR()">Launch IOS AR</button>
    </form>
    <form id="viewer_360">
        <b>This button will launch a 360/Viewer Experience for Android, IOS and Desktop</b>
        <button type="button" onclick="launchViewer()">Launch 360 Viewer</button>
    </form>
    <form id="vto">
        <b>This Button will launch the Android/Desktop VTO Experience</b>
        <button type="button" onclick="launchVTO()">Launch VTO</button>
    </form>
    <form id="vto_selectors" hidden>
        <b>Select Glasses Variation</b>
        <select id="glasses_variation"
            onchange="selectVariation('4f49055c-a30d-50a6-b4e0-7152cc9f6f3f','glasses_variation')">
            <option value='99158d40-8a0f-11ec-af7c-ab107e3c74a9'>Glasses 1</option>
            <option value='a24e23d0-8a0f-11ec-ac25-81e812550857'>Glasses 2</option>
        </select>
    </form>
    <!-- This is the embed that will be used for Desktop/Android VTO -->
    <plattar-embed id="embed_vto" scene-id="c0afc220-8a0f-11ec-97f3-d95bfb17823a" embed-type="vto">
    </plattar-embed>
    <!-- This is the embed that will be used for Desktop/Mobile 360 -->
    <plattar-embed id="embed_viewer" scene-id="c0afc220-8a0f-11ec-97f3-d95bfb17823a" embed-type="configurator">
    </plattar-embed>
    <script>
        // Decide which UI components we want to display and which to keep hidden
        const iosMobile = document.getElementById("ios_mobile");
        const viewer360 = document.getElementById("viewer_360");
        const vto = document.getElementById("vto");
        // Test for IOS Mobile and RealityKit support
        if (PlattarARAdapter.Util.canAugment() && PlattarARAdapter.Util.canRealityViewer()) {
            // disable the desktop/android vto button
            vto.querySelector('button').disabled = true;
        }
        // Test for Desktop and Android Mobile
        else {
            // disable the ios vto button
            iosMobile.querySelector('button').disabled = true;
        }

        // This will launch a Reality VTO for provided scene-id
        // requires embed-type="vto" otherwise AR will be world placement
        function launchAR() {
            const embed = document.getElementById("embed_vto");
            if (embed) {
                embed.startAR()
                    .then(() => {
                        // AR launched successfully
                    })
                    .catch((err) => {
                        // AR failed to launch
                        console.error(err);
                    });
            }
        }
        // This will remove the VTO experience and start a 360 experience
        // 360 Viewer works on all devices
        function launchViewer() {
            const embedVTO = document.getElementById("embed_vto");
            // remove the renderer from DOM (if any)
            if (embedVTO) {
                embedVTO.removeRenderer();
            }
            // hide the selectors for changing variations
            const selectors = document.getElementById("vto_selectors");
            selectors.hidden = true;
            const embedViewer = document.getElementById("embed_viewer");
            // start the 360 viewer
            if (embedViewer) {
                embedViewer.startViewer()
                    .then(() => {
                        // Viewer launched successfully
                    })
                    .catch((err) => {
                        // Viewer failed to launch
                        console.error(err);
                    });
            }
        }
        // This will remove the 360 experience and start a VTO experience
        // VTO Experiences works on Desktop and Android devices
        function launchVTO() {
            const embedViewer = document.getElementById("embed_viewer");
            // remove the renderer from DOM (if any)
            if (embedViewer) {
                embedViewer.removeRenderer();
            }
            const embedVTO = document.getElementById("embed_vto");
            // start the VTO experience
            if (embedVTO) {
                // show the selectors for changing variations
                const selectors = document.getElementById("vto_selectors");
                selectors.hidden = false;
                embedVTO.startViewer()
                    .then(() => {
                        // Viewer launched successfully
                    })
                    .catch((err) => {
                        // Viewer failed to launch
                        console.error(err);
                    });
            }
        }
        // This is called when the dropdowns change
        // used to switch the variations
        function selectVariation(sceneProductID, id) {
            // these are the scene product ID's mapped into our ID's
            const dropdown = document.getElementById(id);
            // get the user selections
            const selection = dropdown.options[dropdown.selectedIndex].getAttribute('value');
            const embedVTO = document.getElementById("embed_vto");
            // perform selection in the Plattar Viewer
            embedVTO.viewer.messenger.selectSceneProductVariation(sceneProductID, selection)
                .then(() => {
                    // Successfully changed
                })
                .catch((err) => {
                    console.error(err);
                });
        }
    </script>
</body>

</html>
```

### VTO Embed Example using Configurator State

Unlike the previous example, this example uses a Configurator State system to set the `config-state` of the embed before launching an experience. This allows pre-setting/changing product variations without running the internal Plattar Renderer. It acts as an alternative to the `selectSceneProductVariation` which only works when the renderer is running.

For the purposes of this example, we use a sample `scene-id` of `c0afc220-8a0f-11ec-97f3-d95bfb17823a`.

This scene contains multiple products with variations that can be configured using a Configurator State. It performs the following functionality.

- Launch Reality VTO Experience for supported IOS Devices
- Launch 360 Viewer Experience for IOS, Android and Desktop Devices
- Launch VTO Experience for Desktop and Android Devices

```html title="Plattar VTO Embed Example using plattar-ar-adapter SDK and Configurator State"
<html>

<head>
    <title>Plattar VTO Embed Example using Product Variations</title>
    <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
    <style type="text/css">
        body {
            font-family: sans-serif;
        }
    </style>
    <script
        src="https://cdn.jsdelivr.net/npm/@plattar/plattar-ar-adapter/build/es2019/plattar-ar-adapter.min.js"></script>
</head>

<body>
    <!-- UI Organisation -->
    <form id="ios_mobile">
        <b>This button will launch the IOS Reality Composer VTO Experience</b>
        <button type="button" onclick="launchAR()">Launch IOS AR</button>
    </form>
    <form id="viewer_360">
        <b>This button will launch a 360/Viewer Experience for Android, IOS and Desktop</b>
        <button type="button" onclick="launchViewer()">Launch 360 Viewer</button>
    </form>
    <form id="vto">
        <b>This Button will launch the Android/Desktop VTO Experience</b>
        <button type="button" onclick="launchVTO()">Launch VTO</button>
    </form>
    <!-- This is the embed that will be used for Desktop/Android VTO -->
    <plattar-embed id="embed_vto" scene-id="c0afc220-8a0f-11ec-97f3-d95bfb17823a" embed-type="vto">
    </plattar-embed>
    <!-- This is the embed that will be used for Desktop/Mobile 360 -->
    <plattar-embed id="embed_viewer" scene-id="c0afc220-8a0f-11ec-97f3-d95bfb17823a" embed-type="configurator">
    </plattar-embed>
    <script>
        // Decide which UI components we want to display and which to keep hidden
        const iosMobile = document.getElementById("ios_mobile");
        const viewer360 = document.getElementById("viewer_360");
        const vto = document.getElementById("vto");

        // Test for IOS Mobile and RealityKit support
        if (PlattarARAdapter.Util.canAugment() && PlattarARAdapter.Util.canRealityViewer()) {
            // disable the desktop/android vto button
            vto.querySelector('button').disabled = true;
        }
        // Test for Desktop and Android Mobile
        else {
            // disable the ios vto button
            iosMobile.querySelector('button').disabled = true;
        }

        // setup a ConfiguratorState instance to set variations to specific products
        // once set into <plattar-embed /> config-state attribute, the embed will
        // use whatever variation is set for visualisation
        const configState = new PlattarARAdapter.ConfiguratorState();
        const sceneProductID = "4f49055c-a30d-50a6-b4e0-7152cc9f6f3f";
        // or use
        //const variationID = "99158d40-8a0f-11ec-af7c-ab107e3c74a9";
        const variationID = "a24e23d0-8a0f-11ec-ac25-81e812550857";

        // sets the variation for a specific product
        configState.addSceneProduct(sceneProductID, variationID);

        // This will launch a Reality VTO for provided scene-id
        // requires embed-type="vto" otherwise AR will be world placement
        function launchAR() {
            const embed = document.getElementById("embed_vto");
            if (embed) {
                // sets the configuration state for our desired product and variation
                embed.setAttribute("config-state", configState.encode());

                embed.startAR()
                    .then(() => {
                        // AR launched successfully
                    })
                    .catch((err) => {
                        // AR failed to launch
                        console.error(err);
                    });
            }
        }
        // This will remove the VTO experience and start a 360 experience
        // 360 Viewer works on all devices
        function launchViewer() {
            const embedVTO = document.getElementById("embed_vto");
            // remove the renderer from DOM (if any)
            if (embedVTO) {
                embedVTO.removeRenderer();
            }
            // hide the selectors for changing variations
            const embedViewer = document.getElementById("embed_viewer");
            // start the 360 viewer
            if (embedViewer) {
                embedViewer.startViewer()
                    .then(() => {
                        // Viewer launched successfully
                    })
                    .catch((err) => {
                        // Viewer failed to launch
                        console.error(err);
                    });
            }
        }

        // This will remove the 360 experience and start a VTO experience
        // VTO Experiences works on Desktop and Android devices
        function launchVTO() {
            const embedViewer = document.getElementById("embed_viewer");
            // remove the renderer from DOM (if any)
            if (embedViewer) {
                embedViewer.removeRenderer();
            }
            const embedVTO = document.getElementById("embed_vto");
            // start the VTO experience
            if (embedVTO) {
                // sets the configuration state for our desired product and variation
                embedVTO.setAttribute("config-state", configState.encode());

                embedVTO.startViewer()
                    .then(() => {
                        // Viewer launched successfully
                    })
                    .catch((err) => {
                        // Viewer failed to launch
                        console.error(err);
                    });
            }
        }
    </script>
</body>

</html>
```

### Codepan Live Example

<iframe height="300" style="width: 100%;" scrolling="no" title="VTO Integration" src="https://codepen.io/plattar/embed/MWGoMLB?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/plattar/pen/MWGoMLB">
  VTO Integration</a> by Plattar (<a href="https://codepen.io/plattar">@plattar</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>