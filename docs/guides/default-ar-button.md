[Back to Main](../README.md)

### Default AR Button

With the introduction of `plattar-ar-adapter` version `1.132.1` there is now an option that allows disabling the default AR launch button in Plattar Viewers and Configurators.

Enabling/Disabling the default AR button requires the `plattar-ar-adapter` SDK minimum version to be `1.132.1`.

### How It Works

- **show-ar** (optional) - accepts a boolean true/false that enables/disables the default AR button inside the Plattar Viewer. Defaults to `true` when not supplied.

```html
<plattar-embed show-ar="false" />
```