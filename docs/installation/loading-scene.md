[Back to Main](./)

# Loading a Scene

## Quick start

To start, we'll begin with a simple example showing the most basic example for a 360 renderer 

- First, we'll need to [install](../installation/installation.md) the plattar plugin, which can easily be done by adding this embed code into your website
    ```html
    <script src="https://sdk.plattar.com/plattar-plugin.min.js"></script>
    ```

- Next, we'll need to add an embed code that will show the 3d model. Luckily, The CMS can provide you with the embed tag you need, complete with its scene ID with only a few clicks
To access an embed code from any scene, navigate to your project page, change the view setting to list, and copy the embed code by clicking on it
![Getting the embed Code](GettingEmbed.jpg){ width=1000px }


For this example, we'll use [attributes](../guides/node-attributes.md) to change the look of the embed. Using ```show-ui="true"``` to add a simple UI complete with its variation, and ```width="100%"``` to change its width to fill the screen.
<iframe height="600" style="width: 100%;" scrolling="no" title="Quick Start" src="https://codepen.io/plattar/embed/JoPaOge?default-tab=html%2Cresult&editable=true" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/plattar/pen/JoPaOge">
  Quick Start</a> by Plattar (<a href="https://codepen.io/plattar">@plattar</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

## Changing Between Scenes
In the first example, we get the embed tag with `scene-id` attribute and other mandatory attributes through the CMS. During runtime, we can change this scene ID to change between multiple scenes. The renderer will automatically change between scenes when a new `scene-id` is loaded 

### Getting the Scene ID
Before we start, we first have to get a `Scene ID` from multiple scenes we'd like to change between. The `Scene ID` can be copied directly from the Plattar CMS just like the full embed tag. This ID is static for the duration of the Scene's existance and will not change when the scene is modified. Each Scene contains a unique GUID (Global Unique Identifier).

- Click on your Scene to enter the Scene Editor 
![Scene ID can be located on the top right corner under 'Scene Settings'](OpenEditor.jpg){ width=1000px }

- Copy the `Scene ID` from the Scene Editor and use as part of the `scene-id` attribute in the integration (this is not disimilar to copying the embed tag)
![Navigating to the Editor](Scene-ID.jpg){ width=1000px }

### Changing the Loaded Scene using Scene ID
Once we've acquired the `Scene ID`, we can now change the `scene-id` directly in the embed. the Plattar plugin will automaticallly change the loaded scene whenever the `scene-id` is changed.

In this example we use a simple drop-down selector to change between 3 scenes
<iframe height="600" style="width: 100%;" scrolling="no" title="Changing Scene" src="https://codepen.io/plattar/embed/raBqJMb?default-tab=html%2Cresult&editable=true" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/plattar/pen/raBqJMb">
  Changing Scene</a> by Plattar (<a href="https://codepen.io/plattar">@plattar</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

