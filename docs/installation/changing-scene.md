[Back to Main](./)


# Changing Between Scenes

In the first example, we get the embed tag with `scene-id` and other mandatory attributes through the CMS. During runtime, we can change this `scene-id` to change between multiple scenes. The renderer will automatically change between scenes when a new `scene-id` is loaded 

## Getting the Scene ID

Before we start, we first have to get a `Scene ID` from multiple scenes we'd like to change between. The `Scene ID` can be copied directly from the Plattar CMS. This ID is static for the duration of the Scene's existence and will not change when the scene is modified. Each Scene contains a unique GUID (Global Unique Identifier).

- Click on your Scene to enter the Scene Editor 
  <img title="" src="OpenEditor.jpg" alt="Scene ID can be located on the top right corner under 'Scene Settings'" width="742">

- Copy the `Scene ID` from the Scene Editor and use as part of the `scene-id` attribute in the integration (this is not dissimilar to copying the embed tag)
  <img title="" src="Scene-ID.jpg" alt="Navigating to the Editor" width="783">

## Changing the Loaded Scene using Scene ID

Once we've acquired the `Scene ID`, we can now change the `scene-id` directly in the embed. The Plattar plugin will automatically change the loaded scene whenever the `scene-id` is changed.

- Start by removing the show UI attribute as we'll be using our own. We'll also add an Id to the embed so it can be discovered by the javascript later on. 
  ```html
    <script src="https://sdk.plattar.com/plattar-plugin.min.js"></script>
    <!-- remove show-ui = "true" and added id="embed" -->
    <plattar-embed id = "embed" scene-id="d9331ec5-3292-4ba9-b632-fab49b29a9e8" init="viewer"  ></plattar-embed>
    ```
- Afterward, we'll add a section above the embed with buttons and text. We'll use these buttons to call the scene changes
  ```html
    <script src="https://sdk.plattar.com/plattar-plugin.min.js"></script>

    <!-- Section containing buttons which will call the scene switching -->
    <div>
      <p>Scene Selection</p>
      <button>Helmet</button>
      <button >Bed</button>
      <button >Coffee Machine</button>
    </div>

    <plattar-embed id = "embed" scene-id="d9331ec5-3292-4ba9-b632-fab49b29a9e8" init="viewer"  ></plattar-embed>
    ```

- Now we'll add a `value` and `onclick` attribute to these buttons. Each of these buttons should have a `value` equal to the `scene-id` we've obtained [earlier](#getting-the-scene-id). Meanwhile, `onclick` these button should call `selectScene(this.value)` which will pass over the `value` we've set.

  ```html
    <script src="https://sdk.plattar.com/plattar-plugin.min.js"></script>

    <div>
      <p>Scene Selection</p>
      <!-- button value contain scene-id obtained through the CMS -->
      <button value="d9331ec5-3292-4ba9-b632-fab49b29a9e8" onclick = "selectScene(this.value)">Helmet</button>
      <!-- These button will use their value as parameter to call selectScene()-->
      <button value="550b5585-7f0b-4a3a-ab01-dc5b27741372" onclick = "selectScene(this.value)">Bed</button>
      <button value="95c7a7a0-c89d-42dc-9752-102c36475413" onclick = "selectScene(this.value)">Coffee Machine</button>
    </div>

    <plattar-embed id = "embed" scene-id="d9331ec5-3292-4ba9-b632-fab49b29a9e8" init="viewer"  ></plattar-embed>
    ```

- Once we have the HTML setup we can move into the javascript. We'll first get the embed tag through an ID

  ``` javascript
  //obtain the embed through the ID we've added
  const embed = document.getElementById("embed");
  ```


- Now, we can add `selectScene(id)` which gets called by the buttons we've made earlier, passing over the `scene-id`

  ``` javascript
  const embed = document.getElementById("embed");

  //create an empty function which will be called by the buttons we've added
  function selectScene(id) {}
  ```
- Finally, to change scene we'll be changing the `scene-id` attribute from the embed tag using `setAttribute(attribute, value)`

  ``` javascript
  const embed = document.getElementById("embed");
  
  function selectScene(id) {
    //using setAttribute(), we'll change the scene into the ones we've added as value for the buttons
    embed.setAttribute("scene-id", id)
  }
  ```

#### Changing Scenes Final Result
<iframe height="600" style="width: 100%;" scrolling="no" title="Changing Scene" src="https://codepen.io/plattar/embed/raBqJMb?default-tab=html%2Cresult&editable=true" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/plattar/pen/raBqJMb">
  Changing Scene</a> by Plattar (<a href="https://codepen.io/plattar">@plattar</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>
