/**
 * Route path constants shared across all Kesäseteli frontend applications.
 *
 * Use these constants instead of hardcoded string literals when checking
 * or linking to common pages to prevent typos and ease future refactoring.
 */
export const ROUTES = {
  LOGIN: '/login',
  COOKIE_SETTINGS: '/cookie-settings',
  NO_ORGANISATION: '/no-organisation',
} as const;
