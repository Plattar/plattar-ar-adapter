[Back to Main](./)

### QRCode Scanning Options

The plattar-ar-adapter SDK is bundled with functionality that allows redirecting a user towards an AR experience when scanning a QR Code. Previously this QR Code would lead a user towards a mobile friendly version of the Plattar Renderer that would have additional functionality to launch an AR Experience.

With the introduction of `plattar-ar-adapter` version `1.129.1` there is now an option to send the user to a minimal page and allow launching the AR Experience directly without loading the Plattar Renderer.

QRCode Options requires the `plattar-ar-adapter` SDK minimum version to be `1.129.1`.

### How It Works

A new attribute named `qr-type` can be used to modify how the QR Code scanning works and accepts either `ar` or `viewer` as an argument. This attribute is optional and when omitted it will behave as though its set to `viewer`.

The default mode of this attribute is the same behaviour as before where it will re-route the user to a mobile version of the Plattar Renderer.

- **qr-type** (optional) - accepts either `viewer` or `ar`. Defaults to `viewer` when not set.

```html
<plattar-embed qr-type="ar" />
```

### Embed Example

For the purposes of this example, we use a sample `scene-id` of `c49e5c30-469c-11ec-963f-ddbb1b50e719`. This example is a replication of the `Configurator Embed` example found in `Getting Started` section.

This scene contains multiple products with multiple variations that can be configured using a simple UI. It performs the following functionality.

- Configure multiple products with variations using `selectSceneProductVariation` and a simple UI
- Generate QR Code for launching AR Mode for Desktop against a specific configuration using `getConfigurationState`
- Launch AR Experience when viewed from mobile without using Plattar Renderer using `qr-type="ar"` attribute

```html title="Scene Configurator Embed Example using plattar-ar-adapter SDK"
<html>

<head>
    <title>Scene Product Variation Selection Experience</title>

    <script
        src="https://cdn.jsdelivr.net/npm/@plattar/plattar-ar-adapter@1.129.1/build/es2019/plattar-ar-adapter.min.js"></script>
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
    <plattar-embed id="embed" scene-id="c49e5c30-469c-11ec-963f-ddbb1b50e719" embed-type="configurator" qr-type="ar"
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

The Example Scene should look like the following image

<img width="400" alt="The Example Scene should look like the following image" src="https://stoplight.io/api/v1/projects/cHJqOjEwODA2Nw/images/2DMkUJTYglE">

When a desired configuration is completed, clicking `Launch AR` on Desktop will generate a QR Code to be scanned. Scanning the QR Code will lead the user to the following page, allowing them to launch the AR Experience without loading the Plattar Renderer.

<img width="200" alt="The Example Scene should look like the following image" src="https://stoplight.io/api/v1/projects/cHJqOjEwODA2Nw/images/w5TZNS1YVQQ">