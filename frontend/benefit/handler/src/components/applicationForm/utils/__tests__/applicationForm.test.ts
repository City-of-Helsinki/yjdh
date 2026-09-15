import {
  APPLICATION_FIELD_KEYS,
  APPLICATION_INITIAL_VALUES,
} from 'benefit/handler/constants';
import { Application } from 'benefit/handler/types/application';
import {
  APPLICATION_ORIGINS,
  APPLICATION_STATUSES,
  ATTACHMENT_TYPES,
  PAY_SUBSIDY_GRANTED,
  PAY_SUBSIDY_OPTIONS,
} from 'benefit-shared/constants';
import { ApplicationData } from 'benefit-shared/types/application';
import { FormikErrors } from 'formik';
import { TFunction } from 'next-i18next';
import hdsToast from 'shared/components/toast/Toast';
import { BenefitAttachment } from 'shared/types/attachment';

import {
  errorToast,
  getApplication,
  getDates,
  getFields,
  getSubsidyOptions,
  handleErrorFieldKeys,
  requiredAttachments,
} from '../applicationForm';

jest.mock('shared/components/toast/Toast', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const t = ((key: string) => key) as TFunction;

describe('errorToast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls hdsToast with the given label and text, defaulting dismiss time to 0', () => {
    errorToast('Error label', 'Something went wrong');

    expect(hdsToast).toHaveBeenCalledWith({
      autoDismissTime: 0,
      type: 'error',
      labelText: 'Error label',
      text: 'Something went wrong',
    });
  });

  it('uses the given dismiss time when provided', () => {
    errorToast('Error label', 'Something went wrong', 5000);

    expect(hdsToast).toHaveBeenCalledWith({
      autoDismissTime: 5000,
      type: 'error',
      labelText: 'Error label',
      text: 'Something went wrong',
    });
  });
});

describe('getApplication', () => {
  it('returns initial values with DRAFT status for a new application without data', () => {
    const result = getApplication(undefined, undefined, true);

    expect(result.status).toBe(APPLICATION_STATUSES.DRAFT);
    expect(result.id).toBeUndefined();
    expect(result).toMatchObject({
      ...APPLICATION_INITIAL_VALUES,
      id: undefined,
      status: APPLICATION_STATUSES.DRAFT,
    });
  });

  it('returns initial values with HANDLING status when not a new application', () => {
    const result = getApplication(undefined, undefined, false);

    expect(result.status).toBe(APPLICATION_STATUSES.HANDLING);
  });

  it('uses the given id when no applicationData is provided', () => {
    const result = getApplication(undefined, 'app-id-123', true);

    expect(result.id).toBe('app-id-123');
  });

  it('converts an existing applicationData to camelCase Application with formatted dates', () => {
    const applicationData: Partial<ApplicationData> = {
      id: 'app-1',
      start_date: '2024-01-01',
      end_date: '2024-06-30',
      application_origin: APPLICATION_ORIGINS.HANDLER,
      paper_application_date: '2024-01-01',
      status: APPLICATION_STATUSES.HANDLING,
    };

    const result = getApplication(applicationData as ApplicationData);

    expect(result.id).toBe('app-1');
    expect(result.startDate).toBe('1.1.2024');
    expect(result.endDate).toBe('30.6.2024');
    expect(result.paperApplicationDate).toBe('1.1.2024');
  });

  it('sets paperApplicationDate to null when applicationOrigin is not HANDLER', () => {
    const applicationData: Partial<ApplicationData> = {
      id: 'app-2',
      start_date: '2024-01-01',
      end_date: '2024-06-30',
      application_origin: APPLICATION_ORIGINS.APPLICANT,
      paper_application_date: '2024-01-01',
    };

    const result = getApplication(applicationData as ApplicationData);

    expect(result.paperApplicationDate).toBeNull();
  });

  it('returns calculation as undefined when applicationData has no calculation', () => {
    const applicationData: Partial<ApplicationData> = {
      id: 'app-3',
      calculation: undefined,
    };

    const result = getApplication(applicationData as ApplicationData);

    expect(result.calculation).toBeUndefined();
  });

  it('formats calculation monetary fields as strings and preserves rows', () => {
    const applicationData: Partial<ApplicationData> = {
      id: 'app-4',
      calculation: {
        monthly_pay: '1234,50',
        other_expenses: '10',
        vacation_money: '20',
        override_monthly_benefit_amount: '99',
        rows: [
          { description_type: 'salary_costs' } as never,
          {} as never,
        ],
      } as never,
    };

    const result = getApplication(applicationData as ApplicationData);

    expect(result.calculation?.monthlyPay).toBe('1234.5');
    expect(result.calculation?.otherExpenses).toBe('10');
    expect(result.calculation?.vacationMoney).toBe('20');
    expect(result.calculation?.overrideMonthlyBenefitAmount).toBe('99');
    expect(result.calculation?.rows).toEqual([
      { descriptionType: 'salary_costs' },
      { descriptionType: null },
    ]);
  });

  it('sets overrideMonthlyBenefitAmount to null when not provided in calculation', () => {
    const applicationData: Partial<ApplicationData> = {
      id: 'app-5',
      calculation: {
        monthly_pay: '100',
        other_expenses: '0',
        vacation_money: '0',
        rows: [],
      } as never,
    };

    const result = getApplication(applicationData as ApplicationData);

    expect(result.calculation?.overrideMonthlyBenefitAmount).toBeNull();
  });

  it('defaults calculation rows to an empty array when rows are missing', () => {
    const applicationData: Partial<ApplicationData> = {
      id: 'app-6',
      calculation: {
        monthly_pay: '100',
        other_expenses: '0',
        vacation_money: '0',
      } as never,
    };

    const result = getApplication(applicationData as ApplicationData);

    expect(result.calculation?.rows).toEqual([]);
  });
});

describe('getFields', () => {
  it('returns a field definition for every top-level application field with translated labels', () => {
    const fields = getFields(t, 'application');

    expect(fields[APPLICATION_FIELD_KEYS.START_DATE]).toEqual({
      name: APPLICATION_FIELD_KEYS.START_DATE,
      label: `application.fields.${APPLICATION_FIELD_KEYS.START_DATE}.label`,
      placeholder: `application.fields.${APPLICATION_FIELD_KEYS.START_DATE}.placeholder`,
      mask: undefined,
    });
  });

  it('applies a bank account mask to the company bank account field', () => {
    const fields = getFields(t, 'application');
    const bankAccountField =
      fields[APPLICATION_FIELD_KEYS.COMPANY_BANK_ACCOUNT_NUMBER];

    expect(bankAccountField.mask).toBeDefined();
    expect(bankAccountField.mask?.format).toBe('FI99 9999 9999 9999 99');
    expect(bankAccountField.mask?.stripVal('FI99 9999 9999 9999 99')).toBe(
      'FI9999999999999999'
    );
  });

  it('builds nested employee field definitions', () => {
    const fields = getFields(t, 'application');
    const employeeFields = fields[APPLICATION_FIELD_KEYS.EMPLOYEE];

    expect(employeeFields).toBeDefined();
    expect(employeeFields.firstName).toEqual({
      name: `${APPLICATION_FIELD_KEYS.EMPLOYEE}.firstName`,
      label: 'application.fields.firstName.label',
      placeholder: 'application.fields.firstName.placeholder',
    });
  });

  it('uses the given translation section for label and placeholder keys', () => {
    const fields = getFields(t, 'customSection');

    expect(fields[APPLICATION_FIELD_KEYS.END_DATE].label).toBe(
      `customSection.fields.${APPLICATION_FIELD_KEYS.END_DATE}.label`
    );
  });
});

describe('handleErrorFieldKeys', () => {
  it('returns the given error field key unchanged when it is not EMPLOYEE', () => {
    const result = handleErrorFieldKeys(
      APPLICATION_FIELD_KEYS.START_DATE,
      {} as FormikErrors<unknown>
    );

    expect(result).toBe(APPLICATION_FIELD_KEYS.START_DATE);
  });

  it('appends the first employee error field key when errorFieldKey is EMPLOYEE', () => {
    const errs: FormikErrors<Application> = {
      employee: { firstName: 'Required' },
    } as never;

    const result = handleErrorFieldKeys(
      APPLICATION_FIELD_KEYS.EMPLOYEE,
      errs as FormikErrors<unknown>
    );

    expect(result).toBe(`${APPLICATION_FIELD_KEYS.EMPLOYEE}.firstName`);
  });

  it('handles no employee errors gracefully', () => {
    const errs: FormikErrors<Application> = {} as never;

    const result = handleErrorFieldKeys(
      APPLICATION_FIELD_KEYS.EMPLOYEE,
      errs as FormikErrors<unknown>
    );

    expect(result).toBe(`${APPLICATION_FIELD_KEYS.EMPLOYEE}.`);
  });
});

describe('getDates', () => {
  const baseValues = { ...APPLICATION_INITIAL_VALUES } as Application;

  it('computes minEndDate, maxEndDate and formatted minEndDate for a given startDate', () => {
    const values = {
      ...baseValues,
      startDate: '1.1.2024',
      endDate: '30.6.2024',
    } as Application;

    const result = getDates(values);

    expect(result.minEndDate).toBeInstanceOf(Date);
    expect(result.maxEndDate).toBeInstanceOf(Date);
    expect(result.minEndDateFormatted).toBe('1.1.2024');
    expect(result.isEndDateEligible).toBe(true);
  });

  it('marks the end date as not eligible when before the minimum end date (start date)', () => {
    const values = {
      ...baseValues,
      startDate: '1.1.2024',
      endDate: '31.12.2023',
    } as Application;

    const result = getDates(values);

    expect(result.isEndDateEligible).toBe(false);
  });

  it('marks the end date as not eligible when after the maximum end date', () => {
    const values = {
      ...baseValues,
      startDate: '1.1.2024',
      endDate: '1.1.2027',
    } as Application;

    const result = getDates(values);

    expect(result.isEndDateEligible).toBe(false);
  });

  it('returns a falsy isEndDateEligible when endDate is not a valid date', () => {
    const values = {
      ...baseValues,
      startDate: '1.1.2024',
      endDate: 'not-a-date',
    } as Application;

    const result = getDates(values);

    expect(result.isEndDateEligible).toBeFalsy();
  });

  it('falls back to the default application start date when startDate is empty', () => {
    const values = {
      ...baseValues,
      startDate: '',
      endDate: '',
    } as Application;

    const result = getDates(values);

    expect(result.minEndDate).toBeInstanceOf(Date);
    expect(result.maxEndDate).toBeInstanceOf(Date);
  });
});

describe('getSubsidyOptions', () => {
  it('maps each pay subsidy option to a label/value pair', () => {
    const options = getSubsidyOptions();

    expect(options).toEqual(
      PAY_SUBSIDY_OPTIONS.map((option) => ({
        label: `${option}%`,
        value: option,
      }))
    );
  });
});

const makeAttachment = (
  attachmentType: ATTACHMENT_TYPES
): BenefitAttachment => ({ attachmentType } as unknown as BenefitAttachment);

describe('requiredAttachments', () => {
  const baseValues = { ...APPLICATION_INITIAL_VALUES } as Application;

  it('requires full application and employment contract for new application', () => {
    expect(
      requiredAttachments(
        { ...baseValues, attachments: [] } as Application,
        true
      )
    ).toBe(false);

    expect(
      requiredAttachments(
        {
          ...baseValues,
          attachments: [makeAttachment(ATTACHMENT_TYPES.FULL_APPLICATION)],
        } as Application,
        true
      )
    ).toBe(false);

    expect(
      requiredAttachments(
        {
          ...baseValues,
          attachments: [
            makeAttachment(ATTACHMENT_TYPES.FULL_APPLICATION),
            makeAttachment(ATTACHMENT_TYPES.EMPLOYMENT_CONTRACT),
          ],
        } as Application,
        true
      )
    ).toBe(true);
  });

  it('does not require full application attachment when not a new application', () => {
    expect(
      requiredAttachments(
        {
          ...baseValues,
          attachments: [makeAttachment(ATTACHMENT_TYPES.EMPLOYMENT_CONTRACT)],
        } as Application,
        false
      )
    ).toBe(true);
  });

  it.each([
    [PAY_SUBSIDY_GRANTED.GRANTED, ATTACHMENT_TYPES.PAY_SUBSIDY_CONTRACT, true],
    [
      PAY_SUBSIDY_GRANTED.NOT_GRANTED,
      ATTACHMENT_TYPES.PAY_SUBSIDY_CONTRACT,
      false,
    ],
  ])(
    'requires pay subsidy decision attachment only when paySubsidyGranted=%s (requires %s: %s)',
    (subsidy, requiredType, shouldRequire) => {
      const baseAttachments = [
        makeAttachment(ATTACHMENT_TYPES.EMPLOYMENT_CONTRACT),
      ];
      const values = {
        ...baseValues,
        attachments: baseAttachments,
        paySubsidyGranted: subsidy,
      } as Application;

      expect(requiredAttachments(values, false)).toBe(!shouldRequire);

      if (shouldRequire) {
        const withAttachment = {
          ...values,
          attachments: [...baseAttachments, makeAttachment(requiredType)],
        } as Application;
        expect(requiredAttachments(withAttachment, false)).toBe(true);
      }
    }
  );

  it('requires education contract attachment when apprenticeshipProgram is true', () => {
    const baseAttachments = [
      makeAttachment(ATTACHMENT_TYPES.EMPLOYMENT_CONTRACT),
    ];
    const values = {
      ...baseValues,
      attachments: baseAttachments,
      apprenticeshipProgram: true,
    } as Application;

    expect(requiredAttachments(values, false)).toBe(false);

    expect(
      requiredAttachments(
        {
          ...values,
          attachments: [
            ...baseAttachments,
            makeAttachment(ATTACHMENT_TYPES.EDUCATION_CONTRACT),
          ],
        } as Application,
        false
      )
    ).toBe(true);
  });

  it.each([
    [APPLICATION_ORIGINS.APPLICANT, true],
    [APPLICATION_ORIGINS.HANDLER, false],
  ])(
    'requires employee consent attachment only when applicationOrigin=%s (required: %s)',
    (origin, shouldRequire) => {
      const baseAttachments = [
        makeAttachment(ATTACHMENT_TYPES.EMPLOYMENT_CONTRACT),
      ];
      const values = {
        ...baseValues,
        attachments: baseAttachments,
        applicationOrigin: origin,
      } as Application;

      expect(requiredAttachments(values, false)).toBe(!shouldRequire);

      if (shouldRequire) {
        expect(
          requiredAttachments(
            {
              ...values,
              attachments: [
                ...baseAttachments,
                makeAttachment(ATTACHMENT_TYPES.EMPLOYEE_CONSENT),
              ],
            } as Application,
            false
          )
        ).toBe(true);
      }
    }
  );

  it('returns false when attachments are undefined', () => {
    expect(
      requiredAttachments({ ...baseValues, attachments: undefined } as Application, false)
    ).toBe(false);
  });
});
