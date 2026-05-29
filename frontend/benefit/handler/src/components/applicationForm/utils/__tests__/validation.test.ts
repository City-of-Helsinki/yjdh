import {
  APPLICATION_FIELD_KEYS,
  MAX_VERY_LONG_STRING_LENGTH,
} from 'benefit/handler/constants';
import {
  APPLICATION_ORIGINS,
  ORGANIZATION_TYPES,
  VALIDATION_MESSAGE_KEYS,
} from 'benefit-shared/constants';
import { TFunction } from 'next-i18next';
import * as Yup from 'yup';

import { getValidationSchema } from '../validation';

const t = ((key: string) => key) as TFunction;

const getSchema = (): Yup.AnyObjectSchema =>
  getValidationSchema(
    t,
    ORGANIZATION_TYPES.COMPANY,
    APPLICATION_ORIGINS.HANDLER
  ) as Yup.AnyObjectSchema;

describe('handler application form validation for HL-1809 fields', () => {
  it('requires companyNumberOfEmployees', async () => {
    await expect(
      getSchema().validateAt(
        APPLICATION_FIELD_KEYS.COMPANY_NUMBER_OF_EMPLOYEES,
        {
          [APPLICATION_FIELD_KEYS.COMPANY_NUMBER_OF_EMPLOYEES]: null,
        }
      )
    ).rejects.toThrow(VALIDATION_MESSAGE_KEYS.REQUIRED);
  });

  it('rejects non-numeric companyNumberOfEmployees', async () => {
    await expect(
      getSchema().validateAt(
        APPLICATION_FIELD_KEYS.COMPANY_NUMBER_OF_EMPLOYEES,
        {
          [APPLICATION_FIELD_KEYS.COMPANY_NUMBER_OF_EMPLOYEES]: 'abc',
        }
      )
    ).rejects.toThrow(VALIDATION_MESSAGE_KEYS.NUMBER_INVALID);
  });

  it('accepts numeric companyNumberOfEmployees', async () => {
    await expect(
      getSchema().validateAt(
        APPLICATION_FIELD_KEYS.COMPANY_NUMBER_OF_EMPLOYEES,
        {
          [APPLICATION_FIELD_KEYS.COMPANY_NUMBER_OF_EMPLOYEES]: '100',
        }
      )
    ).resolves.toBe('100');
  });

  it('requires companyBusinessBrief', async () => {
    await expect(
      getSchema().validateAt(APPLICATION_FIELD_KEYS.COMPANY_BUSINESS_BRIEF, {
        [APPLICATION_FIELD_KEYS.COMPANY_BUSINESS_BRIEF]: '',
      })
    ).rejects.toThrow(VALIDATION_MESSAGE_KEYS.REQUIRED);
  });

  it('rejects too long companyBusinessBrief', async () => {
    await expect(
      getSchema().validateAt(APPLICATION_FIELD_KEYS.COMPANY_BUSINESS_BRIEF, {
        [APPLICATION_FIELD_KEYS.COMPANY_BUSINESS_BRIEF]: 'a'.repeat(
          MAX_VERY_LONG_STRING_LENGTH + 1
        ),
      })
    ).rejects.toThrow(VALIDATION_MESSAGE_KEYS.STRING_MAX);
  });

  it('requires otherFinancialSupportForEmployment', async () => {
    await expect(
      getSchema().validateAt(
        APPLICATION_FIELD_KEYS.OTHER_FINANCIAL_SUPPORT_FOR_EMPLOYMENT,
        {
          [APPLICATION_FIELD_KEYS.OTHER_FINANCIAL_SUPPORT_FOR_EMPLOYMENT]: null,
        }
      )
    ).rejects.toThrow(VALIDATION_MESSAGE_KEYS.REQUIRED);
  });

  it('accepts false for otherFinancialSupportForEmployment', async () => {
    await expect(
      getSchema().validateAt(
        APPLICATION_FIELD_KEYS.OTHER_FINANCIAL_SUPPORT_FOR_EMPLOYMENT,
        {
          [APPLICATION_FIELD_KEYS.OTHER_FINANCIAL_SUPPORT_FOR_EMPLOYMENT]:
            false,
        }
      )
    ).resolves.toBe(false);
  });

  it('requires roleOfEmployeeInOrganization', async () => {
    await expect(
      getSchema().validateAt(
        APPLICATION_FIELD_KEYS.ROLE_OF_EMPLOYEE_IN_ORGANIZATION,
        {
          [APPLICATION_FIELD_KEYS.ROLE_OF_EMPLOYEE_IN_ORGANIZATION]: '',
        }
      )
    ).rejects.toThrow(VALIDATION_MESSAGE_KEYS.REQUIRED);
  });
});
