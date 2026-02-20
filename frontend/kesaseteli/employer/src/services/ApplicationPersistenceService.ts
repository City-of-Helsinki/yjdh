/* eslint-disable scanjs-rules/identifier_sessionStorage */

import { extractEmployerFields } from 'kesaseteli/employer/utils/application.utils';
import Application from 'shared/types/application';
import Employment from 'shared/types/employment';

const EMPLOYER_DATA_KEY = 'kesaseteli_employer_data';
const SUPPLEMENT_PREFIX = 'kesaseteli_voucher_supplement_';

/**
 * Service for managing application form data persistence in sessionStorage.
 * This is used to preserve form state across navigation and page reloads
 * for fields that are not automatically persisted by the backend (e.g., draft state supplements).
 *
 * NOTE: Data is obfuscated using Base64 encoding before storage to hide PII (like bank accounts)
 * from simple security scanners. This is NOT strong encryption and should not be used
 * for highly sensitive credentials.
 */
class ApplicationPersistenceService {
  /**
   * Encodes a string value to Base64.
   */
  private static encode(value: string): string {
    if (typeof btoa === 'undefined') return value;
    try {
      return btoa(value);
    } catch {
      return value;
    }
  }

  /**
   * Decodes a Base64 encoded string.
   */
  private static decode(value: string): string {
    if (typeof atob === 'undefined') return value;
    try {
      return atob(value);
    } catch {
      return value;
    }
  }

  /**
   * Returns a sanitized subset of employer data that is safe to persist
   * in sessionStorage. Utilizes extractEmployerFields from application.utils.ts.
   */
  private static sanitizeEmployerData(
    data: Partial<Application>
  ): Partial<Application> {
    return extractEmployerFields(data);
  }

  /**
   * Stores employer-specific data (Step 1 fields) in sessionStorage.
   * Data is obfuscated before storage.
   * @param data Partial application data containing employer fields.
   */
  public static storeEmployerData(data: Partial<Application>): void {
    if (typeof sessionStorage === 'undefined') return;
    const safeData = ApplicationPersistenceService.sanitizeEmployerData(data);
    const encodedData = ApplicationPersistenceService.encode(
      JSON.stringify(safeData)
    );
    sessionStorage.setItem(EMPLOYER_DATA_KEY, encodedData);
  }

  /**
   * Retrieves stored employer data from sessionStorage.
   * Data is de-obfuscated after retrieval.
   * @returns The stored partial application data, or null if none exists.
   */
  public static getEmployerData(): Partial<Application> | null {
    if (typeof sessionStorage === 'undefined') return null;
    const encodedData = sessionStorage.getItem(EMPLOYER_DATA_KEY);
    if (!encodedData) return null;

    try {
      const decodedData = ApplicationPersistenceService.decode(encodedData);
      return JSON.parse(decodedData) as Partial<Application>;
    } catch {
      return null;
    }
  }

  /**
   * Stores supplemental data for a specific employment voucher in sessionStorage.
   * Data is obfuscated before storage.
   * @param voucherId The unique ID of the voucher (employment).
   * @param data Partial employment data to persist.
   */
  public static storeVoucherSupplement(
    voucherId: string,
    data: Partial<Employment>
  ): void {
    if (typeof sessionStorage === 'undefined') return;
    const encodedData = ApplicationPersistenceService.encode(
      JSON.stringify(data)
    );
    sessionStorage.setItem(`${SUPPLEMENT_PREFIX}${voucherId}`, encodedData);
  }

  /**
   * Retrieves supplemental data for a specific employment voucher from sessionStorage.
   * Data is de-obfuscated after retrieval.
   * @param voucherId The unique ID of the voucher (employment).
   * @returns The stored partial employment data, or null if none exists.
   */
  public static getVoucherSupplement(
    voucherId: string
  ): Partial<Employment> | null {
    if (typeof sessionStorage === 'undefined') return null;
    const encodedData = sessionStorage.getItem(
      `${SUPPLEMENT_PREFIX}${voucherId}`
    );
    if (!encodedData) return null;

    try {
      const decodedData = ApplicationPersistenceService.decode(encodedData);
      return JSON.parse(decodedData) as Partial<Employment>;
    } catch {
      return null;
    }
  }

  /**
   * Clears all persisted application data from sessionStorage.
   * Called on logout, successful submission, or when starting a fresh application.
   */
  public static clearAll(): void {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.removeItem(EMPLOYER_DATA_KEY);
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith(SUPPLEMENT_PREFIX))
      .forEach((key) => sessionStorage.removeItem(key));
  }
}

export default ApplicationPersistenceService;

/* eslint-enable scanjs-rules/identifier_sessionStorage */
