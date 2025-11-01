// Verbose logging function, conditional on settings
import { SETTINGS } from "config.js";
export function verboseLog(message, ...args) {
        if (SETTINGS.ENABLE_VERBOSE_LOGGING) {
            console.log(message, ...args);
        }
    }
    
// Set version number in the header
  const versionEl = $("#bf-version-number");
  if (versionEl) {
    versionEl.innerHTML = `v${SETTINGS.VERSION_NUMBER}`;
  }
 