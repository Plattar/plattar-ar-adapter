[Back to Main](./)

## Using a 3D Viewer and QR Code Node Together

[Jump to final result](#final-result)

In a custom built integration, you may want to display a QR Code to your users at the same time as displaying the Plattar Viewer, for ease of use. This is very easy to set up and will allow the users to configure at will and scan the QR code for each configuration without having to reload the scene.

### Display two Embeds
-  First, we'll copy the variation selection using attribute example from a [previous tutorial](./selecting-variation-id.md/#changing-variation-using-attribute))

- We will then use two embed nodes, one for the viewer and one for the QR code, and give them ids to identify them. Note the difference in the `init` attribute for the QR Code embed.
  ```html
  <section>
    <div>
      <!-- The embed code acquired from the CMS -->
      <plattar-embed id="embed-viewer" scene-id="d9331ec5-3292-4ba9-b632-fab49b29a9e8" init="viewer" height="700px"></plattar-embed>

      <plattar-embed id="embed-qrcode" scene-id="d9331ec5-3292-4ba9-b632-fab49b29a9e8" init="qrcode" height="500px"></plattar-embed>
    </div>
  </section>
  ```

- Then we will edit the `selectVariation(id)` function to set the attribute on both embed nodes.
  ```javascript
  const embedViewer = document.getElementById("embed-viewer");
  const embedQrcode = document.getElementById("embed-qrcode");

  // Function used to change between variation
  function selectVariation(id) {
    embedViewer.setAttribute("variation-id", id);
    embedQrcode.setAttribute("variation-id", id);
  }
  ```

### Final Result

<iframe height="600" style="width: 100%;" scrolling="no" title="Changing to AR Mode" src="https://codepen.io/plattar/embed/yyygJyM?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/plattar/pen/yyygJyM">
  Changing to AR Mode</a> by Plattar (<a href="https://codepen.io/plattar">@plattar</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

### Next Step
Next we will go over how to create and use the Plattar Gallery to show 3D Renders, Product Photograpy and the 3D viewer all in a single embed.
[Go to next step](./adding-gallery.md)