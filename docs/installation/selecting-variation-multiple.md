[Back to Home](/)

# Selecting Multiple Variations

In certain scenarios, you might want to change multiple variations at the same time.

## Prerequisites

To follow this guide you need to know how to:
- [Install](installation/installation.md) the Plattar plugin
- Get the [embed tag](installation/loading-scene.md) through the CMS
- Get the [variation-id](selecting-variation-id.md#getting-variation-id) or [SKU](selecting-variation-sku.md#getting-variation-sku)
- Change between them through [attribute](selecting-variation-sku.md#changing-variation-using-attribute) or [function](selecting-variation-sku.md#changing-variation-using-function)

## Changing Multiple Variations Using Attribute

### Step 1: Setup Basic HTML

First, we'll get the embed tag through the CMS and install the Plattar plugin through a script tag. (If you need a refresher, you can go back to the [basic example](installation/loading-scene.md))

### Step 2: Add Control Buttons

Next we'll add a couple of buttons to change between the variations:

```html
<!-- install script tag above -->
<!-- Added a section containing all the needed buttons to change between variations -->
<section>
  <div>
    <p>Combinations</p>
    <button type="button">Base</button>
    <button type="button">Black and Gold</button>
    <button type="button">All Blue</button>
  </div>
</section>
<!-- embed tag below -->
```

### Step 3: Configure Button Values

Just like in other examples, we'll use this button to call a function on click. As for the value attribute, we'll use a comma-separated value to change multiple variations at the same time:

```html
<section>
  <div>
    <p>Combinations</p>
    <!-- Add value as a comma separated list of multiple SKUs -->
    <button type="button" value="8z4m4,pmk51,zl33i" onclick="selectSKU(this.value)">Base</button>
    <!-- Button calls selectSKU() which we will define in later steps -->
    <button type="button" value="f1ora,uxzs1,ogqdu" onclick="selectSKU(this.value)">Black and Gold</button>
    <button type="button" value="y6j1e,ogcu7,zl33i" onclick="selectSKU(this.value)">All Blue</button>
  </div>
</section>
```

> **Note:** When changing multiple variations at the same time using the attributes, the `variation-id` or `SKU` has to be separated using a **comma without space**

### Step 4: Implement JavaScript

Moving into the JavaScript, we'll start by getting the tag through an id search and defining the function we made for the buttons to call on click:

```javascript
// get the embed tag through its id
const embed = document.getElementById("embed");

// define selectSKU() function
function selectSKU(sku) {}
```

Using `setAttribute(attribute, value)` we'll now change the SKU attribute. The Plattar Plugin will detect the attribute change and swap to the selected variations in the scene:

```javascript
const embed = document.getElementById("embed");

function selectSKU(sku) {
  // directly use setAttribute() to change the value of the variation-sku
  // no changes needed to be made since the value is already in the correct format
  embed.setAttribute("variation-sku", sku);
}
```

### Changing Multiple Variations Using Attribute Example

<iframe height="600" style="width: 100%;" scrolling="no" title="Changing Multiple Variant Using Attribute" src="https://codepen.io/plattar/embed/wBvvRXG?default-tab=js%2Cresult&editable=true" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/plattar/pen/wBvvRXG">
  Changing Multiple Variant Using Attribute</a> by Plattar (<a href="https://codepen.io/plattar">@plattar</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

## Changing Multiple Variations Using Function

### Step 1: Use Previous HTML

Just like in the previous example, we'll start off from the same HTML:

```html
<script src="https://sdk.plattar.com/plattar-plugin.min.js"></script>

<section>
  <div>
    <p>Combinations</p>
    <button type="button" value="8z4m4,pmk51,zl33i" onclick="selectSKU(this.value)">Base</button>
    <button type="button" value="f1ora,uxzs1,ogqdu" onclick="selectSKU(this.value)">Black and Gold</button>
    <button type="button" value="y6j1e,ogcu7,zl33i" onclick="selectSKU(this.value)">All Blue</button>
  </div>
</section>

<section>
  <div>
    <plattar-embed id="embed" scene-id="d9331ec5-3292-4ba9-b632-fab49b29a9e8" init="viewer" height="700px"></plattar-embed>
  </div>
</section>
```

### Step 2: Split and Process Values

In the JavaScript, instead of using `setAttribute(attribute, value)` we'll first have to separate the values into an array of strings based on where the comma is placed using `value.split(character)` function:

```javascript
const embed = document.getElementById("embed");

function selectSKU(sku) {
  // Using split(",") to split the value into a comma separated list
  console.log(sku.split(","));
}
```

### Step 3: Use Messenger Function

Once we have the array, we can input them directly into `viewer.messenger.selectVariationSKU(variationSKU:string|Array<string>)` or `viewer.messenger.selectVariationID(variationID:string|Array<string>)`:

```javascript
const embed = document.getElementById("embed");

function selectSKU(sku) {
  // Directly putting the comma separated list into the viewer.messenger.selectVariationSKU()
  embed.viewer.messenger.selectVariationSKU(sku.split(","));
}
```

### Changing Multiple Variations Using Function Final Example

<iframe height="600" style="width: 100%;" scrolling="no" title="Changing Multiple Variant Using Function" src="https://codepen.io/plattar/embed/YPzPZzj?default-tab=js%2Cresult&editable=true" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/plattar/pen/YPzPZzj">
  Changing Multiple Variant Using Attribute</a> by Plattar (<a href="https://codepen.io/plattar">@plattar</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

## Next Step

Next we will go over how to move the user camera to different positions to show different views of your model.

[Go to next step](installation/selecting-camera.md)
