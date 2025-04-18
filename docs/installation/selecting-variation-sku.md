[Back to Main](./)


## Selecting Variation SKU
Variation IDs are generated by Plattar and are guaranteed to be unique, however, as they can be long and cumbersome. The Plattar Plugin allows the use of user defined `SKUs` instead to help sync with an existing product database.

### Getting Variation SKU
Instead of getting an ID, in this guide we'll use a user defined SKU. For variation in a single scene, the `SKU` can be defined by the user and be set and copied from the Plattar CMS through the editor.

- Navigate to the editor of a scene with your prodyct

- Select the product in the scene you'd like to Change
![Navigating to Variation Editor](../images/NavigatingVariantEdit.jpg){ width=1000px }

- In the Product Editor, pick one of the variations and define an SKU by typing it into the textbox if not already set. You can then use this to change between variations either by updating the HTML attribute or using a JavaScript function.
![Getting the Variation SKU](../images/VariantSKU.jpg){ width=1000px }


### Changing Variation Using Attribute
There are two ways to change a variation in a scene using the `SKU`, either by updating the [attribute](../guides/node-attributes.md) of the embed node or through a JavaScript [function](../guides/node-attributes.md).


In the first example, we'll use attributes to change between `SKU`.

- First, just like in the basic example we'll get the embed tag through the CMS and install the plattar plugin through a script tag. (If you need a refresher, you can go back to the [basic example](./loading-scene.md/#changing-between-scenes)).

  ```html
  <!-- Installing the PLattar Plugin -->
  <script src="https://sdk.plattar.com/plattar-plugin.min.js"></script>

  <!-- The embed code acquired from the CMS -->
  <plattar-embed id="embed" scene-id="d9331ec5-3292-4ba9-b632-fab49b29a9e8" init="viewer" height="700px" ></plattar-embed>
  ```
- Next, Let's add buttons we'll use to change between the variations. In the scene we have for this example, we'll be changing the shell, lens, and mic between a handful of options.

  ```html
  <!-- install script tag above -->
  <!-- Added a section containing all the needed button to change bewteen variation -->
  <section>
    <div>
      <p>Shell Colour</p>
      <button>White Gloss</button>
      <button>Black Matte</button>
      <button>Taheel Blue Gloss</button>
      <button>Carbon Fibre Matte</button>
    </div>

    <div>
      <p>Lens Colour</p>
      <button>Grey</button>
      <button>Clear</button>
      <button>Gold</button>
      <button>Ice</button>
    </div>

    <div>
      <p>Mic Choice</p>
      <button>Flex Boom</button>
      <button>Wire Rail</button>
    </div>
  </section>
  <!-- embed tag below -->
  ```

- Just like in the changing scene [example](loading-scene.md) we'll use the `value` in our buttons to hold our `sku` for changing between variations in shells, lenses and microphones.
  ```html
  <!-- install script tag above -->
  <section>
    <div>
      <p>Shell Colour</p>
      <!-- The button value contain a variation-id obtained from the CMS -->
      <button type="button" value="8z4m4" onclick="selectSKU(this.value)">White Gloss</button>
      <!-- On click, these buttons will use its value as a variable to call selectSKU() -->
      <button type="button" value="f1ora" onclick="selectSKU(this.value)">Black Matte</button>
      <button type="button" value="bluey" onclick="selectSKU(this.value)">Taheel Blue Gloss</button>
      <button type="button" value="ge3d8" onclick="selectSKU(this.value)">Carbon Fibre Matte</button>
    </div>

    <div>
      <p>Lens Colour</p>
      <button type="button" value="pmk51" onclick="selectSKU(this.value)">Grey</button>
      <button type="button" value="he5mx" onclick="selectSKU(this.value)">Clear</button>
      <button type="button" value="uxzs1" onclick="selectSKU(this.value)">Gold</button>
      <button type="button" value="ogcu7" onclick="selectSKU(this.value)">Ice</button>
    </div>

    <div>
      <p>Mic Choice</p>
      <button type="button" value="zl33i" onclick="selectSKU(this.value)">Flex Boom</button>
      <button type="button" value="ogqdu" onclick="selectSKU(this.value)">Wire Rail</button>
    </div>
  </section>
  <!-- embed tag below -->
  ```

- Moving into the JavaScript, in the same way as the previous example, we'll first find the embed tag through its `id`.

  ```javascript
  //get the embed tag using id
  const embed = document.getElementById("embed");
  ```

- Then, using `setAttribute(attribute, value)` to change the `SKU`, which we've set to be called by the buttons when clicked.
  ```javascript
  const embed = document.getElementById("embed");

  //Function used to change between SKUs
  function selectSKU(sku) {
    embed.setAttribute("variation-sku", sku);
  }
  ```

#### Changing Variation Using Attribute Final Result
<iframe height="600" style="width: 100%;" scrolling="no" title="Changing Variant Using Attribute SKU" src="https://codepen.io/plattar/embed/PwooxLL?default-tab=js%2Cresult&editable=true" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/plattar/pen/PwooxLL">
  Changing Variant Using Attribute ID</a> by Plattar (<a href="https://codepen.io/plattar">@plattar</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>


### Changing Variation Using Function
In this example, we'll use function instead which offers better redundency and error handling.

- We'll first start from the HTML we've used in the previous [example](#changing-variation-using-attribute)


  ```html
  <script src="https://sdk.plattar.com/plattar-plugin.min.js"></script>

  <section>
    <div>
      <p>Shell Colour</p>
      <!-- The button value contain a variation-id obtained from the CMS -->
      <button type="button" value="8z4m4" onclick="selectSKU(this.value)">White Gloss</button>
      <!-- On click, these buttons will use its value as a variable to call selectVariation() -->
      <button type="button" value="f1ora" onclick="selectSKU(this.value)">Black Matte</button>
      <button type="button" value="bluey" onclick="selectSKU(this.value)">Taheel Blue Gloss</button>
      <button type="button" value="ge3d8" onclick="selectSKU(this.value)">Carbon Fibre Matte</button>
    </div>

    <div>
      <p>Lens Colour</p>
      <button type="button" value="pmk51" onclick="selectSKU(this.value)">Grey</button>
      <button type="button" value="he5mx" onclick="selectSKU(this.value)">Clear</button>
      <button type="button" value="uxzs1" onclick="selectSKU(this.value)">Gold</button>
      <button type="button" value="ogcu7" onclick="selectSKU(this.value)">Ice</button>
    </div>

    <div>
      <p>Mic Choice</p>
      <!-- For demonstration we use SKU instead of variation-id for microphone -->
      <button type="button" value="zl33i" onclick="selectSKU(this.value)">Flex Boom</button>
      <button type="button" value="ogqdu" onclick="selectSKU(this.value)">Wire Rail</button>
    </div>
  </section>
  ```
- Unlike the previous example which uses `setAttribute(attribute, value)`, we'll instead use a [function](./api-reference.md/#functions) from the plugin, `viewer.messenger.selectVariationSKU (variationSKU:string|Array<string>)`.

  ```javascript
  const embed = document.getElementById("embed");

  function selectSKU(sku) {
    embed.viewer.messenger.selectVariationSKU(sku);
  }
  ```


#### Changing Variation Using function Final Result
<iframe height="600" style="width: 100%;" scrolling="no" title="Changing Variant Using Func SKU" src="https://codepen.io/plattar/embed/ByaaGbe?default-tab=js%2Cresult&editable=true" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/plattar/pen/ByaaGbe">
  Changing Variant Using Func ID</a> by Plattar (<a href="https://codepen.io/plattar">@plattar</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

### Next Step
Next we will go over how to select and load multiple model variations at once
[Go to next step](./selecting-variation-multiple.md)