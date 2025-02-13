[Back to Main](./)
# API Reference

## Attributes
| Attribute               | Syntax                                                |   Description                                       |
|-------------------------|-------------------------------------------------------|-----------------------------------------------------|
| **scene-id** (required) | ```<plattar-embed scene-id=""/>```                    |Scene ID is acquired from the Plattar CMS. Every Scene in the Plattar has a unique UUID (Universally Unique IDentifier). Use that Scene ID to select which scene to embed on your website. |
| **init**  (required)           |```<plattar-embed scene-id="" init = "viewer" />```    | What form does the viewer take when starting out by default is `viewer` can be set to `qrcode` |
| **variation-id**        | ```<plattar-embed scene-id="" variation-id="" />```   |Individual or Comma separated list of Variation IDs that can be used to define a specific or particular configuration of Products. The Variation IDs can be found in the Plattar CMS.|
| **variation-sku**       |```<plattar-embed scene-id="" variation-sku="" />```   | Individual or Comma separated list of user-defined Variation SKU's that can be used to define a specific or particular configuration of Products. The Variation SKU's are both defined and aquired from the Plattar CMS.                            |
| **show-ar**             |```<plattar-embed scene-id="" show-ar="true" />```     | The `show-ar` attribute will display a UI button that allows a user to launch an Android or IOS AR experience for a provided scene configuration. This attribute is ignored on desktop platforms. This attribute is `false` by default.    |
| **width & height**      |```<plattar-embed scene-id="" width="500px" height="500px" />```   |The `width` and `height` attributes will size the renderer and QR Code to the provided size. These attributes are `500px` by default but are recommended to be set to `100%` and sized responsively using css.                                                                             |
| **ar-mode**             |```<plattar-embed scene-id="" ar-mode="generated" />```|  The `ar-mode` attribute controls how AR is launched. The default setting is `generated` which will bundle and generate an AR file using all Products and Variations in the Scene. An alternative mode is using `inherited` which will use the pre-generated/user-uploaded `glb`, `usdz` and `reality` files attached to Products and Variations. When using `inherited` mode, no combinations will be performed so its only suitable when there is a single Product/Variation in the Scene. This attribute is `generated` by default.                                                                       |
| **show-ui**             |```<plattar-embed scene-id="" show-ui="false" />```    | The `show-ui` attribute embeds the configurator with a Plattar designed UI solution that allows users to switch model variations based on rules set in the CMS. This attribute is `false` by default.                                       |
| **embed-type**             |```<plattar-embed scene-id="" embed-type="viewer" />```    | The `embed-type` attribute allows changing between different types of embed to be displayed, by default this is set to `viewer` to show the 360 Renderer, In addition, there's `VTO` for [Virtual Try on](../integrations/vto-integration.md) , `launcher` for [AR launcher](../installation/view-ar.md), and `Gallery` for {description here} |



## Functions

| Function | Description   |
|------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| ```startAR()```   | Launches AR viewer (only works on mobile)|
| ```startQRCode()```   | Change Embed to a QR code link to scan with a phone camera|
| ```startViewer()```| Change Embed back to the 3D Viewer|
| ```viewer.messenger.selectVariationID (variationID:string\|Array<string>);```   | Loads the provided Product Variation using a Variation ID. The Variation ID must be a member of a Product in the Scene. The argument can be either a single Variation ID or an Array of Variation IDs.                  |
| ```viewer.messenger.selectVariationSKU (variationSKU:string\|Array<string>);```   | Loads the provided Product Variation using a user-defined Variation SKU. The Variation SKU must be a member of a Product in the Scene. The argument can be either a single Variation SKU or an Array of Variation SKUs. |
| ```viewer.messenger.takeScreenshot ({width: int, height: int})```| Take a [screenshot](./screenshot.md) with the defined `width` and `height` and return the result asynchronously as an base64 image string|
| ```viewer.messenger.moveToPosition ({position: {x:int,y:int,z:int}, quaternion: {x:int,y:int,z:int,w:int}})```| Move the camera to a specific angle and/or position|