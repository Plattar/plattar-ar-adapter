[Back to Home](/)

# Advanced Visibility Control API

> **⚠️ Beta Functionality**  
> The functions documented on this page are currently in beta. Some features may not work as expected. If you encounter any issues, please [open an issue on the plattar-ar-adapter GitHub repository](https://github.com/Plattar/plattar-ar-adapter/issues).

This document covers advanced API functions for controlling the visibility of product variations in your scenes. These functions provide granular control over which variations are displayed, allowing for more complex configurator implementations.

## Overview

The visibility control API extends the standard variation selection functions by allowing you to:

- Show or hide all variations at once
- Show or hide specific variations without changing selection
- Display only specific variations while hiding all others

These functions are particularly useful for:
- Building custom UI controls
- Creating progressive reveal experiences
- Managing complex multi-product configurations
- Implementing conditional product displays

## Functions Reference

### showAllVariations

Shows all previously selected variations from all products in the scene.

**Syntax:**

```javascript
viewer.messenger.showAllVariations()
```

**Returns:**

`Promise<void>` - Resolves when all variations are visible

**Example:**

```javascript
const embed = document.getElementById("embed");

embed.viewer.messenger.showAllVariations()
  .then(() => {
    console.log("All variations are now visible");
  })
  .catch((err) => {
    console.error("Error showing variations:", err);
  });
```

---

### hideAllVariations

Hides all variations from all products in the scene.

**Syntax:**

```javascript
viewer.messenger.hideAllVariations()
```

**Returns:**

`Promise<void>` - Resolves when all variations are hidden

**Example:**

```javascript
const embed = document.getElementById("embed");

embed.viewer.messenger.hideAllVariations()
  .then(() => {
    console.log("All variations are now hidden");
  })
  .catch((err) => {
    console.error("Error hiding variations:", err);
  });
```

**Use Case:**

```javascript
// Hide all variations before showing a specific configuration
async function showCustomConfiguration() {
  await embed.viewer.messenger.hideAllVariations();
  await embed.viewer.messenger.showVariationByID("variation-id-1");
  await embed.viewer.messenger.showVariationByID("variation-id-2");
}
```

---

### showVariationByID

Shows a variation by its ID. This is an alias for `selectVariationID` that focuses on visibility control.

**Syntax:**

```javascript
viewer.messenger.showVariationByID(id: string | Array<string>)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **id** | `string` or `Array<string>` | Yes | Single variation ID or array of variation IDs to show |

**Returns:**

`Promise<void>` - Resolves when the variation(s) are visible

**Example:**

```javascript
const embed = document.getElementById("embed");

// Show single variation
embed.viewer.messenger.showVariationByID("936639e0-3854-11ec-b8ed-8d91c3e5372d")
  .then(() => {
    console.log("Variation is now visible");
  });

// Show multiple variations
embed.viewer.messenger.showVariationByID([
  "936639e0-3854-11ec-b8ed-8d91c3e5372d",
  "11d66560-3856-11ec-ac17-edcbe6ab5f51"
])
  .then(() => {
    console.log("Multiple variations are now visible");
  });
```

---

### hideVariationByID

Hides a variation by its ID, removing it from display.

**Syntax:**

```javascript
viewer.messenger.hideVariationByID(id: string | Array<string>)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **id** | `string` or `Array<string>` | Yes | Single variation ID or array of variation IDs to hide |

**Returns:**

`Promise<void>` - Resolves when the variation(s) are hidden

**Example:**

```javascript
const embed = document.getElementById("embed");

// Hide single variation
embed.viewer.messenger.hideVariationByID("936639e0-3854-11ec-b8ed-8d91c3e5372d")
  .then(() => {
    console.log("Variation is now hidden");
  });

// Hide multiple variations
embed.viewer.messenger.hideVariationByID([
  "936639e0-3854-11ec-b8ed-8d91c3e5372d",
  "11d66560-3856-11ec-ac17-edcbe6ab5f51"
])
  .then(() => {
    console.log("Multiple variations are now hidden");
  });
```

---

### showVariationBySKU

Shows all variations matching a SKU. This is an alias for `selectVariationSKU` that focuses on visibility control.

**Important:** SKUs can be replicated between products and are not unique. When calling this function, all products that match the SKU by variation will be displayed.

**Syntax:**

```javascript
viewer.messenger.showVariationBySKU(sku: string | Array<string>)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **sku** | `string` or `Array<string>` | Yes | Single SKU or array of SKUs to show |

**Returns:**

`Promise<void>` - Resolves when the variation(s) are visible

**Example:**

```javascript
const embed = document.getElementById("embed");

// Show single SKU
embed.viewer.messenger.showVariationBySKU("8z4m4")
  .then(() => {
    console.log("Variation with SKU is now visible");
  });

// Show multiple SKUs
embed.viewer.messenger.showVariationBySKU(["8z4m4", "pmk51", "zl33i"])
  .then(() => {
    console.log("Multiple variations are now visible");
  });
```

---

### hideVariationBySKU

Hides all variations matching a SKU.

**Important:** SKUs can be replicated between products and are not unique. When calling this function, all products that match the SKU by variation will be hidden.

**Syntax:**

```javascript
viewer.messenger.hideVariationBySKU(sku: string | Array<string>)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **sku** | `string` or `Array<string>` | Yes | Single SKU or array of SKUs to hide |

**Returns:**

`Promise<void>` - Resolves when the variation(s) are hidden

**Example:**

```javascript
const embed = document.getElementById("embed");

// Hide single SKU
embed.viewer.messenger.hideVariationBySKU("8z4m4")
  .then(() => {
    console.log("Variation with SKU is now hidden");
  });

// Hide multiple SKUs
embed.viewer.messenger.hideVariationBySKU(["8z4m4", "pmk51"])
  .then(() => {
    console.log("Multiple variations are now hidden");
  });
```

---

### showOnlyVariationByID

Shows only the specified variations by ID, hiding all other variations. This is useful when you want to display specific variations without manually hiding others.

**Syntax:**

```javascript
viewer.messenger.showOnlyVariationByID(id: string | Array<string>)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **id** | `string` or `Array<string>` | Yes | Single variation ID or array of variation IDs to show exclusively |

**Returns:**

`Promise<void>` - Resolves when only the specified variation(s) are visible

**Example:**

```javascript
const embed = document.getElementById("embed");

// Show only one variation
embed.viewer.messenger.showOnlyVariationByID("936639e0-3854-11ec-b8ed-8d91c3e5372d")
  .then(() => {
    console.log("Only the specified variation is visible");
  });

// Show only specific variations
embed.viewer.messenger.showOnlyVariationByID([
  "936639e0-3854-11ec-b8ed-8d91c3e5372d",
  "11d66560-3856-11ec-ac17-edcbe6ab5f51"
])
  .then(() => {
    console.log("Only specified variations are visible");
  });
```

**Use Case:**

```javascript
// Switch between different product configurations
function showSummerCollection() {
  embed.viewer.messenger.showOnlyVariationByID([
    "summer-shirt-id",
    "summer-shorts-id",
    "summer-hat-id"
  ]);
}

function showWinterCollection() {
  embed.viewer.messenger.showOnlyVariationByID([
    "winter-jacket-id",
    "winter-pants-id",
    "winter-hat-id"
  ]);
}
```

---

### showOnlyVariationBySKU

Shows only the specified variations by SKU, hiding all other variations. This is useful when you want to display specific variations without manually hiding others.

**Important:** SKUs can be replicated between products and are not unique. All products that match the specified SKUs will be shown, and all others will be hidden.

**Syntax:**

```javascript
viewer.messenger.showOnlyVariationBySKU(sku: string | Array<string>)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| **sku** | `string` or `Array<string>` | Yes | Single SKU or array of SKUs to show exclusively |

**Returns:**

`Promise<void>` - Resolves when only the specified variation(s) are visible

**Example:**

```javascript
const embed = document.getElementById("embed");

// Show only one SKU
embed.viewer.messenger.showOnlyVariationBySKU("8z4m4")
  .then(() => {
    console.log("Only the specified SKU is visible");
  });

// Show only specific SKUs
embed.viewer.messenger.showOnlyVariationBySKU(["8z4m4", "pmk51", "zl33i"])
  .then(() => {
    console.log("Only specified SKUs are visible");
  });
```

**Use Case:**

```javascript
// Filter products by collection using SKUs
function showPremiumCollection() {
  embed.viewer.messenger.showOnlyVariationBySKU([
    "PREMIUM-001",
    "PREMIUM-002",
    "PREMIUM-003"
  ]);
}

function showStandardCollection() {
  embed.viewer.messenger.showOnlyVariationBySKU([
    "STANDARD-001",
    "STANDARD-002"
  ]);
}
```

---

## Practical Examples

### Progressive Product Reveal

Create a step-by-step product reveal experience:

```javascript
const embed = document.getElementById("embed");

async function progressiveReveal() {
  // Start with everything hidden
  await embed.viewer.messenger.hideAllVariations();
  
  // Step 1: Show base product
  console.log("Step 1: Showing base product");
  await embed.viewer.messenger.showVariationByID("base-product-id");
  await delay(2000);
  
  // Step 2: Add color option
  console.log("Step 2: Adding color");
  await embed.viewer.messenger.showVariationByID("color-variation-id");
  await delay(2000);
  
  // Step 3: Add accessories
  console.log("Step 3: Adding accessories");
  await embed.viewer.messenger.showVariationByID([
    "accessory-1-id",
    "accessory-2-id"
  ]);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### Conditional Product Display

Show different products based on user selections:

```javascript
const embed = document.getElementById("embed");

function updateDisplay(userPreferences) {
  if (userPreferences.style === "modern") {
    embed.viewer.messenger.showOnlyVariationBySKU([
      "MODERN-CHAIR",
      "MODERN-TABLE",
      "MODERN-LAMP"
    ]);
  } else if (userPreferences.style === "classic") {
    embed.viewer.messenger.showOnlyVariationBySKU([
      "CLASSIC-CHAIR",
      "CLASSIC-TABLE",
      "CLASSIC-LAMP"
    ]);
  }
}
```

### Toggle Visibility Controls

Create UI controls to toggle product visibility:

```html
<button onclick="toggleProduct('product-1-id')">Toggle Product 1</button>
<button onclick="toggleProduct('product-2-id')">Toggle Product 2</button>
<button onclick="showAll()">Show All</button>
<button onclick="hideAll()">Hide All</button>

<plattar-embed id="embed" scene-id="your-scene-id"></plattar-embed>

<script>
const embed = document.getElementById("embed");
const visibilityState = {};

function toggleProduct(productId) {
  if (visibilityState[productId]) {
    embed.viewer.messenger.hideVariationByID(productId)
      .then(() => {
        visibilityState[productId] = false;
        console.log(`Product ${productId} hidden`);
      });
  } else {
    embed.viewer.messenger.showVariationByID(productId)
      .then(() => {
        visibilityState[productId] = true;
        console.log(`Product ${productId} shown`);
      });
  }
}

function showAll() {
  embed.viewer.messenger.showAllVariations()
    .then(() => {
      console.log("All products visible");
    });
}

function hideAll() {
  embed.viewer.messenger.hideAllVariations()
    .then(() => {
      console.log("All products hidden");
    });
}
</script>
```

### Build Your Own Configurator

Build a custom product configurator with visibility controls:

```html
<div id="configurator">
  <h3>Customize Your Product</h3>
  
  <div class="option-group">
    <label>Base Model:</label>
    <select id="base-model" onchange="updateConfiguration()">
      <option value="">None</option>
      <option value="MODEL-A">Model A</option>
      <option value="MODEL-B">Model B</option>
    </select>
  </div>
  
  <div class="option-group">
    <label>Color:</label>
    <select id="color" onchange="updateConfiguration()">
      <option value="">None</option>
      <option value="COLOR-RED">Red</option>
      <option value="COLOR-BLUE">Blue</option>
    </select>
  </div>
  
  <div class="option-group">
    <label>
      <input type="checkbox" id="accessory-1" onchange="updateConfiguration()">
      Add Premium Package
    </label>
  </div>
  
  <button onclick="resetConfiguration()">Reset</button>
</div>

<plattar-embed id="embed" scene-id="your-scene-id"></plattar-embed>

<script>
const embed = document.getElementById("embed");

async function updateConfiguration() {
  // Collect all selected options
  const selectedSKUs = [];
  
  const baseModel = document.getElementById("base-model").value;
  if (baseModel) selectedSKUs.push(baseModel);
  
  const color = document.getElementById("color").value;
  if (color) selectedSKUs.push(color);
  
  const accessory1 = document.getElementById("accessory-1").checked;
  if (accessory1) selectedSKUs.push("ACCESSORY-PREMIUM");
  
  // Show only selected variations
  if (selectedSKUs.length > 0) {
    await embed.viewer.messenger.showOnlyVariationBySKU(selectedSKUs);
  } else {
    await embed.viewer.messenger.hideAllVariations();
  }
}

function resetConfiguration() {
  document.getElementById("base-model").value = "";
  document.getElementById("color").value = "";
  document.getElementById("accessory-1").checked = false;
  embed.viewer.messenger.hideAllVariations();
}
</script>
```

## Error Handling

Always implement proper error handling when using these functions:

```javascript
const embed = document.getElementById("embed");

async function safeShowVariation(variationId) {
  try {
    await embed.viewer.messenger.showVariationByID(variationId);
    console.log("Variation shown successfully");
  } catch (error) {
    console.error("Failed to show variation:", error);
    // Fallback behavior
    alert("Unable to display the selected variation. Please try again.");
  }
}

async function safeHideAllVariations() {
  try {
    await embed.viewer.messenger.hideAllVariations();
    console.log("All variations hidden successfully");
  } catch (error) {
    console.error("Failed to hide variations:", error);
    // Handle error appropriately
  }
}
```

## Best Practices

### 1. Wait for Scene to Load

Always ensure the scene is loaded before calling visibility functions:

```javascript
const embed = document.getElementById("embed");

if (embed.viewer) {
  embed.viewer.context.setLoading = (params) => {
    if (params.loading === false) {
      // Scene is loaded, safe to use visibility functions
      embed.viewer.messenger.showAllVariations();
    }
  };
}
```

### 2. Use Async/Await

Use async/await for cleaner code when chaining multiple operations:

```javascript
async function configureProduct() {
  try {
    await embed.viewer.messenger.hideAllVariations();
    await embed.viewer.messenger.showVariationByID("base-id");
    await embed.viewer.messenger.showVariationByID("option-id");
    console.log("Configuration complete");
  } catch (error) {
    console.error("Configuration failed:", error);
  }
}
```

### 3. Combine with Other API Functions

These visibility functions work well with other API functions:

```javascript
async function showAndMoveToCamera(variationId, cameraId) {
  await embed.viewer.messenger.showOnlyVariationByID(variationId);
  await embed.viewer.messenger.moveToCamera(cameraId);
}

async function hideAndTakeScreenshot(variationId) {
  await embed.viewer.messenger.hideVariationByID(variationId);
  const screenshot = await embed.viewer.messenger.takeScreenshot({
    width: 800,
    height: 600
  });
  return screenshot;
}
```

## Troubleshooting

### Variations Not Hiding/Showing

If variations are not responding to visibility commands:

1. Verify the variation ID or SKU is correct
2. Ensure the scene has finished loading
3. Check that the variation exists in the current scene
4. Verify no other code is conflicting with visibility changes

### SKU Not Working as Expected

Remember that SKUs can be duplicated across multiple products:

```javascript
// This may affect multiple products if SKU is duplicated
embed.viewer.messenger.hideVariationBySKU("COMMON-SKU");

// Use variation IDs for precise control
embed.viewer.messenger.hideVariationByID("specific-variation-id");
```

## Reporting Issues

If you encounter issues with these beta functions, please report them on the [plattar-ar-adapter GitHub repository](https://github.com/Plattar/plattar-ar-adapter/issues). Include:

- SDK version
- Browser and device information
- Code snippet demonstrating the issue
- Expected vs actual behavior
- Console errors (if any)

## Related Documentation

- [API Reference](installation/api-reference.md) - Core API functions
- [Selecting Variations](installation/selecting-variation-id.md) - Basic variation selection
- [Multiple Variations](installation/selecting-variation-multiple.md) - Selecting multiple variations
- [Configurator Integration](integrations/configurator-integration.md) - Building configurators