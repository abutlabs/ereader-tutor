// Turns on W3C pointer events on Android (onPointerDown/Move/Up with
// pointerType "pen" | "touch" | "mouse", plus pen hover). React Native ships
// them behind ReactFeatureFlags.dispatchPointerEvents, which defaults to false;
// pen notes in the reader need them to tell the stylus from a finger.
const { withMainApplication } = require("expo/config-plugins");

const IMPORT = "import com.facebook.react.config.ReactFeatureFlags";
const FLAG = "ReactFeatureFlags.dispatchPointerEvents = true";

module.exports = function withPointerEvents(config) {
  return withMainApplication(config, (cfg) => {
    let src = cfg.modResults.contents;
    if (cfg.modResults.language !== "kt") {
      throw new Error("withPointerEvents: expected a Kotlin MainApplication");
    }
    if (!src.includes(IMPORT)) {
      src = src.replace(/^(package [^\n]+\n)/, `$1\n${IMPORT}\n`);
    }
    if (!src.includes(FLAG)) {
      const next = src.replace(/(override fun onCreate\(\) \{\n)(\s*)/, `$1$2${FLAG}\n$2`);
      if (next === src) throw new Error("withPointerEvents: onCreate() not found in MainApplication.kt");
      src = next;
    }
    cfg.modResults.contents = src;
    return cfg;
  });
};
