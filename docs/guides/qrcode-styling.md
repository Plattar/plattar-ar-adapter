### QRCode Styling Options

With the introduction of `plattar-ar-adapter` version `1.132.1` there is now several options that allows styling the auto-generated QR Code by changing its design, color and visual complexity.

QRCode Styling Options requires the `plattar-ar-adapter` SDK minimum version to be `1.132.1`.

### How It Works

We introduce several new attributes that can be used to modify the styling of the QR Code. These attributes are optional and when not supplied will revert to defaults. 

- **qr-color** (optional) - accepts a hexadecimal HTML color that will be applied to the QR Code. Defaults to color `#101721` when not supplied.

```html
<plattar-embed qr-color="#ff0000" />
```

- **qr-style** (optional) - accepts either `default` or `dots` that will change the overall style of the QR Code. Defaults to `default` when not supplied.

```html
<plattar-embed qr-style="dots" />
```

- **qr-shorten** (optional) - accepts either `true` or `false` that will automatically simplify the complexity of the QR Code, making it easier to scan. Defaults to `false` when not supplied.

```html
<plattar-embed qr-shorten="true" />
```