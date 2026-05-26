import { MAX_VERY_LONG_STRING_LENGTH } from 'benefit/applicant/constants';
import {
  APPLICATION_FIELDS_STEP1_KEYS,
  VALIDATION_MESSAGE_KEYS,
} from 'benefit-shared/constants';
import { TFunction } from 'next-i18next';

import { getValidationSchema } from '../validation';

const mockT: TFunction = ((key: string, options?: Record<string, unknown>) => {
  if (key === VALIDATION_MESSAGE_KEYS.REQUIRED) return 'Field is required';
  if (key === VALIDATION_MESSAGE_KEYS.NUMBER_INVALID) return 'Invalid number';
  if (key === VALIDATION_MESSAGE_KEYS.STRING_MAX) {
    return options?.max
      ? `Maximum ${options.max} characters allowed`
      : 'String is too long';
  }
  return key;
}) as TFunction;

describe('step1 validation schema', () => {
  describe('COMPANY_NUMBER_OF_EMPLOYEES', () => {
    it('should require company number of employees', async () => {
      const schema = getValidationSchema('company', mockT);

      await expect(
        schema.validateAt(
          APPLICATION_FIELDS_STEP1_KEYS.COMPANY_NUMBER_OF_EMPLOYEES,
          {
            [APPLICATION_FIELDS_STEP1_KEYS.COMPANY_NUMBER_OF_EMPLOYEES]: undefined,
          }
        )
      ).rejects.toThrow('Field is required');
    });

    it('should accept valid numeric string for company number of employees', async () => {
      const schema = getValidationSchema('company', mockT);

      const result = await schema.validateAt(
        APPLICATION_FIELDS_STEP1_KEYS.COMPANY_NUMBER_OF_EMPLOYEES,
        {
          [APPLICATION_FIELDS_STEP1_KEYS.COMPANY_NUMBER_OF_EMPLOYEES]: '50',
        }
      );

      expect(result).toBe('50');
    });

    it('should reject non-numeric values for company number of employees', async () => {
      const schema = getValidationSchema('company', mockT);

      await expect(
        schema.validateAt(
          APPLICATION_FIELDS_STEP1_KEYS.COMPANY_NUMBER_OF_EMPLOYEES,
          {
            [APPLICATION_FIELDS_STEP1_KEYS.COMPANY_NUMBER_OF_EMPLOYEES]: 'abc',
          }
        )
      ).rejects.toThrow('Invalid number');
    });

    it('should reject decimal values for company number of employees', async () => {
      const schema = getValidationSchema('company', mockT);

      await expect(
        schema.validateAt(
          APPLICATION_FIELDS_STEP1_KEYS.COMPANY_NUMBER_OF_EMPLOYEES,
          {
            [APPLICATION_FIELDS_STEP1_KEYS.COMPANY_NUMBER_OF_EMPLOYEES]: '10.5',
          }
        )
      ).rejects.toThrow('Invalid number');
    });

    it('should accept zero as valid company number of employees', async () => {
      const schema = getValidationSchema('company', mockT);

      const result = await schema.validateAt(
        APPLICATION_FIELDS_STEP1_KEYS.COMPANY_NUMBER_OF_EMPLOYEES,
        {
          [APPLICATION_FIELDS_STEP1_KEYS.COMPANY_NUMBER_OF_EMPLOYEES]: '0',
        }
      );

      expect(result).toBe('0');
    });
  });

  describe('COMPANY_BUSINESS_BRIEF', () => {
    it('should require company business brief', async () => {
      const schema = getValidationSchema('company', mockT);

      await expect(
        schema.validateAt(
          APPLICATION_FIELDS_STEP1_KEYS.COMPANY_BUSINESS_BRIEF,
          {
            [APPLICATION_FIELDS_STEP1_KEYS.COMPANY_BUSINESS_BRIEF]: '',
          }
        )
      ).rejects.toThrow('Field is required');
    });

    it('should accept valid company business brief text', async () => {
      const schema = getValidationSchema('company', mockT);
      const validText = 'This is a valid business description';

      const result = await schema.validateAt(
        APPLICATION_FIELDS_STEP1_KEYS.COMPANY_BUSINESS_BRIEF,
        {
          [APPLICATION_FIELDS_STEP1_KEYS.COMPANY_BUSINESS_BRIEF]: validText,
        }
      );

      expect(result).toBe(validText);
    });

    it('should trim whitespace from company business brief', async () => {
      const schema = getValidationSchema('company', mockT);
      const textWithWhitespace = '  Business description  ';

      const result = await schema.validateAt(
        APPLICATION_FIELDS_STEP1_KEYS.COMPANY_BUSINESS_BRIEF,
        {
          [APPLICATION_FIELDS_STEP1_KEYS.COMPANY_BUSINESS_BRIEF]:
            textWithWhitespace,
        }
      );

      expect(result).toBe('Business description');
    });

    it('should reject company business brief exceeding maximum length', async () => {
      const schema = getValidationSchema('company', mockT);
      const tooLongText = 'a'.repeat(MAX_VERY_LONG_STRING_LENGTH + 1);

      await expect(
        schema.validateAt(
          APPLICATION_FIELDS_STEP1_KEYS.COMPANY_BUSINESS_BRIEF,
          {
            [APPLICATION_FIELDS_STEP1_KEYS.COMPANY_BUSINESS_BRIEF]: tooLongText,
          }
        )
      ).rejects.toThrow(
        `Maximum ${MAX_VERY_LONG_STRING_LENGTH} characters allowed`
      );
    });

    it('should accept company business brief at maximum length', async () => {
      const schema = getValidationSchema('company', mockT);
      const maxLengthText = 'a'.repeat(MAX_VERY_LONG_STRING_LENGTH);

      const result = await schema.validateAt(
        APPLICATION_FIELDS_STEP1_KEYS.COMPANY_BUSINESS_BRIEF,
        {
          [APPLICATION_FIELDS_STEP1_KEYS.COMPANY_BUSINESS_BRIEF]: maxLengthText,
        }
      );

      expect(result).toBe(maxLengthText);
    });
  });
});
