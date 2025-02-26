[Back to Main](./)

## Viewing in AR

[Jump to final result](#final-result)

One of the features that the Plattar Plugin supports is the ability to open your scenes in Augmented Reality (AR) on supported mobile devices.

![ArFig](../images/ARFig.jpg)

To help users transport between the web platform to mobile, the Plattar plugin can automatically display a QR Code which links to the AR Launcher on mobile. From here you can easily enter Augmented Reality.

### Switching from renderer to Launcher

-  First, we'll get the embed tag through the CMS and install the plattar plugin through a script tag. (If you need a refresher, you can go back to the [basic example](./loading-scene.md/#changing-between-scenes))

- From here, we can add a button which we'll use to launch the AR experience

  ```html
  <script src="https://sdk.plattar.com/plattar-plugin.min.js"></script>

  <!-- Added a button which calls a function in the script-->

  <section>
    <div>
      <button onclick="launchAR()" >Launch AR/Return</button>
    </div>
  </section>

  <section>
    <div>
      <plattar-embed id="embed" scene-id="d9331ec5-3292-4ba9-b632-fab49b29a9e8" init="viewer" height="700px" ></plattar-embed>
    </div>
  </section>

  ```
- Now we can start adding some functionality into the script. We can start by getting the embed tag from the DOM and creating a simple function that will be called when the button is pressed.

  ```javascript
  //getting the embed Tag
  const embed = document.getElementById("embed");

  //A function that gets called when the button is pressed
  function launchAR(){

  }
  ```

- There's multiple ways to launch the AR Launcher, we'll use the `embed-type` for this example, all we need to do is to change the `embed-type` inside the embed tag attribute to `launcher`.

- Since we only have one button, we want it to both function as a way to trigger the AR Launcher and return back to the 360 Viewer. We can use the function ```getAttribute("embed-type")``` to find out the current state of the embed node.

  ```javascript
  const embed = document.getElementById("embed");

  function launchAR(){
    //Prints out what's the current state of the embed-type is
    console.log(embed.getAttribute("embed-type"))
  }
  ```

- From here we can add a simple if statement which only triggers when the renderer isn't in launcher mode and to switch between them.

  ```javascript
  const embed = document.getElementById("embed");

  function launchAR(){
    //Depending on the embed-type trigger one of these lines
    //Notably, this works even if the embed type starts as a null instead of viewer
    if ((embed.getAttribute("embed-type")) != "launcher"){
      console.log("Launch");
    }
    else{
      console.log("Return");
    }
  }
  ```

- Finally, Using a similar method to changing variants, we'll use `setAttribute()` to change between `embed-type`s

  ```javascript
  const embed = document.getElementById("embed");

  function launchAR(){
    console.log("Launch")
    if ((embed.getAttribute("embed-type")) != "launcher"){
      //uses setAttribute() to change between launcher and viewer
      embed.setAttribute("embed-type", "launcher");
    }
    else{
      embed.setAttribute("embed-type", "viewer");
    }
  }
  ```

### Final result

<iframe height="600" style="width: 100%;" scrolling="no" title="Changing to AR Mode" src="https://codepen.io/plattar/embed/ZYzwJqe?default-tab=js%2Cresult&editable=true" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/plattar/pen/ZYzwJqe">
  Changing to AR Mode</a> by Plattar (<a href="https://codepen.io/plattar">@plattar</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

### Demonstration

As previously mentioned, the AR launcher only works on Mobile, as such instead of starting augmented reality from the web, it will instead create a QR code. Scanning this will lead you to the current renderer with a button to launch AR from your phone.

![[../images/ARDemo.gif]]{ width=400px }
