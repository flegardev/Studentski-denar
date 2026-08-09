export function isLocalAutomatedTestHarness() {
  if (import.meta.env.VITE_ENABLE_TEST_HARNESS !== 'true') return false
  if (typeof navigator === 'undefined' || !navigator.webdriver) return false
  if (typeof window === 'undefined') return false
  return window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
}
