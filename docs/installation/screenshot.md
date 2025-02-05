[Back to Main](./)

# Taking A Screenshot from the Renderer

[Jump to final result](#taking-screenshot-final-result)

Taking a screenshot of a product is an additional feature that can be added into existing infrastructure. All we need to do is call the `takeScreenshot()` [function](./api-reference.md)

## Taking and Displaying Screenshots

- First, just like in the basic example we'll get the embed tag through the CMS and install the plattar plugin through a script tag. (If you need a refresher, you can go back to the [basic example](./loading-scene.md))
  
  ```html
  <!-- Installing the Plattar Plugin -->
  <script src="https://sdk.plattar.com/plattar-plugin.min.js"></script>
  
  <section>
    <div>
    <!-- The embed code acquired from the CMS -->
      <plattar-embed id = "embed" scene-id="d9331ec5-3292-4ba9-b632-fab49b29a9e8" init="viewer" height = 700px ></plattar-embed>
    </div>
  </section>
  ```
- Then we'll add a button into the html that calls `takeScreenshot(500,500)` fucntion which we will implement later on. This function takes two value: width and height for the screenshot.

  ```html
  <script src="https://sdk.plattar.com/plattar-plugin.min.js"></script>

  <!-- add a button which will call takeScreenshot()-->
  <section>
    <div>
      <button type="button" onclick="takeScreenshot(500,500)">Take Screenshot</button>
    </div>
  </section>

  <section>
    <div>
      <plattar-embed id = "embed" scene-id="d9331ec5-3292-4ba9-b632-fab49b29a9e8" init="viewer" height = 700px ></plattar-embed>
    </div>
  </section>
  ```
- we'll also add an image tag with `thumbnail` as its `id`. This tag will be where our screenshot is placed once its taken
  ```html
  <script src="https://sdk.plattar.com/plattar-plugin.min.js"></script>

  <section>
    <div>
      <button type="button" onclick="takeScreenshot(500,500)">Take Screenshot</button>
    </div>
  </section>

  <section>
    <div>
      <plattar-embed id = "embed" scene-id="d9331ec5-3292-4ba9-b632-fab49b29a9e8" init="viewer" height = 700px ></plattar-embed>
      <!-- add the image tag -->
      <img height = 700px id='thumbnail'>
    </div>
  </section>
  ```

- Now, moving into the javascript, we'll first find the embed through its id and add the `takeScreenshot(width,height)` which we'll implement on the next step

  ```javascript
  //get the embed
  const embed = document.getElementById("embed");

  //create takeScreenshot(width,height) function
  function takeScreenshot(width,height) {}
  ```

- Inside this function we'll call  `viewer.messenger.takeScreenshot ({width: int, height: int})` to take a screenshot for the current view of the editor 

  ```javascript
  const embed = document.getElementById("embed");

  function takeScreenshot(width,height) {
    embed.viewer.messenger
      .takeScreenshot({
        width: width,
        height: height
      })
  }
  ```
  Technically, the screenshot is working now, but we can't see it yet because we haven't added a function to display it.
  
- To display the screenshot, we'll use a callback function. In this example, an [anonymous](https://www.geeksforgeeks.org/javascript-anonymous-functions/) function will execute once the screenshot is successfully taken. 

  ```javascript
  const embed = document.getElementById("embed");

  function takeScreenshot(width,height) {
    embed.viewer.messenger
      .takeScreenshot({
        width: width,
        height: height
      })
      //this section of the code will be called once the screenshot is taken.
      .then(function () {
        console.log("Screenshot taken")
      });
  }
  ```
- Finally, we'll use the `<img>` tag we added earlier in the HTML to display the screenshot. The anonymous function will set its `src` attribute using the `imageBase64` data returned by `takeScreenshot()`.

  ```javascript
  const embed = document.getElementById("embed");

  function takeScreenshot(width,height) {
    embed.viewer.messenger
      .takeScreenshot({
        width: width,
        height: height
      })
      //the function takes in an imagebase64, a raw data containing the screenshot 
      .then(function (imageBase64) {
        //get the img tag by id
        var image = document.getElementById("thumbnail");
        //append render data to the page
        image.src = imageBase64;
      });
  }

  ```

## Taking Screenshot Final Result
<iframe height="600" style="width: 100%;" scrolling="no" title="Untitled" src="https://codepen.io/plattar/embed/EaYrwvd?default-tab=js%2Cresult&editable=true" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/plattar/pen/EaYrwvd">
  Untitled</a> by Plattar (<a href="https://codepen.io/plattar">@plattar</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>