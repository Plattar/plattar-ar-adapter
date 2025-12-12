[Back to Home](/)

# Working with User-Defined SKU Field

The following examples use the latest version of [plattar-api](https://github.com/Plattar/plattar-api) SDK that allows interfacing with the Plattar REST API.

The SKU field can be defined via the Plattar CMS in either the **Product** or **ProductVariation** objects.

## Get User-Defined SKU from Product Object using Scene ID

![Product SKU in CMS](../images/product-sku-cms.png)

The following code example shows how to get the user-defined **SKU** field from the Product object in the provided Scene. Note that a Scene can have many products.

For the purposes of this example, we use a pre-defined scene with id `c0afc220-8a0f-11ec-97f3-d95bfb17823a`

```html
<html>

<head>
  <title>Get Product SKU Example</title>
  <script src="https://cdn.jsdelivr.net/npm/@plattar/plattar-api/build/es2019/plattar-api.min.js"></script>
</head>

<body>
  <script>
    // This is equivalent to performing GET as follows:
    // GET https://app.plattar.com/api/v2/scene/c0afc220-8a0f-11ec-97f3-d95bfb17823a?include=sceneproduct,sceneproduct.product
    const scene = new Plattar.Scene("c0afc220-8a0f-11ec-97f3-d95bfb17823a");
    scene.include(Plattar.SceneProduct);
    scene.include(Plattar.SceneProduct.include(Plattar.Product));

    scene.get().then((scene) => {
      // grab the scene-products list from the scene instance
      const sceneProducts = scene.relationships.filter(Plattar.SceneProduct);

      // loop through all scene-products
      sceneProducts.forEach((sceneProduct) => {
        // get the product from the scene-product instance
        const product = sceneProduct.relationships.find(Plattar.Product);

        if (product) {
          // print the SKU
          console.log("---------");
          console.log("SceneProduct id = " + sceneProduct.id);
          console.log("Product id = " + product.id);
          console.log("Product sku (user-defined) = " + product.attributes.sku);
        }
      });
    }).catch((err) => {
      console.error("Error fetching scene:", err);
    });
  </script>

</body>
</html>
```

## Get User-Defined SKU from Product Variation Object using Scene ID

![Product Variation SKU in CMS](../images/variation-sku-cms.png)

The following code example shows how to get the user-defined **SKU** field from the ProductVariation object in the provided Scene. Note that a Scene can have many products and products can have many product variations.

For the purposes of this example, we use a pre-defined scene with id `c0afc220-8a0f-11ec-97f3-d95bfb17823a`

```html
<html>

<head>
  <title>Get Product Variation SKU Example</title>
  <script src="https://cdn.jsdelivr.net/npm/@plattar/plattar-api/build/es2019/plattar-api.min.js"></script>
</head>

<body>
  <script>
    // This is equivalent to performing GET as follows:
    // GET https://app.plattar.com/api/v2/scene/c0afc220-8a0f-11ec-97f3-d95bfb17823a?include=sceneproduct,sceneproduct.product,sceneproduct.product.productvariation
    const scene = new Plattar.Scene("c0afc220-8a0f-11ec-97f3-d95bfb17823a");
    scene.include(Plattar.SceneProduct);
    scene.include(Plattar.SceneProduct.include(Plattar.Product));
    scene.include(Plattar.SceneProduct.include(Plattar.Product.include(Plattar.ProductVariation)));

    scene.get().then((scene) => {
      // grab the scene-products list from the scene instance
      const sceneProducts = scene.relationships.filter(Plattar.SceneProduct);

      // loop through all scene-products
      sceneProducts.forEach((sceneProduct) => {
        // get the product from the scene-product instance
        const product = sceneProduct.relationships.find(Plattar.Product);

        if (product) {
          // get the product-variation list from the product instance
          const productVariations = product.relationships.filter(Plattar.ProductVariation);

          productVariations.forEach((productVariation) => {
            // print the SKU
            console.log("---------");
            console.log("SceneProduct id = " + sceneProduct.id);
            console.log("Product id = " + product.id);
            console.log("Product sku (user-defined) = " + product.attributes.sku);
            console.log("ProductVariation id = " + productVariation.id);
            console.log("ProductVariation sku (user-defined) = " + productVariation.attributes.sku);
          });
        }
      });
    }).catch((err) => {
      console.error("Error fetching scene:", err);
    });
  </script>

</body>

</html>
```

## Practical Use Cases

### E-commerce Integration

Map Plattar products to your e-commerce system using SKUs:

```javascript
const scene = new Plattar.Scene("your-scene-id");
scene.include(Plattar.SceneProduct);
scene.include(Plattar.SceneProduct.include(Plattar.Product));
scene.include(Plattar.SceneProduct.include(Plattar.Product.include(Plattar.ProductVariation)));

scene.get().then((scene) => {
  const sceneProducts = scene.relationships.filter(Plattar.SceneProduct);

  sceneProducts.forEach((sceneProduct) => {
    const product = sceneProduct.relationships.find(Plattar.Product);

    if (product) {
      const productVariations = product.relationships.filter(Plattar.ProductVariation);

      productVariations.forEach((variation) => {
        // Use SKU to fetch pricing from your e-commerce system
        fetchProductDetails(variation.attributes.sku).then((details) => {
          console.log(`${variation.attributes.sku}: $${details.price}`);
        });
      });
    }
  });
});

async function fetchProductDetails(sku) {
  // Fetch from your e-commerce API
  const response = await fetch(`/api/products/${sku}`);
  return response.json();
}
```

### Building a Configurator with Pricing

Create a product configurator that displays prices based on SKUs:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Product Configurator with Pricing</title>
  <script src="https://cdn.jsdelivr.net/npm/@plattar/plattar-api/build/es2019/plattar-api.min.js"></script>
  <script src="https://sdk.plattar.com/plattar-plugin.min.js"></script>
</head>
<body>
  <div id="configurator">
    <plattar-embed id="embed" scene-id="c0afc220-8a0f-11ec-97f3-d95bfb17823a"></plattar-embed>
    <div id="price-display">Select options to see price</div>
    <div id="variation-selector"></div>
  </div>

  <script>
    const priceMap = {}; // Map of SKU to price

    // Fetch scene data and build configurator
    const scene = new Plattar.Scene("c0afc220-8a0f-11ec-97f3-d95bfb17823a");
    scene.include(Plattar.SceneProduct);
    scene.include(Plattar.SceneProduct.include(Plattar.Product));
    scene.include(Plattar.SceneProduct.include(Plattar.Product.include(Plattar.ProductVariation)));

    scene.get().then((scene) => {
      const sceneProducts = scene.relationships.filter(Plattar.SceneProduct);
      const selector = document.getElementById("variation-selector");

      sceneProducts.forEach((sceneProduct) => {
        const product = sceneProduct.relationships.find(Plattar.Product);

        if (product) {
          const productVariations = product.relationships.filter(Plattar.ProductVariation);

          // Create selector for this product
          const select = document.createElement("select");
          select.onchange = (e) => {
            const sku = e.target.value;
            updatePrice(sku);
            updateViewer(e.target.selectedOptions[0].dataset.variationId);
          };

          productVariations.forEach((variation) => {
            const option = document.createElement("option");
            option.value = variation.attributes.sku;
            option.textContent = variation.attributes.title || variation.attributes.sku;
            option.dataset.variationId = variation.id;
            select.appendChild(option);

            // Fetch price for this SKU
            fetchPrice(variation.attributes.sku).then((price) => {
              priceMap[variation.attributes.sku] = price;
            });
          });

          selector.appendChild(select);
        }
      });
    });

    function updatePrice(sku) {
      const priceDisplay = document.getElementById("price-display");
      const price = priceMap[sku];
      
      if (price) {
        priceDisplay.textContent = `Price: $${price.toFixed(2)}`;
      }
    }

    function updateViewer(variationId) {
      const embed = document.getElementById("embed");
      embed.viewer.messenger.selectVariationID(variationId);
    }

    async function fetchPrice(sku) {
      // Simulate API call - replace with your actual pricing API
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(Math.random() * 100 + 50); // Random price between $50-$150
        }, 100);
      });
    }
  </script>
</body>
</html>
```

### Inventory Management

Check inventory levels for products using their SKUs:

```javascript
const scene = new Plattar.Scene("your-scene-id");
scene.include(Plattar.SceneProduct);
scene.include(Plattar.SceneProduct.include(Plattar.Product));

scene.get().then(async (scene) => {
  const sceneProducts = scene.relationships.filter(Plattar.SceneProduct);

  for (const sceneProduct of sceneProducts) {
    const product = sceneProduct.relationships.find(Plattar.Product);

    if (product && product.attributes.sku) {
      const inventory = await checkInventory(product.attributes.sku);
      
      console.log(`Product ${product.attributes.sku}:`);
      console.log(`  In Stock: ${inventory.inStock}`);
      console.log(`  Available: ${inventory.quantity}`);
    }
  }
});

async function checkInventory(sku) {
  // Check your inventory system
  const response = await fetch(`/api/inventory/${sku}`);
  return response.json();
}
```

## SKU Best Practices

### Naming Conventions

- Use consistent, meaningful SKU formats
- Include product category or type identifiers
- Make SKUs human-readable when possible
- Example: `SHIRT-RED-M`, `SHOE-BLUE-42`, `GLASS-CLEAR-001`

### Data Validation

Always validate SKU data:

```javascript
scene.get().then((scene) => {
  const sceneProducts = scene.relationships.filter(Plattar.SceneProduct);

  sceneProducts.forEach((sceneProduct) => {
    const product = sceneProduct.relationships.find(Plattar.Product);

    if (product) {
      // Check if SKU is defined
      if (!product.attributes.sku) {
        console.warn(`Product ${product.id} has no SKU defined`);
        return;
      }

      // Validate SKU format
      if (!isValidSKU(product.attributes.sku)) {
        console.error(`Invalid SKU format: ${product.attributes.sku}`);
        return;
      }

      // Use the SKU...
    }
  });
});

function isValidSKU(sku) {
  // Example validation: 3-20 characters, alphanumeric with hyphens
  return /^[A-Z0-9-]{3,20}$/i.test(sku);
}
```

## Error Handling

Implement robust error handling when working with SKUs:

```javascript
async function getProductBySKU(sceneId, targetSKU) {
  try {
    const scene = new Plattar.Scene(sceneId);
    scene.include(Plattar.SceneProduct);
    scene.include(Plattar.SceneProduct.include(Plattar.Product));

    const sceneData = await scene.get();
    const sceneProducts = sceneData.relationships.filter(Plattar.SceneProduct);

    for (const sceneProduct of sceneProducts) {
      const product = sceneProduct.relationships.find(Plattar.Product);

      if (product && product.attributes.sku === targetSKU) {
        return product;
      }
    }

    throw new Error(`Product with SKU ${targetSKU} not found`);
  } catch (err) {
    console.error("Error fetching product:", err);
    throw err;
  }
}

// Usage
getProductBySKU("scene-id", "SHIRT-RED-M")
  .then((product) => {
    console.log("Found product:", product);
  })
  .catch((err) => {
    console.error("Failed to get product:", err);
  });
```

## Related Guides

- [Get Live Scenes](guides/get-live-scene.md) - Working with live scenes
- [Selecting Variation SKU](installation/selecting-variation-sku.md) - Using SKUs to change variations
- [API Reference](installation/api-reference.md) - Complete API documentation
- [Plattar API Documentation](https://github.com/Plattar/plattar-api) - Full API SDK documentation
