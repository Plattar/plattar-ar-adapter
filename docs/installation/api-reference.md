[Back to Home](/)

# API Reference

This document provides a comprehensive reference for all attributes and functions available in the Plattar AR Adapter SDK.

## Attributes

The following attributes can be used with the `<plattar-embed>` element:

### Required Attributes

| Attribute | Syntax | Description |
|-----------|--------|-------------|
| **scene-id** | `<plattar-embed scene-id=""/>` | Scene ID is acquired from the Plattar CMS. Every Scene in Plattar has a unique UUID (Universally Unique IDentifier). Use that Scene ID to select which scene to embed on your website. |
| **init** | `<plattar-embed scene-id="" init="viewer" />` | What form does the viewer take when starting out. Default is `viewer`, can be set to `qrcode`. |

### Optional Attributes

| Attribute | Syntax | Description |
|-----------|--------|-------------|
| **variation-id** | `<plattar-embed scene-id="" variation-id="" />` | Individual or comma-separated list of Variation IDs that can be used to define a specific or particular configuration of Products. The Variation IDs can be found in the Plattar CMS. |
| **variation-sku** | `<plattar-embed scene-id="" variation-sku="" />` | Individual or comma-separated list of user-defined Variation SKU's that can be used to define a specific or particular configuration of Products. The Variation SKU's are both defined and acquired from the Plattar CMS. |
| **show-ar** | `<plattar-embed scene-id="" show-ar="true" />` | The `show-ar` attribute will display a UI button that allows a user to launch an Android or iOS AR experience for a provided scene configuration. This attribute is ignored on desktop platforms. Default is `false`. |
| **width & height** | `<plattar-embed scene-id="" width="500px" height="500px" />` | The `width` and `height` attributes will size the renderer and QR Code to the provided size. These attributes are `500px` by default but are recommended to be set to `100%` and sized responsively using CSS. |
| **ar-mode** | `<plattar-embed scene-id="" ar-mode="generated" />` | The `ar-mode` attribute controls how AR is launched. The default setting is `generated` which will bundle and generate an AR file using all Products and Variations in the Scene. An alternative mode is using `inherited` which will use the pre-generated/user-uploaded `glb`, `usdz` and `reality` files attached to Products and Variations. When using `inherited` mode, no combinations will be performed so it's only suitable when there is a single Product/Variation in the Scene. Default is `generated`. |
| **show-ui** | `<plattar-embed scene-id="" show-ui="false" />` | The `show-ui` attribute embeds the configurator with a Plattar designed UI solution that allows users to switch model variations based on rules set in the CMS. Default is `false`. |
| **embed-type** | `<plattar-embed scene-id="" embed-type="viewer" />` | The `embed-type` attribute allows changing between different types of embed to be displayed. Default is `viewer` to show the 360 Renderer. Other options include `vto` for Virtual Try-On, `launcher` for AR launcher, and `gallery` for gallery view. |
| **qr-type** | `<plattar-embed qr-type="ar" />` | Accepts either `viewer` or `ar`. Controls the behavior when scanning a QR code. Default is `viewer`. |
| **qr-color** | `<plattar-embed qr-color="#ff0000" />` | Accepts a hexadecimal HTML color that will be applied to the QR Code. Default is `#101721`. |
| **qr-style** | `<plattar-embed qr-style="dots" />` | Accepts either `default` or `dots` that will change the overall style of the QR Code. Default is `default`. |
| **qr-shorten** | `<plattar-embed qr-shorten="true" />` | Accepts either `true` or `false` that will automatically simplify the complexity of the QR Code, making it easier to scan. Default is `true`. |
| **show-ar-banner** | `<plattar-embed show-ar-banner="true" />` | Accepts a boolean `true` or `false` value whether to show/hide the AR Banner. Default is `false`. |

## Functions

The following functions are available through the `viewer.messenger` interface:

### Variation Selection

| Function | Description |
|----------|-------------|
| `viewer.messenger.selectVariationID(variationID:string\|Array<string>)` | Loads the provided Product Variation using a Variation ID. The Variation ID must be a member of a Product in the Scene. The argument can be either a single Variation ID or an Array of Variation IDs. |
| `viewer.messenger.selectVariationSKU(variationSKU:string\|Array<string>)` | Loads the provided Product Variation using a user-defined Variation SKU. The Variation SKU must be a member of a Product in the Scene. The argument can be either a single Variation SKU or an Array of Variation SKUs. |

### Camera Control

| Function | Description |
|----------|-------------|
| `viewer.messenger.snapToCamera(camera_id:string)` | Instantly moves the camera to the specified camera position. |
| `viewer.messenger.moveToCamera(camera_id:string)` | Animates the camera to the specified camera position over one second. |
| `viewer.messenger.snapToPosition(transform:object)` | Instantly moves the camera to a specified position and rotation. Transform object should contain `position: {x, y, z}` and `quaternion: {x, y, z, w}`. |
| `viewer.messenger.moveToPosition(transform:object)` | Animates the camera to a specified position and rotation over one second. Transform object should contain `position: {x, y, z}` and `quaternion: {x, y, z, w}`. |

### Screenshot

| Function | Description |
|----------|-------------|
| `viewer.messenger.takeScreenshot({width: int, height: int})` | Takes a screenshot with the defined `width` and `height` and returns the result asynchronously as a base64 image string. |

### AR & Display Mode

| Function | Description |
|----------|-------------|
| `startAR()` | Launches AR viewer (only works on mobile devices). |
| `startQRCode(options)` | Changes Embed to a QR code link to scan with a phone camera. Accepts optional `options` object with properties like `url`, `color`, `style`, `shorten`. |
| `startViewer()` | Changes Embed back to the 3D Viewer. |

### Configuration State

| Function | Description |
|----------|-------------|
| `viewer.messenger.getConfigurationState()` | Returns the current configuration state as a string that can be used to restore the exact configuration later. |

## Events

### AR Banner Events

You can listen for AR Banner events:

```javascript
const embed = document.getElementById("your_embed_id");

embed.addEventListener("arclick", () => {
  // The Visit button in AR Banner was clicked
  // The AR Experience has closed
  // Use this listener to react to the event
});
```

## Utility Functions

The SDK provides utility functions through `PlattarARAdapter.Util`:

| Function | Description |
|----------|-------------|
| `PlattarARAdapter.Util.canAugment()` | Returns `true` if the current device supports AR experiences. |
| `PlattarARAdapter.Util.canRealityViewer()` | Returns `true` if the current device supports RealityKit (iOS AR). |

## Example Usage

### Basic Embed

```html
<script src="https://sdk.plattar.com/plattar-plugin.min.js"></script>

<plattar-embed 
  id="embed" 
  scene-id="d9331ec5-3292-4ba9-b632-fab49b29a9e8" 
  init="viewer"
  width="100%"
  height="600px"
  show-ar="true">
</plattar-embed>
```

### JavaScript Integration

```javascript
const embed = document.getElementById("embed");

// Select a variation
embed.viewer.messenger.selectVariationID("936639e0-3854-11ec-b8ed-8d91c3e5372d");

// Take a screenshot
embed.viewer.messenger.takeScreenshot({
  width: 800,
  height: 600
}).then((imageBase64) => {
  console.log("Screenshot captured:", imageBase64);
});

// Launch AR if supported
if (PlattarARAdapter.Util.canAugment()) {
  embed.startAR();
} else {
  embed.startQRCode();
}
```

## Further Reading

For more examples and detailed guides, see:
- [Installation Guide](installation/installation.md)
- [Loading a Scene](installation/loading-scene.md)
- [Configurator Integration](integrations/configurator-integration.md)
- [VTO Integration](integrations/vto-integration.md)
