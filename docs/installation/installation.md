[Back to Home](/)

# Installation

## Dependencies

The [plattar-ar-adapter](https://github.com/Plattar/plattar-ar-adapter) SDK has dependencies on the following open-source projects:

- [plattar-api](https://github.com/Plattar/plattar-api) - Used for interfacing with the Plattar API
- [plattar-web](https://github.com/Plattar/plattar-web) - Used for managing various embeds for Scenes and Products
- [plattar-qrcode](https://github.com/Plattar/plattar-qrcode) - Used for generating Plattar Styled QR Codes

These dependencies are automatically installed and bundled via NPM. No additional actions are needed to resolve these dependencies.

## Install via NPM

Use [NPM](https://www.npmjs.com/package/@plattar/plattar-ar-adapter) to install the latest version of the plattar-ar-adapter SDK for a new or existing project:

```console
npm install @plattar/plattar-ar-adapter
```

## Install via JS Embed

The SDK is also available as a pre-built and packaged JavaScript bundle that can be used for projects without NPM support.

See the [plattar-ar-adapter](https://github.com/Plattar/plattar-ar-adapter) repository for alternative built packages.

Use the following script to embed the latest version of the pre-built plattar-ar-adapter SDK on your existing website:

```html
<script src="https://sdk.plattar.com/plattar-plugin.min.js"></script>
```

## Next Steps

- [Loading a Scene](installation/loading-scene.md) - Learn how to load and display your first 3D scene
- [API Reference](installation/api-reference.md) - View the complete API documentation
