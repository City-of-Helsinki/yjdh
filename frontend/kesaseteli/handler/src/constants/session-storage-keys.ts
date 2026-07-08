/**
 * Session storage keys used within the handler application.
 */
export const SESSION_STORAGE_KEYS = {
  /**
   * The active tab index (Pending vs. Processed) for the employer applications list.
   */
  EMPLOYER_APPLICATIONS_ACTIVE_TAB: 'employer-applications-active-tab',
  /**
   * The active tab index (Pending vs. Processed) for the youth applications list.
   */
  YOUTH_APPLICATIONS_ACTIVE_TAB: 'youth-applications-active-tab',
} as const;
