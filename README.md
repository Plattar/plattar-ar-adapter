<h3 align="center">
  <img src="graphics/logo.png?raw=true" alt="Plattar Logo" width="600">
</h3>

[![install size](https://packagephobia.com/badge?p=@plattar/plattar-ar-adapter)](https://packagephobia.com/result?p=@plattar/plattar-ar-adapter)
[![NPM](https://img.shields.io/npm/v/@plattar/plattar-ar-adapter)](https://www.npmjs.com/package/@plattar/plattar-ar-adapter)
[![License](https://img.shields.io/npm/l/@plattar/plattar-ar-adapter)](https://www.npmjs.com/package/@plattar/plattar-ar-adapter)

_plattar-ar-adapter_ allows easy interfacing with Apple Quicklook and Google SceneViewer

### _Quick Use_

-   ES2015 & ES2019 Builds via [jsDelivr](https://www.jsdelivr.com/)

```javascript
// Minified Version ES2015 & ES2019 (Latest)
https://cdn.jsdelivr.net/npm/@plattar/plattar-ar-adapter/build/es2015/plattar-ar-adapter.min.js
https://cdn.jsdelivr.net/npm/@plattar/plattar-ar-adapter/build/es2019/plattar-ar-adapter.min.js

// Standard Version ES2015 & ES2019 (Latest)
https://cdn.jsdelivr.net/npm/@plattar/plattar-ar-adapter/build/es2015/plattar-ar-adapter.js
https://cdn.jsdelivr.net/npm/@plattar/plattar-ar-adapter/build/es2019/plattar-ar-adapter.js
```

### _Installation_

-   Install using [npm](https://www.npmjs.com/package/@plattar/plattar-ar-adapter)

```console
npm install @plattar/plattar-ar-adapter
```

### _Examples_

-   Launch AR for Plattar Products & Variations

```typescript
import {ProductAR} from "@plattar/plattar-ar-adapter";

// grab your product/variation ID from the Plattar CMS
const productID:string = "{YOUR_PRODUCT_ID}";
const variationID:string = "{YOUR_VARIATION_ID}";

const webAR:ProductAR = new ProductAR(productID, variationID);

webAR.init().then((ar:ProductAR) => {
    ar.start();
}).catch((err) => {
    console.error("AR Not Available");
});
```

-   Launch AR for Plattar Scenes

```typescript
import {SceneAR} from "@plattar/plattar-ar-adapter";

// grab your scene ID from the Plattar CMS
const sceneID:string = "{YOUR_SCENE_ID}";

const webAR:SceneAR = new SceneAR(sceneID);

webAR.init().then((ar:SceneAR) => {
    ar.start();
}).catch((err) => {
    console.error("AR Not Available");
});
```
