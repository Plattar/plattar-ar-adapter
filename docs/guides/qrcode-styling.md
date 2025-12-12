[Back to Home](/)

# QRCode Styling Options

With the introduction of `plattar-ar-adapter` version `1.132.1` there are several options that allow styling the auto-generated QR Code by changing its design, color and visual complexity.

**QRCode Styling Options requires the `plattar-ar-adapter` SDK minimum version to be `1.132.1`.**

## Available Styling Attributes

The following attributes can be used to customize the appearance of QR codes:

### Color

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| **qr-color** | Hexadecimal color | `#101721` | Accepts a hexadecimal HTML color that will be applied to the QR Code. |

```html
<plattar-embed qr-color="#ff0000" />
```

### Style

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| **qr-style** | `default` or `dots` | `default` | Changes the overall style of the QR Code. The `dots` style uses rounded elements for a more modern look. |

```html
<plattar-embed qr-style="dots" />
```

### Shorten

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| **qr-shorten** | `true` or `false` | `true` | Automatically simplifies the complexity of the QR Code, making it easier to scan. When enabled, the URL is shortened using a URL shortening service. |

```html
<plattar-embed qr-shorten="true" />
```

## Complete Example

Here's an example combining multiple styling options:

```html
<html>
<head>
  <title>Styled QR Code Example</title>
  <script src="https://sdk.plattar.com/plattar-plugin.min.js"></script>
</head>

<body>
  <plattar-embed 
    id="embed"
    scene-id="3e9086e0-09fd-11eb-b32d-bda7c837c988"
    qr-color="#0066cc"
    qr-style="dots"
    qr-shorten="true"
    width="512px"
    height="512px">
  </plattar-embed>

  <script>
    const embed = document.getElementById("embed");
    
    // Render the styled QR Code
    embed.startQRCode().then(() => {
      console.log("Styled QR Code rendered successfully");
    }).catch((err) => {
      console.error("Error rendering QR Code:", err);
    });
  </script>
</body>
</html>
```

## Styling with JavaScript

You can also apply styling options dynamically through JavaScript:

```javascript
const embed = document.getElementById("embed");

embed.startQRCode({
  color: "#ff6600",
  style: "dots",
  shorten: true,
  url: "https://your-custom-url.com"
}).then(() => {
  console.log("Custom styled QR Code rendered");
}).catch((err) => {
  console.error("Error:", err);
});
```

## Best Practices

### Color Selection

- **Contrast**: Ensure sufficient contrast between the QR code color and the background for optimal scanning
- **Brand Colors**: Use your brand colors to maintain consistency
- **Dark Colors**: Generally work better for QR codes as they provide better contrast

### Style Selection

- **Default Style**: Better for high-density information or complex URLs
- **Dots Style**: More visually appealing, works well for shortened URLs

### URL Shortening

- **Enable (`true`)**: Recommended for most use cases as it creates simpler QR codes that are easier to scan
- **Disable (`false`)**: Use when you need full URL visibility or have very short URLs

## Visual Examples

### Default vs Dots Style

| Default Style | Dots Style |
|---------------|------------|
| Traditional square pixels | Rounded dots for modern aesthetic |
| Higher information density | Cleaner appearance |

### Color Variations

You can customize QR codes to match your brand:

```html
<!-- Red QR Code -->
<plattar-embed qr-color="#e74c3c" qr-style="dots" />

<!-- Blue QR Code -->
<plattar-embed qr-color="#3498db" qr-style="dots" />

<!-- Green QR Code -->
<plattar-embed qr-color="#2ecc71" qr-style="dots" />
```

## Related Guides

- [QRCode Use](guides/qrcode-use.md) - Basic QR code implementation
- [QRCode Routing](guides/qrcode-routing.md) - Customize where QR codes redirect users
- [QRCode Scanning](guides/qrcode-scanning.md) - Configure QR code scanning behavior
