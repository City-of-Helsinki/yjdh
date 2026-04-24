/* eslint-disable scanjs-rules/identifier_sessionStorage */
import Application from 'shared/types/application';

import ApplicationPersistenceService from '../ApplicationPersistenceService';

const EMPLOYER_DATA_KEY = 'kesaseteli_employer_data';

describe('ApplicationPersistenceService', () => {
  const mockEmployerData: Partial<Application> = {
    contact_person_name: 'Teppo Testi',
    contact_person_email: 'teppo@testi.com',
    contact_person_phone_number: '0401234567',
    street_address: 'Testikatu 1',
    bank_account_number: 'FI1234567890',
  };

  beforeEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  describe('storeEmployerData and getEmployerData', () => {
    it('should store and retrieve employer data', () => {
      ApplicationPersistenceService.storeEmployerData(mockEmployerData);
      const retrievedData = ApplicationPersistenceService.getEmployerData();
      expect(retrievedData).toEqual(mockEmployerData);
    });

    it('should store data in obfuscated (Base64) format', () => {
      ApplicationPersistenceService.storeEmployerData(mockEmployerData);
      const storedRaw = sessionStorage.getItem(EMPLOYER_DATA_KEY);

      // Verify it's not JSON anymore
      expect(() => {
        JSON.parse(storedRaw || '');
      }).toThrow();

      // Verify it can be decoded back to JSON
      const decoded = atob(storedRaw || '');
      expect(JSON.parse(decoded)).toEqual(mockEmployerData);
    });

    it('should sanitize data before storing', () => {
      const sensitiveData: Partial<Application> = {
        ...mockEmployerData,
        id: 'sensitive-id',
        status: 'submitted',
      } as unknown as Partial<Application>;

      ApplicationPersistenceService.storeEmployerData(sensitiveData);
      const retrievedData = ApplicationPersistenceService.getEmployerData();

      expect(retrievedData).toEqual(mockEmployerData);
      expect(retrievedData).not.toHaveProperty('id');
      expect(retrievedData).not.toHaveProperty('status');
    });

    it('should return null if no employer data is stored', () => {
      expect(ApplicationPersistenceService.getEmployerData()).toBeNull();
    });

    it('should return null if stored data is corrupted', () => {
      sessionStorage.setItem(EMPLOYER_DATA_KEY, 'invalid-base64-!!!');
      expect(ApplicationPersistenceService.getEmployerData()).toBeNull();
    });
  });

  describe('clearAll', () => {
    it('should clear all persisted data', () => {
      ApplicationPersistenceService.storeEmployerData(mockEmployerData);

      ApplicationPersistenceService.clearAll();

      expect(ApplicationPersistenceService.getEmployerData()).toBeNull();
    });

    it('should only clear application-related data from sessionStorage', () => {
      sessionStorage.setItem('other_key', 'other_value');
      ApplicationPersistenceService.storeEmployerData(mockEmployerData);

      ApplicationPersistenceService.clearAll();

      expect(sessionStorage.getItem('other_key')).toBe('other_value');
      expect(ApplicationPersistenceService.getEmployerData()).toBeNull();
    });
  });
});
/* eslint-enable scanjs-rules/identifier_sessionStorage */
