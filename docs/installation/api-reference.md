[Back to Main](./)
# API Reference

## Attributes
| Attribute               | Syntax                                                |   Description                                       |
|-------------------------|-------------------------------------------------------|-----------------------------------------------------|
| **scene-id** (required) | ```<plattar-embed scene-id=""/>```                    |Scene ID is acquired from the Plattar CMS. Every Scene in the Plattar Ecosystem is designated a unique GUID. Use that Scene ID to embed a particular Configurator onto your website.   
| **init**  (required)           |```<plattar-embed scene-id="" init = "viewer" />```    |  |                                                   | 
| **variation-id**        | ```<plattar-embed scene-id="" variation-id="" />```   |Comma separated list of Variation ID's that can be used to define a specific or particular configuration of Products. The Variation ID's can be aquired from the Plattar CMS.| 
| **variation-sku**       |```<plattar-embed scene-id="" variation-sku="" />```   | Comma separated list of user-defined Variation SKU's that can be used to define a specific or particular configuration of Products. The Variation SKU's are both defined and aquired from the Plattar CMS.                            | 
| **show-ar**             |```<plattar-embed scene-id="" show-ar="true" />```     | The `show-ar` attribute will display a UI button that allows a user to launch an Android or IOS AR experience for a provided scene configuration. This attribute is ignored on desktop platforms. This attribute is `false` by default.    |   
| **width & height**      |```<plattar-embed scene-id="" width="1000px" height="1000px" />```   |The `width` and `height` attributes will scale the internal renderer and QR Code to the provided size. These attributes are `500px` by default.                                                                             |  
| **ar-mode**             |```<plattar-embed scene-id="" ar-mode="generated" />```|  The `ar-mode` attribute controls how AR is launched. The default setting is `generated` which will bundle and generate an AR file using all Products and Variations in the Scene. An alternative mode is using `inherited` which will use the pre-generated/user-uploaded `glb`, `usdz` and `reality` files attached to Products and Variations. When using `inherited` mode, no combinations will be performed so its only suitable when there is a single Product/Variation in the Scene. This attribute is `generated` by default.                                                                       |
| **show-ui**             |```<plattar-embed scene-id="" show-ui="false" />```    | The `show-ui` attribute allows embedding the configurator bundled with a Plattar designed default UI solution that allows users to switch product variations. This attribute is `false` by default.                                       |  
| **embed-type**             |```<plattar-embed scene-id="" embed-type="viewer" />```    | The `embed-type` attribute allows changing between different types of embed to be displayed, by default this is set to `viewer` to show the 360 Renderer, In addition, there's `VTO` for [Virtual Try on](../integrations/vto-integration.md) , `launcher` for [AR launcher](../installation/view-ar.md), and `Gallery` for {description here} |  



## Functions

| Function | Description                                                                                                                                                                                                                        |
|----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| ```selectVariationID(variationID:string\|Array<string>);```   | Activates the provided Product Variation using a Variation ID. The Variation ID must be a member of a Scene Product in the Scene. The argument can be either a single Variation ID or an Array of Variation ID's.                  |
| ```selectVariationSKU(variationSKU:string\|Array<string>);```   | Activates the provided Product Variation using a user-defined Variation SKU. The Variation SKU must be a member of a Scene Product in the Scene. The argument can be either a single Variation SKU or an Array of Variation SKU's. |
| ```startAR()```   | Launches AR renderer (only works on mobile)|
| ```startQRCode()```   | Change Viewer to a QR code linking to a standalone renderer|