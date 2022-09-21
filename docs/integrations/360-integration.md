[Back to Main](../README.md)

### 360 Viewer Integrations with AR

The plattar-ar-adapter SDK is bundled with functionality that allows integrating a Plattar 360 Viewer into existing websites.

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

### The Scene ID

For individual Scene integrations, the `Scene ID` can be copied directly from the Plattar CMS. This ID is static for the duration of the Scene's existance and will not change when the scene is modified. Each Scene contains a unique GUID (Global Unique Identifier).

- Click on your Project in the Plattar CMS and navigate to the Scene List

<img width="500" alt="" src="https://stoplight.io/api/v1/projects/cHJqOjEwODA2Nw/images/wZQoPLD4f7U">

- Click on your Scene to enter the Scene Editor

<img width="500" alt="" src="https://stoplight.io/api/v1/projects/cHJqOjEwODA2Nw/images/1IKJJStKDhE">

- Copy the `Scene ID` from the Scene Editor and use as part of the `scene-id` attribute in the integration

### Multiple Scene ID's

For multiple Scene integrations, the embed codes can be generated and exported directly from the Plattar CMS. This exported JSON file can then be used to manage the integrations of multiple scenes.

- Click on your Project in the Plattar CMS and navigate to the Scene List
- Select the Scene's ready for integration
- Export the generated JSON file containing all the integration URL's and codes for the selection

<img width="500" alt="" src="https://stoplight.io/api/v1/projects/cHJqOjEwODA2Nw/images/FLo5IfUbw1w">

### 360 Viewer Integration Example

For the purposes of this example, we use a sample `scene-id` of `1adeea20-5e04-11ec-8d4e-6d57c9a95cc5`.

This scene contains a single product with multiple variations that can be configured using a simple UI. It performs the following functionality.

- Generate QR Code for launching AR
- Launch AR Experience when viewed from mobile
- Launch 360 Viewer on Desktop and Mobile

```html title="360 Viewer Integration Example"
<html>

<head>
    <title>360 Viewer Integration</title>
    <script
        src="https://cdn.jsdelivr.net/npm/@plattar/plattar-ar-adapter/build/es2019/plattar-ar-adapter.min.js"></script>
</head>

<body>
    <plattar-embed id="embed" scene-id="1adeea20-5e04-11ec-8d4e-6d57c9a95cc5" width="512px" height="512px">
    </plattar-embed>
    <button type="button" onclick="startAR()">Launch AR</button>
    <button type="button" onclick="startViewer()">Launch 360 Viewer</button>


    <script>
        function startAR() {
            const embed = document.getElementById("embed");

            if (embed) {
                // quick check if AR is available
                if (PlattarARAdapter.Util.canAugment()) {
                    // attempt to launch AR if possible
                    embed.startAR().then(() => {
                        // AR was successfully launched, use this to run
                        // other logic if needed
                    }).catch((err) => {
                        // AR is not possible, fallback to QR Code rendering
                        embed.startQRCode();
                    });
                }
                else {
                    embed.startQRCode();
                }
            }
        }

        function startViewer() {
            const embed = document.getElementById("embed");

            if (embed) {
                embed.startViewer().then(() => {
                    // Viewer was successfully launched, use this to run
                    // other logic if needed
                }).catch((err) => {
                    // Viewer is not possible
                    // run failure logic here
                });
            }
        }
    </script>
</body>

</html>
```

<img width="500" alt="The Example Scene should look like the following image" src="https://stoplight.io/api/v1/projects/cHJqOjEwODA2Nw/images/f6MUkGU6lgE">

### Codepan Live Example

<iframe height="300" style="width: 100%;" scrolling="no" title="360 Integration" src="https://codepen.io/plattar/embed/vYjZqvL?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/plattar/pen/vYjZqvL">
  360 Integration</a> by Plattar (<a href="https://codepen.io/plattar">@plattar</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>