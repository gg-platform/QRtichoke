// Settings interface for type safety
interface AppSettings {
  ENABLE_VERBOSE_LOGGING: boolean
  ENABLE_RATE_LIMITING: boolean
  RATE_LIMIT_MAX_REQUESTS_PER_MINUTE_WHEN_ENABLED: number
}

// SETTINGS
const SETTINGS: AppSettings = {
  ENABLE_VERBOSE_LOGGING: false, // Enable for testing
  ENABLE_RATE_LIMITING: false,
  RATE_LIMIT_MAX_REQUESTS_PER_MINUTE_WHEN_ENABLED: 100
}

export default SETTINGS
export type { AppSettings }