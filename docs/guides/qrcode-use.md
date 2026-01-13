[Back to Home](/)

# Standalone QRCode Use

## Install

Follow the instructions on the [install page](installation/installation.md).

## How It Works

The QRCode Renderer generates the internal URL dynamically based on the various attributes provided to an instance of the `<plattar-embed>` Node. This URL can be overridden and customized by providing an option to the `startQRCode` function call when rendering the QR Code.

## Properties

The `<plattar-qrcode>` element supports the following attributes:

| Attribute | Required | Description |
|-----------|----------|-------------|
| **url** | Yes | Accepts a URL for the QR code to load when scanned by a mobile device. |
| **width** | No | Accepts a CSS width property for the container. |
| **height** | No | Accepts a CSS height property for the container. |
| **color** | No | Accepts a hexadecimal HTML color that will be applied to the QR Code. Defaults to color `#101721` when not supplied. |
| **shorten** | No | Accepts either `true` or `false` that will automatically simplify the complexity of the QR Code, making it easier to scan. Defaults to `false` when not supplied. |
| **style** | No | Accepts either `default` or `dots` that will change the overall style of the QR Code. Defaults to `default` when not supplied. |

### Color Example

```html
<plattar-qrcode color="#ff0000" />
```

### Shorten Example

```html
<plattar-qrcode shorten="true" />
```

### Style Example

```html
<plattar-qrcode style="dots" />
```

## Example

```html
<html>
  <head>
    <title>QR Code Use</title>

    <script src="https://sdk.plattar.com/plattar-plugin.min.js"></script>
  </head>

  <body>
    <plattar-qrcode 
      width="256px" 
      height="256px" 
      url="https://www.plattar.com/" 
      shorten="true">
    </plattar-qrcode>
  </body>
</html>
```

## CodePen Live Example

<iframe height="500" style="width: 100%;" scrolling="no" title="QR Code Use" src="https://codepen.io/plattar/embed/jOomRaz?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/plattar/pen/jOomRaz">
  QR Code Use</a> by Plattar (<a href="https://codepen.io/plattar">@plattar</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

## Related Guides

- [QRCode Routing](guides/qrcode-routing.md) - Customize where QR codes redirect users
- [QRCode Scanning](guides/qrcode-scanning.md) - Configure QR code scanning behavior
- [QRCode Styling](guides/qrcode-styling.md) - Advanced styling options for QR codes
