[Back to Main](./)

### Install

Follow the instructions on the [install page](../installation/installation.md).

### How It Works

The QRCode Renderer generates the internal URL dynamically based on the various attributes provided to an instance of the `<plattar-embed>` Node. This url can be overidden and customized by providing an option to the `startQRCode` function call when rendering the QR Code.

### Properties

- **width** (optional) - accepts a css width property for the container.
- **height** (optional) - accepts a css height property for the container.
- **url** (optional) - accepts a url for the qr-code to load when scanned by a mobile device.

- **color** (optional) - accepts a hexadecimal HTML color that will be applied to the QR Code. Defaults to color `#101721` when not supplied.
```html
<plattar-qrcode color="#ff0000" />
```

- **shorten** (optional) - accepts either `true` or `false` that will automatically simplify the complexity of the QR Code, making it easier to scan. Defaults to `false` when not supplied.

```html
<plattar-qrcode shorten="true" />
```

- **style** (optional) - accepts either `default` or `dots` that will change the overall style of the QR Code. Defaults to `default` when not supplied.

```html
<plattar-qrcode style="dots" />
```

### Example

```html
<html>
  <head>
    <title>QR Code Use</title>

    <script src="https://sdk.plattar.com/plattar-plugin.min.js"></script>
  </head>

  <body>
    <plattar-qrcode width='256px' height='256px' url='https://www.plattar.com/' shorten='true'>
    </plattar-qrcode>
  </body>
</html>
```

### Codepen Live Example

<p class="codepen" data-height="500" data-default-tab="html,result" data-slug-hash="jOomRaz" data-pen-title="QR Code Use" data-user="plattar" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/plattar/pen/jOomRaz">
  QR Code Use</a> by Plattar (<a href="https://codepen.io/plattar">@plattar</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>