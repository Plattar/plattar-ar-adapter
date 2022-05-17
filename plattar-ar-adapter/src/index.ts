export * as PlattarWeb from "@plattar/plattar-web";
export * as PlattarQRCode from "@plattar/plattar-qrcode";

export * as version from "./version";
export { LauncherAR } from "./ar/launcher-ar";
export { LauncherAROptions } from "./ar/launcher-ar";
export { ProductAR } from "./ar/product-ar";
export { SceneProductAR } from "./ar/scene-product-ar";
export { SceneAR } from "./ar/scene-ar";
export { ModelAR } from "./ar/model-ar";
export { RawAR } from "./ar/raw-ar";
export { Util } from "./util/util";
export { ConfiguratorState } from "./util/configurator-state";

import PlattarEmbed from "./embed/plattar-embed";
import version from "./version";

if (customElements) {
    if (customElements.get("plattar-embed") === undefined) {
        customElements.define("plattar-embed", PlattarEmbed);
    }
}

console.log("using @plattar/plattar-ar-adapter v" + version);