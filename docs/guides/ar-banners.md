[Back to Main](./)

### AR Banners

With the introduction of `plattar-ar-adapter` version `1.163.1` there is now several options that allows displaying and interfacing with AR Banners.

AR Banners requires the `plattar-ar-adapter` SDK minimum version to be `1.163.1`.

### Screenshots for Android & IOS

<p float="left">
<img width="250" alt="Android AR Banner" title="Android AR Banner" src="https://github.com/Plattar/plattar-ar-adapter/assets/7587896/e97564b0-a853-49d6-a017-e4e308385006">
<img width="250" alt="IOS AR Banner" title="IOS AR Banner" src="https://github.com/Plattar/plattar-ar-adapter/assets/7587896/809eef72-4ba4-4d9b-805c-5c664edf987c">
</p>

AR Banners contains 4 distinct elements

1. **Title** - This will be the name of your Application and can be changed in the Plattar CMS
2. **Subtitle** - This will be the name of your Scene and can be changed in the Plattar CMS
3. **CTA Button** - This will always be visible and named as `Visit` and cannot be changed. When clicked, the `arclick` event will be fired.
4. **URL** - This will either be the url of your website or the content CDN url and cannot be changed

### How It Works

We introduce a new attribute that can be used to display the AR Banner when Augmented Reality mode is launched.

- **show-ar-banner** (optional) - accepts a boolean `true` or `false` value wether to show/hide the AR Banner, defaults to `false`.

```html
<plattar-embed show-ar-banner="true" />
```

Alternatively, a listener can be registered for when the `Visit` button in the AR Banner is clicked. This allows reacting to a user click action and allows coding custom functionality such as adding products to charts, navigating to another page or changing some state within the page.

Note that when the `Visit` button is clicked, the current page will be refreshed so all previous state will be lost. The callback will occur once the page has refreshed.

Enabling the callback will automatically set the `show-ar-banner` attribute to `true`.

```html
<plattar-embed id="your_embed_id" scene-id="your_scene_id" />

<script>
const embed = document.getElementById("your_embed_id");

// NOTE - adding this listener will set the `show-ar-banner` attribute to `true` automatically
embed.addEventListener("arclick", () => {
    // the Visit button was clicked, the AR Experience has closed
    // use this listener to react for the event
});
</script>
```