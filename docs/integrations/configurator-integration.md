[Back to Main](./)

### Configurator/Viewer Integrations with AR

The plattar-ar-adapter SDK is bundled with functionality that allows integrating a Plattar Configurator and 360 Viewer renderer into existing websites.

The Configurator exposes a set of interfaces and functionality that allows switching product states, loading existing configuration states and launching AR functionality for IOS and Android devices.

As of version `1.154.1` The SDK makes configuration as the default embed type. 

### Node Attributes

- **scene-id** (required)

Scene ID is acquired from the Plattar CMS. Every Scene in the Plattar Ecosystem is designated a unique GUID. Use that Scene ID to embed a particular Configurator onto your website.

```html
<plattar-embed scene-id="" />
```

- **show-ar** (optional)

The `show-ar` attribute will display a UI button that allows a user to launch an Android or IOS AR experience for a provided scene configuration. This attribute is ignored on desktop platforms. This attribute is `false` by default.

```html
<plattar-embed scene-id="" show-ar="true" />
```

- **width & height** (optional)

The `width` and `height` attributes will scale the internal renderer and QR Code to the provided size. These attributes are `500px` by default.

```html
<plattar-embed scene-id="" width="700px" height="700px" />
```

- **ar-mode** (optional)

The `ar-mode` attribute controls how AR is launched. The default setting is `generated` which will bundle and generate an AR file using all Products and Variations in the Scene. 

An alternative mode is using `inherited` which will use the pre-generated/user-uploaded `glb`, `usdz` and `reality` files attached to Products and Variations. When using `inherited` mode, no combinations will be performed so its only suitable when there is a single Product/Variation in the Scene.

This attribute is `generated` by default.

```html
<plattar-embed scene-id="" ar-mode="generated" />
```

- **show-ui** (optional)

The `show-ui` attribute allows embedding the configurator bundled with a Plattar designed default UI solution that allows users to switch product variations. This attribute is `false` by default.

```html
<plattar-embed scene-id="" show-ui="false" />
```

### Renderer Functions for Configurator

The following renderer functions are available

- Activates the provided Product Variation using a Variation ID. The Variation ID must be a member of a Scene Product in the Scene. The argument can be either a single Variation ID or an Array of Variation ID's.

```js
selectVariation(variationID:string | Array<string>);
```

- Activates the provided Product Variation using a user-defined Variation SKU. The Variation SKU must be a member of a Scene Product in the Scene. The argument can be either a single Variation SKU or an Array of Variation SKU's. 

```js
selectVariationSKU(variationSKU:string | Array<string>);
```

### The Scene ID

For individual Scene integrations, the `Scene ID` can be copied directly from the Plattar CMS. This ID is static for the duration of the Scene's existance and will not change when the scene is modified. Each Scene contains a unique GUID (Global Unique Identifier).

- Click on your Project in the Plattar CMS and navigate to the Scene List

<img width="500" alt="" src="https://stoplight.io/api/v1/projects/cHJqOjEwODA2Nw/images/vZur3Uvu91Q">

- Click on your Scene to enter the Scene Editor

<img width="500" alt="" src="https://stoplight.io/api/v1/projects/cHJqOjEwODA2Nw/images/kCTd8vENAi8">

- Copy the `Scene ID` from the Scene Editor and use as part of the `scene-id` attribute in the integration

### Multiple Scene ID's

For multiple Scene integrations, the embed codes can be generated and exported directly from the Plattar CMS. This exported JSON file can then be used to manage the integrations of multiple scenes.

- Click on your Project in the Plattar CMS and navigate to the Scene List
- Select the Scene's ready for integration
- Export the generated JSON file containing all the integration URL's and codes for the selection

<img width="500" alt="" src="https://stoplight.io/api/v1/projects/cHJqOjEwODA2Nw/images/FLo5IfUbw1w">

### Configurator/Viewer Integration Example with Variation Switching

For the purposes of this example, we use a sample `scene-id` of `c49e5c30-469c-11ec-963f-ddbb1b50e719`.

This scene contains multiple products with multiple variations that can be configured using a simple UI. It performs the following functionality.

- Configure multiple products with variations using `selectVariation` and a simple UI
- Generate QR Code for launching AR Mode for Desktop against a specific configuration
- Launch AR Experience when viewed from mobile

```html title="Scene Configurator Integration Example using plattar-ar-adapter SDK"
<html>

<head>
    <title>Scene Product Variation Selection Experience</title>

    <script
        src="https://cdn.jsdelivr.net/npm/@plattar/plattar-ar-adapter/build/es2019/plattar-ar-adapter.min.js"></script>
</head>

<body>
    <form id="var_form" hidden>
        <b>Jacket Variation</b>
        <select id="jacket_variation"
            onchange="selectVariation('1a823d6e-f512-d2f3-a63e-1f04961990e7','jacket_variation')">
            <option>274e2500-469a-11ec-b41a-d13cb837ff25</option>
            <option>ae3d2820-469a-11ec-a9a8-8911082c07db</option>
            <option>14e29d60-4caf-11ec-820c-b9f13cbcd4ce</option>
        </select>
        <br>
        <b>Arm Bands</b>
        <select id="arm_bands" onchange="selectVariation('5f3b0a61-2851-756e-f071-ea56488e0d87','arm_bands')">
            <option>c1faf310-469d-11ec-bd80-4bf29d3af627</option>
            <option>235ad470-469c-11ec-8806-5d3213072eb2</option>
            <option>eb388590-469b-11ec-ab71-27386f2be00b</option>
        </select>
        <br>
        <b>Badges</b>
        <select id="badges" onchange="selectVariation('1356b6f2-7848-fa5e-dc3e-c1c8ab85440c', 'badges')">
            <option>d72dec70-469d-11ec-b69b-4b6b13740146</option>
            <option>cd19eed0-469b-11ec-bbee-9bf588efe3fc</option>
            <option>ac2716e0-469b-11ec-8731-15939e941cff</option>
            <option>71ebf170-4caf-11ec-8d11-a5a3e5a309a5</option>
        </select>
        <br>
        <b>Chest Pockets</b>
        <select id="chest_pockets" onchange="selectVariation('861e0412-b0e7-be56-a701-49815141cf02', 'chest_pockets')">
            <option>2f477530-469b-11ec-8316-1595e164dc32</option>
            <option>0b4f1be0-469b-11ec-bf54-230aaa9b198e</option>
            <option>625a7280-469b-11ec-840e-593a36373cc0</option>
            <option>7ba2b5e0-469b-11ec-a212-e7b40661c3c2</option>
            <option>01846720-4cb0-11ec-a146-f5678d63858a</option>
            <option>12c3ced0-4cb0-11ec-a28b-a924f836314f</option>
        </select>
        <br>
        <b>Velcro Cuff</b>
        <select id="velcro_cuff" onchange="selectVariation('988074ac-7e1e-b69f-9141-746f6f71eb49', 'velcro_cuff')">
            <option>58fdefb0-4cb0-11ec-8210-6565844cb300</option>
            <option>71166d40-4cb0-11ec-a74d-57772fb7feee</option>
            <option>92b38d30-4cb0-11ec-86e3-a154d751f7c5</option>
            <option>b081f2e0-4cb0-11ec-9185-2b521eb35dc9</option>
        </select>
        <p>Your Configuration State: <input type="text" id="config_state" size="60"></p>
        <button type="button" onclick="launchAR()">Launch AR</button>
    </form>
    <plattar-embed id="embed" scene-id="c49e5c30-469c-11ec-963f-ddbb1b50e719" embed-type="configurator" show-ar="true"
        init="viewer">
    </plattar-embed>

    <script>
        const embed = document.getElementById("embed");

        if (embed.viewer) {
            // wait until viewer is loaded, then show our forms
            embed.viewer.context.setLoading = () => {
                const form = document.getElementById("var_form");

                form.removeAttribute("hidden");

                const config = document.getElementById("config_state");

                setConfigState();
            };
        }

        // this is called when the dropdowns change
        function selectVariation(sceneProductID, id) {
            // these are the scene product ID's mapped into our ID's
            const dropdown = document.getElementById(id);

            // get the user selections
            const selection = dropdown.options[dropdown.selectedIndex].text;

            // perform selection in the Plattar Viewer
            embed.viewer.messenger.selectSceneProductVariation(sceneProductID, selection).then(() => {
                // refresh the configuration state
                setConfigState();
            }).catch((err) => {
                console.error(err);
            });
        }

        // this sets the configuration state for the user
        function setConfigState() {
            const config = document.getElementById("config_state");

            embed.viewer.messenger.getConfigurationState().then((state) => {
                config.value = state;
            }).catch((err) => {
                console.error(err);
            });
        }

        // this will attempt to launch AR Mode
        // if on desktop, a QR Code will be rendered instead
        function launchAR() {
            const config = document.getElementById("config_state");

            // first, we re-set the previously saved configuration state
            embed.setAttribute("config-state", config.value);

            // then, we try to launch AR Mode if available
            if (PlattarARAdapter.Util.canAugment()) {
                embed.startAR().then(() => {
                    // nada
                }).catch((err) => {
                    renderQRCode();
                });
            }
            else {
                // fallback to rendering QR Code
                renderQRCode();
            }
        }

        // this will render a QR Code that takes the user to a specified
        // configuration
        function renderQRCode() {
            embed.startQRCode(
            ).then(() => {
                // nada
            }).catch((err) => {
                console.error(err);
            });
        }
    </script>
</body>

</html>
```

<img width="500" alt="The Example Scene should look like the following image" src="https://stoplight.io/api/v1/projects/cHJqOjEwODA2Nw/images/2DMkUJTYglE">

### Codepan Live Example

<iframe height="300" style="width: 100%;" scrolling="no" title="Configurator Integration" src="https://codepen.io/plattar/embed/VwxWJgL?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/plattar/pen/VwxWJgL">
  Configurator Integration</a> by Plattar (<a href="https://codepen.io/plattar">@plattar</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>