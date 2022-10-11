[Back to Main](./)

### QRCode Routing Options

The default implementation of the QR Code Renderer bundled with the plattar-ar-adapter SDK is designed to route a user to a mobile version of an experience hosted by Plattar. These experiences vary based on Scene ID, Product ID or Variation ID.

It is possible to generate a QR Code that routes users into a mobile-friendly version of an existing website that hosts an embed of the Plattar Renderer. In this way, the design and UI/UX experience can be completely customized outside of Plattar.

### How It Works

The QRCode Renderer generates the internal URL dynamically based on the various attributes provided to an instance of the `<plattar-embed>` Node. This url can be overidden and customized by providing an option to the `startQRCode` function call when rendering the QR Code.

### Re-Route Example

The following example will render a QR Code that navigates the user to a custom URL.

For the purposes of this example, we use the `scene-id` as `3e9086e0-09fd-11eb-b32d-bda7c837c988`. The QR Code will redirect the user to a custom url at `https://cdn.plattar.com/demos/westinghouse/index.html` instead of the default location.

```html
<html>

<head>
    <title>QR Code Redirect Example</title>
    <script
        src="https://cdn.jsdelivr.net/npm/@plattar/plattar-ar-adapter/build/es2019/plattar-ar-adapter.min.js"></script>
</head>

<body>
    <plattar-embed id="embed" scene-id="3e9086e0-09fd-11eb-b32d-bda7c837c988" width="512px" height="512px">
    </plattar-embed>

    <script>
        const embed = document.getElementById("embed");

        if (embed) {
            // render the QR Code. Optionally we can modify the color
            // in here, we set the color as BLUE
            embed.startQRCode({
                // ensure QR Code scanning sends the user to the following url
                url: "https://cdn.plattar.com/demos/westinghouse/index.html"
            }).then((qrCodeElement) => {
                // this is called when the QR Code has successfully rendered
                // use this to trigger other functionality
            }).catch((err) => {
                // this can occur if for some reason the QR code could not
                // be rendered
                console.error(err);
            });
        }
    </script>
</body>

</html>
```