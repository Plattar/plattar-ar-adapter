[Back to Home](/)

# Hosted Configurator Events & Quote Submissions

The Plattar configurator (`configurator.plattar.com`) can be embedded on your website in an `<iframe>`. Once embedded, it can send your page:

- **the configuration** every time a shopper changes a selection, and on request
- **quote form submissions** from the configurator summary: the details the shopper entered plus the whole summary

Your page receives this data and passes it wherever you need it, such as your CRM, a form service or your own systems. The `ConfiguratorConnection` helper in this SDK does the connection for you.

> **Responsibilities:** Plattar hosts and maintains the configurator and the data it sends. The code on your website that receives that data, and what happens to it afterwards (including how personal details are stored and handled), is owned by your team.

## 1. Embed the configurator

Use the configurator link for your scene, available from the Plattar CMS:

```html
<iframe id="plattar-configurator"
        src="https://configurator.plattar.com/?sceneId=YOUR_SCENE_ID"
        style="width: 100%; height: 800px; border: 0"
        allow="camera; autoplay; xr-spatial-tracking"
        allowfullscreen></iframe>
```

## 2. Add the SDK

Requires plattar-ar-adapter **2.9.0** or later.

```html
<script src="https://cdn.jsdelivr.net/npm/@plattar/plattar-ar-adapter@2.9.0/build/es2019/plattar-ar-adapter.min.js"></script>
```

Or via NPM:

```console
npm install @plattar/plattar-ar-adapter
```

```javascript
import { ConfiguratorConnection } from "@plattar/plattar-ar-adapter";
```

## 3. Connect and listen

```javascript
const configurator = PlattarARAdapter.ConfiguratorConnection.connect("plattar-configurator");

// Every time the shopper changes a selection
configurator.on("configurationchanged", (configuration) => {
  console.log(configuration.selections, configuration.shareUrl);
});

// Quote form submissions
configurator.onQuoteSubmitted(async (submission) => {
  // submission.form          -> { name, email, company }
  // submission.summary       -> everything the summary shows (see below)
  // submission.configuration -> the configuration report

  await fetch("/api/enquiries", {           // your own endpoint / CRM / form service
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(submission),
  });
});

// Ask for the current configuration at any time
const configuration = await configurator.getReport();
```

### What the shopper sees

While a quote handler is set with `onQuoteSubmitted`, your page handles enquiries instead of the configurator's built-in email:

| Your handler | The configurator form shows |
|---|---|
| finishes (returns nothing, `true` or `{ ok: true }`) | "Thanks, your enquiry has been sent" |
| returns `{ ok: false, message: "..." }` | your message, and the shopper can try again |
| throws an error, or takes longer than 15 seconds | a general "couldn't send your enquiry" error |

To receive submissions **without** taking over (the configurator still opens its email as usual), listen with `configurator.on("quotesubmitted", ...)` and don't set a quote handler.

If the configurator isn't connected to your page (for example it's opened directly), the form behaves as usual.

## Data reference

### Quote submission

```javascript
{
  submissionId: "2f1c…",                 // unique per submission
  submittedAt: "2026-10-14T03:12:45.120Z",
  form: { name: "…", email: "…", company: "…" },
  summary: {
    title: "Aperio IL100",               // scene title
    items: [{                            // each line of the summary
      product: "Reader Colour",
      selected: "Black",
      productSku: "772-FINKIT Reader",
      variationSku: "IL100-1",
      price: 120,                        // when the scene shows prices
      productId: "…", sceneProductId: "…", variationId: "…",
      image: "https://…"                 // swatch / thumbnail
    }],
    roomPlannerItems: [],                // room planner scenes only
    customTextures: [],                  // shopper-uploaded textures, if any
    combinedSku: "IL100-100NA166NSCT",   // when the scene shows a combined SKU
    priceTotal: 860,                     // when the scene shows prices
    shareUrl: "https://c.plattar.com/…", // link back to this exact configuration
    previewImage: "data:image/png;base64,…"
  },
  configuration: { /* configuration report, below */ }
}
```

### Configuration report

Sent with `configurationchanged`, returned by `getReport()` and included in every quote submission:

```javascript
{
  sceneId: "…",
  selections: [{
    productName: "Reader Colour",
    variationName: "Black",
    variationSku: "IL100-1",
    sceneProductId: "…",
    variationId: "…"
  }],
  configurationState: "…",               // restores this configuration
  shareUrl: "https://configurator.plattar.com/…"
}
```

`summary.items` lists what the summary shows; `configuration.selections` lists every option shown in the configurator's options panel.

## Without the SDK

The helper wraps the configurator's `postMessage` protocol. Every message is `{ eventName, data }`.

| Direction | `eventName` | `data` |
|---|---|---|
| your page → configurator | `setup` | `{ handlesQuote: true }` to handle quote submissions yourself (omit otherwise) |
| configurator → your page | `setupconfirm` | — |
| your page → configurator | `getreport` | — |
| configurator → your page | `report` / `configurationchanged` | configuration report |
| configurator → your page | `quotesubmitted` | quote submission |
| your page → configurator | `quotereceived` | `{ submissionId, ok, message? }` (required when you sent `handlesQuote: true`) |

Send `setup` after the iframe loads, repeating every half second until `setupconfirm` arrives. Post to the configurator's origin (`https://configurator.plattar.com`), and only accept messages whose `event.origin` is that origin and whose `event.source` is the configurator iframe's window.

## Related Guides

- [Configurator Integration](integrations/configurator-integration.md) - Embedding scenes with the SDK
- [Get Product SKU](guides/get-product-sku.md) - Working with SKUs
- [API Reference](installation/api-reference.md) - Complete API documentation
