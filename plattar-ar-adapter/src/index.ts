export * as version from "./version";
export * as ConfiguratorAR from "./ar/configurator-ar";
export * as ProductAR from "./ar/product-ar";
export * as SceneAR from "./ar/scene-ar";
export * as Util from "./util/util";

import PlattarEmbed from "./embed/plattar-embed";
import version from "./version";

if (customElements) {
    customElements.define("plattar-embed", PlattarEmbed);
}

console.log("using @plattar/plattar-ar-adapter v" + version);