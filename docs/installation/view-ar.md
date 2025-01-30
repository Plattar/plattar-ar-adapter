[Back to Main](./)

## Viewing in AR

[Jump to final result](#final-result)

One of the feature that the plattar renderer supports is the ability to render your scenes in augmented reality. This is limited to the mobile platform as the feature is supported through ARCore and AppleAR. 



To help user transport between the web platform to mobile, the Plattar plugin can automaticlaly generate a QR code which links to a standalone renderer on mobile. From mobile, you can easily quite easily enter augmented reality.

{fig 1, renderign in augmented reality}

### How to

- First, just like in the basic example we'll get the embed tag through the CMS and install the plattar plugin through a script tag. (If you need a refresher, you can go back to the [basic example](./loading-scene.md))

- From here, we can add a button which we'll use to trigger switching into AR

{codepen here}

- Now we can start adding some functionality into the script. In your script, we can start by getting the embed tag from the DOM and creating a simple function that will be called when the button is pressed

{codepen here}

- There's multiple ways to launch the AR Launcher, we'll use the embed-type for this example, all we need to do is to change the `embed-type` inside the embed tag attribute to `launcher`

- We want this button to both function as a way to trigger the AR Launcher and hides it, as such we'll first have to figure out what the current state of the embed type we can do this using ```getAttribute("embed-type")```

{codepen here}

- From here we can add a simple if statement which only triggers when the renderer isn't in Launcher mode and to switch between them

{codepen here}

- Finally, Using a similar method to changing variant, we'll use `setAttribute()` to change between `embed-type`s

### Final result 
<iframe height="600" style="width: 100%;" scrolling="no" title="Changing to AR Mode" src="https://codepen.io/plattar/embed/ZYzwJqe?default-tab=js%2Cresult&editable=true" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/plattar/pen/ZYzwJqe">
  Changing to AR Mode</a> by Plattar (<a href="https://codepen.io/plattar">@plattar</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

### Demonstration

As previously mentioned, the AR launcher only works on Mobile, as such isntead of starting augmented reality from the web, it'll insetad create a QR code, which once scanned will lead you to the current renderer with a button to launch AR form your phone

{insert Video here}





