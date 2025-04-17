[Back to Main](./)


## Selecting Multiple Variations
In certain scenarios, you might want to change multiple variations at the same time.

### Changing multiple variations using attribute
To follow this guide you need to know how to [install](installation.md) the plattar plugin, get the [embed tag](loading-scene.md) through the CMS, get the [variation-id](selecting-variation-id.md#getting-variation-id) or [sku](selecting-variation-sku.md#getting-variation-sku), and change between them through [attribute](selecting-variation-sku.md#changing-variation-using-attribute) or [function](selecting-variation-sku.md#changing-variation-using-function).

-  First, we'll get the embed tag through the CMS and install the plattar plugin through a script tag. (If you need a refresher, you can go back to the [basic example](./loading-scene.md/#changing-between-scenes))

- Next we'll add a couple of buttons to change between the variations

  ```html
  <!-- install script tag above -->
  <!-- Added a section containing all the needed button to change bewteen variation -->
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

- Just like in other examples, we'll use this button to call a function on click. As for the value attribute, we'll use a comma separated value to change multiple variations at the same time .

  ```html
  <section>
    <div>
      <p>Combinations</p>
      <!--Add value as a comma seperated list of multiple SKUs-->
      <button type="button" value="8z4m4,pmk51,zl33i" onclick="selectSKU(this.value)">Base</button>
      <!--BUtton calls selectSKU() which we will define on later steps-->
      <button type="button" value="f1ora,uxzs1,ogqdu" onclick="selectSKU(this.value)">Black and Gold</button>
      <button type="button" value="y6j1e,ogcu7,zl33i" onclick="selectSKU(this.value)">All Blue</button>
    </div>
  </section>
  ```
  >Note that When changing multiple variation at the same time using the attributes, the `variation-id` or `SKU` has to be separated using a **comma without space**

- Moving into the JavaScript, we'll start of by getting the tag through an id search and defining the function we made for the buttons to call on click.
  ```javascript
  //get the embed tag through its id
  const embed = document.getElementById("embed");

  //define selectSKU() function
  function selectSKU(sku) {}
  ```

- using `setAttribute(attribute, value)` now we'll change the SKU attribute. The Plattar Plugin will detect the attribute change and swap to the selected variations in teh scene.

  ```javascript
  const embed = document.getElementById("embed");

  function selectSKU(sku) {
    //directly use setAttribute() to change the value of the variation-sku. no changes needed to be amde since the value is already in the correct format
    embed.setAttribute("variation-sku", sku);
  }
  ```

#### Changing Multiple Variations Using Attribute Example

<iframe height="600" style="width: 100%;" scrolling="no" title="Changing Multiple Variant Using Attribute" src="https://codepen.io/plattar/embed/wBvvRXG?default-tab=js%2Cresult&editable=true" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/plattar/pen/wBvvRXG">
  Changing Multiple Variant Using Attribute</a> by Plattar (<a href="https://codepen.io/plattar">@plattar</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

### Changing Multiple Variations Using Function

- Just like in the previous example, we'll start off from the same html

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
    <plattar-embed id="embed" scene-id="d9331ec5-3292-4ba9-b632-fab49b29a9e8" init="viewer" height="700px" ></plattar-embed>
  </div>
</section>
```

- In the JavaScript, instead of using `setAttribute(attribute, value)` we'll first have to separate the values into an array of strings based on where the comma is placed using `value.split(character)` function

```javascript
const embed = document.getElementById("embed");

function selectSKU(sku) {
    //Using split(",") to split the value into a comma seperated list
    console.log(sku.split(","))
}
```
- Once we have the array, we can input them directly into `viewer.messenger.selectVariationSKU (variationSKU:string|Array<string>)` or `viewer.messenger.selectVariationID (variationID:string|Array<string>)`.
```javascript
const embed = document.getElementById("embed");

function selectSKU(sku) {
  //Directly putting the comma seperated list into the viewer.messenger.selectVariationSKU()
  embed.viewer.messenger.selectVariationSKU (sku.split(","))
}
```

#### Changing multiple variations using function final example
<iframe height="600" style="width: 100%;" scrolling="no" title="Changing Multiple Variant Using Attribute" src="https://codepen.io/plattar/embed/YPzPZzj?default-tab=js%2Cresult&editable=true" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/plattar/pen/YPzPZzj">
  Changing Multiple Variant Using Attribute</a> by Plattar (<a href="https://codepen.io/plattar">@plattar</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

### Next Step
Next we will go over how to move the user camera to different positions to show different views of your model.
[Go to next step](./selecting-camera.md)