[Back to Home](/)

# Taking A Screenshot from the Renderer

[Jump to final result](#taking-screenshot-final-result)

The Plattar Plugin supports the ability to take a screenshot of the scene which can then be displayed in the user's cart or order form. To do this we can call the `takeScreenshot()` [function](installation/api-reference.md).

## Taking and Displaying Screenshots

### Step 1: Setup Basic HTML

First, we'll get the embed tag through the CMS and install the Plattar plugin through a script tag. (If you need a refresher, you can go back to the [basic example](installation/loading-scene.md))

### Step 2: Add Screenshot Button

Then we'll add a button into the HTML that calls `takeScreenshot(500,500)` function which we will implement later on. This function takes two values: the width and height for the screenshot:

```html
<script src="https://sdk.plattar.com/plattar-plugin.min.js"></script>

<!-- add a button which will call takeScreenshot() -->
<section>
  <div>
    <button type="button" onclick="takeScreenshot(500, 500)">Take Screenshot</button>
  </div>
</section>

<section>
  <div>
    <plattar-embed id="embed" scene-id="d9331ec5-3292-4ba9-b632-fab49b29a9e8" init="viewer" height="700px"></plattar-embed>
  </div>
</section>
```

### Step 3: Add Image Display Element

We'll also add an image tag with `thumbnail` as its `id`. This tag will be where our screenshot is placed once it's taken:

```html
<script src="https://sdk.plattar.com/plattar-plugin.min.js"></script>

<section>
  <div>
    <button type="button" onclick="takeScreenshot(500,500)">Take Screenshot</button>
  </div>
</section>

<section>
  <div>
    <plattar-embed id="embed" scene-id="d9331ec5-3292-4ba9-b632-fab49b29a9e8" init="viewer" height="700px"></plattar-embed>
    <!-- add the image tag -->
    <img height="700px" id="thumbnail">
  </div>
</section>
```

### Step 4: Create Screenshot Function

Now, moving onto the JavaScript, we'll first find the embed through its id and add the `takeScreenshot(width, height)` which we'll implement in the next step:

```javascript
// get the embed
const embed = document.getElementById("embed");

// create takeScreenshot(width, height) function
function takeScreenshot(width, height) {

}
```

### Step 5: Call the Screenshot API

Inside this function we'll call `viewer.messenger.takeScreenshot({width: int, height: int})` to take a screenshot of the 3D Viewer:

```javascript
const embed = document.getElementById("embed");

function takeScreenshot(width, height) {
  embed.viewer.messenger
    .takeScreenshot({
      width: width,
      height: height
    });
}
```

Technically, the screenshot is working now, but we can't see it yet because we haven't added a function to display it.

### Step 6: Handle Screenshot Response

To display the screenshot, we'll use a promise chain. In this example, an anonymous function will execute once the screenshot is successfully taken:

```javascript
const embed = document.getElementById("embed");

function takeScreenshot(width, height) {
  embed.viewer.messenger
    .takeScreenshot({
      width: width,
      height: height
    })
    // this section of the code will be called once the screenshot is taken
    .then(function () {
      console.log("Screenshot taken");
    });
}
```

### Step 7: Display the Screenshot

Finally, we'll use the `<img>` tag we added earlier in the HTML to display the screenshot. The anonymous function will set its `src` attribute using the `imageBase64` data returned by `takeScreenshot()`:

```javascript
const embed = document.getElementById("embed");

function takeScreenshot(width, height) {
  embed.viewer.messenger
    .takeScreenshot({
      width: width,
      height: height
    })
    // the function takes in an imageBase64, raw data containing the screenshot
    .then(function (imageBase64) {
      // get the img tag by id
      var image = document.getElementById("thumbnail");
      // append render data to the page
      image.src = imageBase64;
    });
}
```

## Taking Screenshot Final Result

<iframe height="600" style="width: 100%;" scrolling="no" title="Taking Screenshot" src="https://codepen.io/plattar/embed/EaYrwvd?default-tab=js%2Cresult&editable=true" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/plattar/pen/EaYrwvd">
  Untitled</a> by Plattar (<a href="https://codepen.io/plattar">@plattar</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

## Next Step

Next we will go over how to display your 3D content in AR.

[Go to next step](installation/view-ar.md)
