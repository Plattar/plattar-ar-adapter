[Back to Main](./)

## Viewing in AR

[Jump to final result](#final-result)

One of the features that the Plattar Plugin supports is the ability to open your scenes in Augmented Reality (AR) on supported mobile devices.

![ArFig](../images/ARFig.jpg)

To help users transport between the web platform to mobile, the Plattar plugin can display a QR Code which links to the AR Launcher on mobile. The Plattar AR Launch page contains all the code to turn your scene/configuration into an AR compatible model and open the Augmented Reality experience.

### Swap from Viewer to a QR Code (Legacy Code)
The Plattar Embed supports displaying a QR Code on desktop devices for users to scan with their AR supported devices in order to see the AR Experience.

Plattar supports swapping between the 3D viewer and the QRCode, but due to the load times it can be easier to maintain two embeds, one for the Viewer and one for the QRCode. The [next doc](./maintain-viewer-and-qr.md) will explain how to do that, but for now we will use the legacy functions to do the switch.

-  First, we'll get the embed tag through the CMS and install the plattar plugin through a script tag. (If you need a refresher, you can go back to the [basic example](./loading-scene.md/#changing-between-scenes))

- Then add a function and button to do the switch:
  ```html
  <section>
    <div>
      <button onclick="toggleQRCode()">Toggle Plattar QRCode</button>
    </div>
  </section>
  ```
- And some Javascript to handle the button press
  ```javascript
  //getting the embed Tag
  const embed = document.getElementById("embed");

  //A function that gets called when the button is pressed
  function toggleQRCode(){

  }
  ```

### Swap from Viewer to the Plattar Launch page
The Plattar Launch page is a more advanced version of the QR Code, which contains some instructions to the user on how to interact with the AR experience and will either display the QR Code or a button depending on whether they are on an AR supported device.

- After setting up the embed tag, we can add a button which we'll use to launch the AR experience
  ```html
  <section>
    <div>
      <button onclick="toggleLaunchPage()">Toggle Plattar Launch Page</button>
    </div>
  </section>

  ```
- Now we can start adding some functionality into the script. We can start by getting the embed tag from the DOM and creating a simple function that will be called when the button is pressed.

  ```javascript
  //getting the embed Tag
  const embed = document.getElementById("embed");

  //A function that gets called when the button is pressed
  function toggleLaunchPage(){

  }
  ```

- There's multiple ways to launch the AR Launcher, we'll use the `embed-type` for this example, all we need to do is to change the `embed-type` inside the embed tag attribute to `launcher`.

- Since we only have one button, we want it to both function as a way to trigger the AR Launcher and return back to the 360 Viewer. We can use the function ```getAttribute("embed-type")``` to find out the current state of the embed node.

  ```javascript
  function toggleLaunchPage(){
    //Prints out what's the current state of the embed-type is
    console.log(embed.getAttribute("embed-type"));
  }
  ```

- From here we can add a simple if statement which only triggers when the renderer isn't in launcher mode and to switch between them.

  ```javascript
  const embed = document.getElementById("embed");

  function toggleLaunchPage(){
    //Depending on the embed-type trigger one of these lines
    //Notably, this works even if the embed type starts as a null instead of viewer
    if ((embed.getAttribute("embed-type")) != "launcher"){
      console.log("Launch AR");
    }
    else{
      console.log("Return to Viewer");
    }
  }
  ```

- Finally, Using a similar method to changing variants, we'll use `setAttribute()` to change between `embed-types`

  ```javascript
  const embed = document.getElementById("embed");

  function toggleLaunchPage(){
    if ((embed.getAttribute("embed-type")) != "launcher"){
      //uses setAttribute() to change between launcher and viewer
      embed.setAttribute("embed-type", "launcher");
    }
    else{
      embed.setAttribute("embed-type", "viewer");
    }
  }
  ```

### Launching AR Directly
The Plattar Embed supports launching AR directly on supported devices, by using the `startAR()` function. It also has a helper function to query whether the device supports AR or not, to allow a fallback to show the launch page or an error messge.

- Firstly we set up a button to launch the AR experience
  ```html
  <button onclick="launchAR()">Launch AR</button>
  ```

- Then we create a function to call when the launch button is pressed
  ```javascript
  function launchAR(){
    console.log('Launch AR Experience');
  }
  ```

- We can use the plattar utility to test for if the device supports AR
  ```javascript
  if (PlattarARAdapter.Util.canAugment()) {
    console.log('Supports AR');
  }
  else {
    console.log('AR Unavailable');
  }
  ```

- And finally we can launch the AR, with a fallback option to open the Plattar Launch page if it fails or if AR is unavailable
  ```javascript
  function launchAR(){
    if (PlattarARAdapter.Util.canAugment()) {
      embed.startAR()
      .catch(function(err) {
        console.error('Error starting AR:', err);
        toggleLaunchPage(true);
      });
    }
    else {
      // fallback to rendering QR Code
      toggleLaunchPage(true);
    }
  }
  ```


### Final Result

<iframe height="600" style="width: 100%;" scrolling="no" title="Changing to AR Mode" src="https://codepen.io/plattar/embed/ZYzwJqe?default-tab=js%2Cresult&editable=true" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/plattar/pen/ZYzwJqe">
  Changing to AR Mode</a> by Plattar (<a href="https://codepen.io/plattar">@plattar</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

### Demonstration
As AR only works on supported devices, here is a video of the user experience opening the webpage on a desktop computer which displays the QR code to the open the AR experience on the mobile device.
![[../images/ARDemo.gif]]{ width=400px }

### Next Step
Next we will go over how to use two embed nodes side-by-side to display both the 3D Viewer and a QR code that can be scanned by mobile devices to open AR.
[Go to next step](./maintain-viewer-and-qr.md)