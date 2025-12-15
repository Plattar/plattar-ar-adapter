![Plattar Logo](images/plattar-logo.png)

## About

Plattar AR Adapter SDK is an [NPM Module](https://www.npmjs.com/package/@plattar/plattar-ar-adapter) that allows embedding and interfacing with Plattar Viewers, QR Codes and Augmented Reality (AR) via JavaScript.

The software is open source and maintained by the Plattar team. Source code can be found in the Plattar GitHub Repository at [plattar-ar-adapter](https://github.com/Plattar/plattar-ar-adapter).

## Quick Start

Get started with the Plattar AR Adapter SDK in just a few steps:

1. **[Install the SDK](installation/installation.md)** - Add the Plattar plugin to your website
2. **[Load Your First Scene](installation/loading-scene.md)** - Display a 3D scene on your site
3. **[Explore Features](installation/api-reference.md)** - Learn about all available functionality

## Table of Contents

### Getting Started

- [Installation](installation/installation.md)
- [Loading a Scene](installation/loading-scene.md)
- [Changing between Scenes](installation/changing-scene.md)
- [Selecting Variation using Variation ID](installation/selecting-variation-id.md)
- [Selecting Variation using SKU](installation/selecting-variation-sku.md)
- [Selecting Multiple Variations Simultaneously](installation/selecting-variation-multiple.md)
- [Moving to a Camera](installation/selecting-camera.md)
- [Taking Screenshot](installation/screenshot.md)
- [View in AR](installation/view-ar.md)
- [Display a Viewer and QR Code](installation/maintain-viewer-and-qr.md)
- [Gallery View](installation/adding-gallery.md)
- [Final Example](installation/final-example.md)
- [Embed API Reference](installation/api-reference.md)
- [Advanced Visibility Control API](installation/advanced-visibility-api.md) - ⚠️ Beta functionality

### Web Integrations

- [360 Viewer & Configurator Integration](integrations/configurator-integration.md)
- [VTO (Virtual Try-On) Integration](integrations/vto-integration.md)

### General Guides

- [Standalone QRCode Use](guides/qrcode-use.md)
- [QRCode Routing](guides/qrcode-routing.md)
- [QRCode Scanning](guides/qrcode-scanning.md)
- [QRCode Styling](guides/qrcode-styling.md)
- [AR Banners](guides/ar-banners.md)

### API Guides

- [Get Live Scenes](guides/get-live-scene.md)
- [Get Product SKU](guides/get-product-sku.md)

## Key Features

### 3D Viewer & Configurator
Embed interactive 360° viewers with product configuration capabilities. Allow users to customize products in real-time with multiple variations and options.

### Augmented Reality
Launch AR experiences on iOS and Android devices. Support for both face-tracking (VTO) and world-placement AR modes.

### QR Code Generation
Generate styled QR codes for easy mobile AR access. Customize colors, styles, and routing options.

### Gallery Integration
Combine 3D viewers with traditional product photography in a seamless gallery experience.

### Advanced Camera Controls
Programmatically control camera positions and animations. Create guided product tours and highlight specific features.

### Advanced Visibility Control (Beta)
Fine-grained control over product variation visibility for building custom configurator experiences. See the [Advanced Visibility Control API](installation/advanced-visibility-api.md) for details.

> **Note:** The Advanced Visibility Control API is currently in beta. Some features may not work as expected. Please report any issues on the [GitHub repository](https://github.com/Plattar/plattar-ar-adapter/issues).

## Platform Support

- **Web Browsers**: Chrome, Firefox, Safari, Edge
- **iOS**: ARKit support for high-quality AR experiences
- **Android**: ARCore support for AR functionality
- **Desktop**: Full viewer and VTO support with webcam

## Quick Links

- [GitHub Repository](https://github.com/Plattar/plattar-ar-adapter)
- [NPM Package](https://www.npmjs.com/package/@plattar/plattar-ar-adapter)
- [Plattar Platform](https://www.plattar.com)
- [API Reference](installation/api-reference.md)
- [Advanced Visibility Control API](installation/advanced-visibility-api.md) - Beta

## Need Help?

- Check the [API Reference](installation/api-reference.md) for detailed documentation
- Review the [examples](installation/final-example.md) to see complete implementations
- Visit the [GitHub repository](https://github.com/Plattar/plattar-ar-adapter) for issues and discussions
- For beta features like the Advanced Visibility Control API, please report issues on GitHub