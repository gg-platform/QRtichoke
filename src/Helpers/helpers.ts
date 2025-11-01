// Verbose logging function, conditional on settings
import SETTINGS from "./config"

export function verboseLog(message: string, ...args: any[]): void {
  if (SETTINGS.ENABLE_VERBOSE_LOGGING) {
    console.log(message, ...args)
  }
}